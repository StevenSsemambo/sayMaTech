// Netlify serverless function powering the "Ask SayMyTech" assistant.
// Calls the Anthropic API server-side so the API key never reaches the browser.
// Also auto-captures and scores leads from conversations into Supabase.
//
// SETUP: In Netlify env vars, set:
//   ANTHROPIC_API_KEY = your key from console.anthropic.com
//   SUPABASE_URL = your Supabase project URL
//   SUPABASE_ANON_KEY = your Supabase anon/publishable key

import { createClient } from '@supabase/supabase-js'

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

const LEAD_EXTRACTION_TOOL = {
  name: 'extract_lead',
  description: 'Extract lead information from the conversation so far, if the visitor shows genuine interest in hiring SayMyTech for a project.',
  input_schema: {
    type: 'object',
    properties: {
      is_lead: {
        type: 'boolean',
        description: 'True only if the visitor has expressed real interest in a paid project (not just browsing products or asking general questions).',
      },
      name: { type: 'string', description: 'The visitor\'s name, if they gave it. Empty string if not given.' },
      email: { type: 'string', description: 'The visitor\'s email, if they gave it. Empty string if not given.' },
      category: { type: 'string', description: 'Short category of what they want built, e.g. "e-commerce app", "AI chatbot", "internal tool".' },
      urgency: { type: 'string', enum: ['low', 'medium', 'high'], description: 'How urgent/ready-to-buy they seem. High = clear budget+timeline+intent. Low = casually curious.' },
      summary: { type: 'string', description: 'One or two sentence summary of what they want, for the founder to read quickly.' },
    },
    required: ['is_lead', 'summary'],
  },
}

async function extractAndStoreLead(anthropicMessages, apiKey) {
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 300,
        system: 'Analyze this website chat conversation and extract lead information using the extract_lead tool. Only mark is_lead true if there is genuine project/hiring interest.',
        messages: anthropicMessages,
        tools: [LEAD_EXTRACTION_TOOL],
        tool_choice: { type: 'tool', name: 'extract_lead' },
      }),
    })
    if (!res.ok) return

    const data = await res.json()
    const toolUse = data.content?.find((b) => b.type === 'tool_use')
    if (!toolUse) return
    const lead = toolUse.input

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

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        reply:
          "The assistant isn't fully configured yet — the site owner needs to add an ANTHROPIC_API_KEY in Netlify's environment variables.",
      }),
    }
  }

  try {
    const { messages } = JSON.parse(event.body)

    const anthropicMessages = messages.map((m) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    }))

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 400,
        system: SYSTEM_PROMPT,
        messages: anthropicMessages,
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('Anthropic API error:', errText)
      return {
        statusCode: 502,
        body: JSON.stringify({ reply: "Something went wrong on our end — please try again shortly." }),
      }
    }

    const data = await res.json()
    const reply = data.content?.find((b) => b.type === 'text')?.text || "Sorry, I didn't catch that — could you rephrase?"

    // Fire-and-forget lead extraction — only bother once there's enough conversation to judge intent
    if (anthropicMessages.length >= 2) {
      extractAndStoreLead(anthropicMessages, apiKey)
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ reply }),
    }
  } catch (err) {
    console.error(err)
    return {
      statusCode: 500,
      body: JSON.stringify({ reply: 'Unexpected error — please try again.' }),
    }
  }
}
