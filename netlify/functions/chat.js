// Netlify serverless function powering the "Ask SayMyTech" assistant.
// Calls Google's Gemini API server-side (free tier) so the key never reaches the browser.
// Also auto-captures and scores leads from conversations into Supabase.
//
// SETUP: In Netlify env vars, set:
//   GEMINI_API_KEY = your key from aistudio.google.com
//   SUPABASE_URL = your Supabase project URL
//   SUPABASE_ANON_KEY = your Supabase anon/publishable key
//
// To later switch to the real Claude API, replace callGemini()'s fetch with a call
// to https://api.anthropic.com/v1/messages — the rest of this file (prompt, lead
// extraction, response shape) stays the same.

import { createClient } from '@supabase/supabase-js'

const GEMINI_MODEL = 'gemini-2.5-flash'
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

const SYSTEM_PROMPT = `You are the "Ask SayMyTech" assistant on the SayMyTech Developers website.

SayMyTech Developers ("It's Your Tech") is a software studio founded by Ssemambo Steven,
a self-taught programmer and Computer Science graduate / Lecturing Assistant at Makerere
University. The studio builds AI-integrated software that solves real, everyday problems —
for study, money, health, communication, and work — for anyone, anywhere. It is not limited
to any one region or market.

Vision: To build software that transforms the world.
Mission: To design and build AI-integrated software that solves real, everyday problems —
for study, money, health, communication, and work — for anyone, anywhere.

Product line (mention only what's relevant to the visitor's question):
- EliAi (Elimu Learn): learning app for secondary school students
- StudyFellow: AI video learning companion
- YoSacco: savings and cooperative group finance management
- ProfitMind AI: POS, stock and finance with a rule-based AI advisor for small businesses
- SayMyDoc: everyday health companion
- GasWatch Pro: IoT LPG gas leak monitoring
- Leafy: fast, lightweight messaging for low-bandwidth conditions
- YoSpeech: speech coaching for stuttering and public speaking
- PipStart: practical forex education
- YoRemind: category-aware reminders (debts, medicine, meetings, etc.)
- Poultry Farm Manager: offline desktop app for poultry farms
- YoTrade: binary options practice/performance tracker

You have two jobs:
1. Help visitors find the right product for their need, and point them to it.
2. Help potential clients scope a project: ask 2-3 short clarifying questions about what
   they want to build, their timeline, and rough budget range, then summarize it back to
   them clearly so they can confirm before submitting the contact form.

Keep replies short (2-4 sentences), warm, plain-spoken, and confident — never generic
corporate tone. Never invent pricing, timelines, or promises on Steven's behalf beyond
"we'll follow up with specifics." If asked something you don't know, say so and point them
to the contact form.`

function toGeminiContents(messages) {
  return messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))
}

async function callGemini(contents, systemInstruction, apiKey, extraConfig = {}) {
  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      systemInstruction: { parts: [{ text: systemInstruction }] },
      generationConfig: { maxOutputTokens: 500 },
      ...extraConfig,
    }),
  })
  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Gemini API error (${res.status}): ${errText}`)
  }
  return res.json()
}

const LEAD_EXTRACTION_TOOLS = [
  {
    functionDeclarations: [
      {
        name: 'extract_lead',
        description: 'Extract lead information from the conversation, if the visitor shows genuine interest in hiring SayMyTech for a project.',
        parameters: {
          type: 'object',
          properties: {
            is_lead: { type: 'boolean', description: 'True only if the visitor expressed real interest in a paid project (not just browsing or general questions).' },
            name: { type: 'string', description: "The visitor's name, if given." },
            email: { type: 'string', description: "The visitor's email, if given." },
            category: { type: 'string', description: 'Short category of what they want built, e.g. "e-commerce app", "AI chatbot".' },
            urgency: { type: 'string', enum: ['low', 'medium', 'high'], description: 'How ready-to-buy they seem.' },
            summary: { type: 'string', description: 'One or two sentence summary for the founder to read quickly.' },
          },
          required: ['is_lead', 'summary'],
        },
      },
    ],
  },
]

async function extractAndStoreLead(contents, apiKey) {
  try {
    const data = await callGemini(
      contents,
      'Analyze this website chat conversation and extract lead information using the extract_lead function. Only mark is_lead true if there is genuine project/hiring interest.',
      apiKey,
      { tools: LEAD_EXTRACTION_TOOLS, toolConfig: { functionCallingConfig: { mode: 'ANY', allowedFunctionNames: ['extract_lead'] } } }
    )

    const part = data.candidates?.[0]?.content?.parts?.find((p) => p.functionCall)
    if (!part) return
    const lead = part.functionCall.args
    if (!lead.is_lead) return

    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_ANON_KEY
    if (!supabaseUrl || !supabaseKey) return

    const supabase = createClient(supabaseUrl, supabaseKey)
    await supabase.from('leads').insert({
      name: lead.name || null,
      email: lead.email || null,
      category: lead.category || null,
      urgency: lead.urgency || 'medium',
      summary: lead.summary,
      source: 'chat',
    })
  } catch (err) {
    // Lead capture is best-effort — never let it break the chat reply
    console.error('Lead extraction failed:', err)
  }
}

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        reply:
          "The assistant isn't fully configured yet — the site owner needs to add a GEMINI_API_KEY in Netlify's environment variables.",
      }),
    }
  }

  try {
    const { messages } = JSON.parse(event.body)
    const contents = toGeminiContents(messages)

    const data = await callGemini(contents, SYSTEM_PROMPT, apiKey)
    const reply =
      data.candidates?.[0]?.content?.parts?.find((p) => p.text)?.text ||
      "Sorry, I didn't catch that — could you rephrase?"

    // Fire-and-forget lead extraction once there's enough conversation to judge intent
    if (contents.length >= 2) {
      extractAndStoreLead(contents, apiKey)
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ reply }),
    }
  } catch (err) {
    console.error(err)
    return {
      statusCode: 200,
      body: JSON.stringify({ reply: `[debug] ${err.message}` }),
    }
  }
}
