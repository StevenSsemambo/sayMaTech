// Netlify serverless function that drafts a blog post from admin-supplied bullet
// points/topic, grounded in the real FAQ knowledge base. Output is always a DRAFT
// the admin reviews and edits before publishing.

import { createClient } from '@supabase/supabase-js'

const GEMINI_MODEL = 'gemini-3.6-flash'
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

function getSupabaseCreds() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return { url, key }
}

async function fetchFaqGrounding(supabase) {
  if (!supabase) return ''
  try {
    const { data } = await supabase.from('faq_entries').select('question, answer').limit(30)
    if (!data || data.length === 0) return ''
    const lines = data.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n')
    return `\n\nCompany knowledge base — use as ground truth if relevant:\n${lines}`
  } catch {
    return ''
  }
}

const POST_TOOLS = [
  {
    functionDeclarations: [
      {
        name: 'compose_post',
        description: 'Compose a complete blog post from the given topic/bullet points.',
        parameters: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'A specific, compelling title (not generic).' },
            slug: { type: 'string', description: 'URL-friendly slug, lowercase-with-hyphens, derived from the title.' },
            excerpt: { type: 'string', description: 'A 1-2 sentence teaser for the post list page.' },
            category: { type: 'string', description: 'Short category, e.g. "Engineering", "Product", "Africa Tech".' },
            content: {
              type: 'string',
              description:
                'The full post body in plain markdown-style text (## for headings, - for bullets). Warm, plain-spoken, specific — grounded only in the topic/notes given, never inventing facts about SayMyTech not provided. Roughly 500-800 words.',
            },
            social_share_text: { type: 'string', description: 'A short, punchy 1-2 sentence blurb ready to post on social media announcing this article.' },
          },
          required: ['title', 'slug', 'excerpt', 'category', 'content', 'social_share_text'],
        },
      },
    ],
  },
]

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'GEMINI_API_KEY not configured' }) }
  }

  try {
    const { topic } = JSON.parse(event.body)
    const creds = getSupabaseCreds()
    const supabase = creds ? createClient(creds.url, creds.key) : null
    const grounding = await fetchFaqGrounding(supabase)

    const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: `Topic/notes for the post:\n${topic}${grounding}` }] }],
        systemInstruction: {
          parts: [{ text: 'You are drafting a blog post for SayMyTech Developers ("It\'s Your Tech"), a software studio. Call compose_post with the full drafted post.' }],
        },
        tools: POST_TOOLS,
        toolConfig: { functionCallingConfig: { mode: 'ANY', allowedFunctionNames: ['compose_post'] } },
        generationConfig: { maxOutputTokens: 1400 },
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('Gemini error:', errText)
      return { statusCode: 502, body: JSON.stringify({ error: 'Failed to draft post' }) }
    }

    const data = await res.json()
    const part = data.candidates?.[0]?.content?.parts?.find((p) => p.functionCall)
    if (!part) {
      return { statusCode: 502, body: JSON.stringify({ error: 'No draft produced' }) }
    }

    return { statusCode: 200, body: JSON.stringify({ post: part.functionCall.args }) }
  } catch (err) {
    console.error(err)
    return { statusCode: 500, body: JSON.stringify({ error: 'Unexpected error' }) }
  }
}
