// Netlify serverless function powering the client-portal "Project Spec Assistant".
// Interviews a logged-in client about what they want built, and produces a
// structured specification (features, use cases, notes) for the developer to review.
//
// Uses the same Gemini free-tier setup as chat.js. See that file for env var setup.

const GEMINI_MODEL = 'gemini-3.6-flash'
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

const SYSTEM_PROMPT = `You are the SayMyTech "Project Spec Assistant" inside the client portal.
You are talking to a logged-in client who wants to describe a software project in their own
plain language. Your job is to interview them like a skilled business analyst:

1. Ask short, focused questions (one or two at a time, never a huge list at once) to understand:
   - What problem they're solving and who it's for
   - The core features/screens they need
   - Any must-have vs nice-to-have distinction
   - Rough timeline or urgency
   - Anything they've seen elsewhere that inspired this idea

2. Keep the tone warm, plain-spoken, encouraging — they are not expected to know technical
   terms. Translate their language into structure yourself, don't ask them to be technical.

3. Once you have enough (usually after 4-6 exchanges), tell them you have enough to put
   together a first draft specification, and ask them to confirm they're ready to submit it
   for review.

Never invent pricing, timelines, or commitments — that's for the founder to follow up on.
Keep each reply to 2-4 sentences.`

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
      generationConfig: { maxOutputTokens: 600 },
      ...extraConfig,
    }),
  })
  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Gemini API error (${res.status}): ${errText}`)
  }
  return res.json()
}

const SPEC_TOOLS = [
  {
    functionDeclarations: [
      {
        name: 'compose_spec',
        description: 'Compose a structured project specification from the conversation, for a developer to review.',
        parameters: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'Short project title, e.g. "Pharmacy Inventory & Expiry Tracker".' },
            spec: {
              type: 'string',
              description:
                'A well-organized specification in markdown: an Overview section, a Core Features section (bulleted), a Use Cases section (numbered scenarios of who does what), and a Notes/Constraints section (timeline, must-have vs nice-to-have). Written for a programmer to read, based only on what the client actually said — never invent features they did not mention.',
            },
          },
          required: ['title', 'spec'],
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
    return {
      statusCode: 500,
      body: JSON.stringify({ reply: "The assistant isn't configured yet — missing GEMINI_API_KEY." }),
    }
  }

  try {
    const { messages, action } = JSON.parse(event.body)
    const contents = toGeminiContents(messages)

    if (action === 'compose_spec') {
      // Client confirmed they're ready — generate the final structured spec
      const data = await callGemini(
        contents,
        'Based on this whole conversation, call compose_spec with the final structured specification.',
        apiKey,
        { tools: SPEC_TOOLS, toolConfig: { functionCallingConfig: { mode: 'ANY', allowedFunctionNames: ['compose_spec'] } } }
      )
      const part = data.candidates?.[0]?.content?.parts?.find((p) => p.functionCall)
      if (!part) {
        return { statusCode: 200, body: JSON.stringify({ error: 'Could not compose a spec yet — keep chatting a bit more.' }) }
      }
      return { statusCode: 200, body: JSON.stringify({ spec: part.functionCall.args }) }
    }

    // Normal conversational turn
    const data = await callGemini(contents, SYSTEM_PROMPT, apiKey)
    const reply =
      data.candidates?.[0]?.content?.parts?.find((p) => p.text)?.text ||
      "Could you tell me a bit more about what you have in mind?"

    return { statusCode: 200, body: JSON.stringify({ reply }) }
  } catch (err) {
    console.error(err)
    return {
      statusCode: 502,
      body: JSON.stringify({ reply: 'Something went wrong — please try again shortly.' }),
    }
  }
}
