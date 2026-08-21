// Netlify serverless function powering the "Ask SayMyTech" assistant.
// Calls Google's Gemini API server-side (free tier) so the key never reaches the browser.
// Also auto-captures/scores leads and maintains a persistent per-customer memory,
// both in Supabase.
//
// SETUP: In Netlify env vars, set:
//   GEMINI_API_KEY = your key from aistudio.google.com
//   SUPABASE_URL (or VITE_SUPABASE_URL) = your Supabase project URL
//   SUPABASE_ANON_KEY (or VITE_SUPABASE_ANON_KEY) = your Supabase anon/publishable key
//
// To later switch to the real Claude API, replace callGemini()'s fetch with a call
// to https://api.anthropic.com/v1/messages — the rest of this file (prompt, lead
// extraction, memory, response shape) stays the same.

import { createClient } from '@supabase/supabase-js'

const GEMINI_MODEL = 'gemini-3.6-flash'
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

const BASE_SYSTEM_PROMPT = `You are the "Ask SayMyTech" assistant on the SayMyTech Developers website.

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

function getSupabaseCreds() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return { url, key }
}

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

// ---------- Lead capture ----------

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

async function extractAndStoreLead(contents, apiKey, supabase) {
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
    if (!lead.is_lead || !supabase) return

    await supabase.from('leads').insert({
      name: lead.name || null,
      email: lead.email || null,
      category: lead.category || null,
      urgency: lead.urgency || 'medium',
      summary: lead.summary,
      source: 'chat',
    })
  } catch (err) {
    console.error('Lead extraction failed:', err)
  }
}

// ---------- Persistent customer memory ----------

const MEMORY_TOOLS = [
  {
    functionDeclarations: [
      {
        name: 'update_customer_memory',
        description: 'Produce an updated profile summary for this visitor, merging any prior known profile with new information from this conversation.',
        parameters: {
          type: 'object',
          properties: {
            email: { type: 'string', description: 'The email this visitor is identified by (given now or already known). Empty if truly unknown.' },
            name: { type: 'string', description: "The visitor's name, if known." },
            updated_summary: {
              type: 'string',
              description: 'A concise (3-5 sentence), third-person, up-to-date profile: who they are, what they care about, project interests, preferences. Merge prior knowledge with anything new — do not just append.',
            },
          },
          required: ['updated_summary'],
        },
      },
    ],
  },
]

async function fetchCustomerMemory(email, supabase) {
  if (!email || !supabase) return null
  try {
    const { data, error } = await supabase.rpc('get_customer_memory', { p_email: email })
    if (error || !data || data.length === 0) return null
    return data[0]
  } catch (err) {
    console.error('Fetching customer memory failed:', err)
    return null
  }
}

async function updateCustomerMemory(contents, apiKey, supabase, knownEmail, existingProfile) {
  try {
    const priorContext = existingProfile
      ? `Existing known profile for this customer — name: ${existingProfile.name || 'unknown'}, summary: ${existingProfile.profile_summary}`
      : 'No prior profile exists for this customer yet.'

    const data = await callGemini(
      contents,
      `${priorContext}\n\nBased on this conversation, call update_customer_memory with an updated profile. Only worth updating if something meaningful was learned (name, project interest, preferences, recurring need). If an email wasn't given in this conversation and wasn't already known, leave email empty.`,
      apiKey,
      { tools: MEMORY_TOOLS, toolConfig: { functionCallingConfig: { mode: 'ANY', allowedFunctionNames: ['update_customer_memory'] } } }
    )

    const part = data.candidates?.[0]?.content?.parts?.find((p) => p.functionCall)
    if (!part || !supabase) return null
    const mem = part.functionCall.args
    const email = mem.email || knownEmail
    if (!email) return null

    await supabase.rpc('upsert_customer_memory', {
      p_email: email,
      p_name: mem.name || null,
      p_summary: mem.updated_summary,
    })
    return email
  } catch (err) {
    console.error('Customer memory update failed:', err)
    return null
  }
}

// ---------- Handler ----------

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

  const creds = getSupabaseCreds()
  const supabase = creds ? createClient(creds.url, creds.key) : null

  try {
    const { messages, visitorEmail } = JSON.parse(event.body)
    const contents = toGeminiContents(messages)

    // Look up any known profile for this returning visitor before replying
    const existingProfile = visitorEmail ? await fetchCustomerMemory(visitorEmail, supabase) : null

    let systemPrompt = BASE_SYSTEM_PROMPT
    if (existingProfile) {
      systemPrompt += `\n\nThis is a RETURNING visitor you already know. Known profile — name: ${
        existingProfile.name || 'unknown'
      }, summary: ${existingProfile.profile_summary}. Use this naturally to personalize your tone and suggestions — don't recite it back verbatim or make it obvious you're reading from a file.`
    }

    const data = await callGemini(contents, systemPrompt, apiKey)
    const reply =
      data.candidates?.[0]?.content?.parts?.find((p) => p.text)?.text ||
      "Sorry, I didn't catch that — could you rephrase?"

    let capturedEmail = null

    // Fire-and-forget lead + memory extraction once there's enough conversation to judge
    if (contents.length >= 2) {
      extractAndStoreLead(contents, apiKey, supabase)
      capturedEmail = await updateCustomerMemory(contents, apiKey, supabase, visitorEmail, existingProfile)
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        reply,
        visitorEmail: capturedEmail || visitorEmail || null,
        returning: !!existingProfile,
      }),
    }
  } catch (err) {
    console.error(err)
    return {
      statusCode: 502,
      body: JSON.stringify({ reply: 'Something went wrong on our end — please try again shortly.' }),
    }
  }
}
