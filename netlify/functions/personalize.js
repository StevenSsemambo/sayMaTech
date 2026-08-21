// Netlify serverless function powering adaptive homepage messaging.
// For a known returning visitor (identified by email, from customer_memory),
// generates a short personalized greeting and CTA using Gemini.
// Returns null quickly for unknown visitors — no AI call wasted.

import { createClient } from '@supabase/supabase-js'

const GEMINI_MODEL = 'gemini-3.6-flash'
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

function getSupabaseCreds() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return { url, key }
}

const GREETING_TOOLS = [
  {
    functionDeclarations: [
      {
        name: 'homepage_greeting',
        description: 'Produce a short personalized homepage greeting for a returning visitor.',
        parameters: {
          type: 'object',
          properties: {
            greeting: {
              type: 'string',
              description: 'One warm, specific sentence referencing what this visitor cares about, e.g. "Welcome back — still thinking about that pharmacy stock tracker?" Never generic. Max ~12 words.',
            },
            cta_label: {
              type: 'string',
              description: 'A short button label relevant to them, e.g. "Continue your project" or "Pick up where you left off". Max 4 words.',
            },
          },
          required: ['greeting', 'cta_label'],
        },
      },
    ],
  },
]

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const { visitorEmail } = JSON.parse(event.body)
    if (!visitorEmail) {
      return { statusCode: 200, body: JSON.stringify({ personalized: null }) }
    }

    const creds = getSupabaseCreds()
    const apiKey = process.env.GEMINI_API_KEY
    if (!creds || !apiKey) {
      return { statusCode: 200, body: JSON.stringify({ personalized: null }) }
    }

    const supabase = createClient(creds.url, creds.key)
    const { data, error } = await supabase.rpc('get_customer_memory', { p_email: visitorEmail })
    if (error || !data || data.length === 0 || !data[0].profile_summary) {
      return { statusCode: 200, body: JSON.stringify({ personalized: null }) }
    }

    const profile = data[0]
    const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `Known customer profile — name: ${profile.name || 'unknown'}, summary: ${profile.profile_summary}` }],
          },
        ],
        systemInstruction: {
          parts: [{ text: 'Call homepage_greeting to produce a short, warm, specific personalized greeting for this returning website visitor.' }],
        },
        tools: GREETING_TOOLS,
        toolConfig: { functionCallingConfig: { mode: 'ANY', allowedFunctionNames: ['homepage_greeting'] } },
        generationConfig: { maxOutputTokens: 150 },
      }),
    })

    if (!res.ok) {
      return { statusCode: 200, body: JSON.stringify({ personalized: null }) }
    }

    const geminiData = await res.json()
    const part = geminiData.candidates?.[0]?.content?.parts?.find((p) => p.functionCall)
    if (!part) {
      return { statusCode: 200, body: JSON.stringify({ personalized: null }) }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        personalized: {
          name: profile.name || null,
          greeting: part.functionCall.args.greeting,
          ctaLabel: part.functionCall.args.cta_label,
        },
      }),
    }
  } catch (err) {
    console.error(err)
    return { statusCode: 200, body: JSON.stringify({ personalized: null }) }
  }
}
