// Netlify serverless function that auto-tags a client-portal message with a
// category and urgency, using Gemini's free tier. Fire-and-forget from the
// frontend right after a message is sent — never blocks the send itself.

const GEMINI_MODEL = 'gemini-3.6-flash'
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

const CLASSIFY_TOOLS = [
  {
    functionDeclarations: [
      {
        name: 'classify_message',
        description: 'Classify a support/project message by topic category and urgency.',
        parameters: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              enum: ['billing', 'technical', 'feedback', 'general', 'urgent_issue'],
              description: 'The best-fit topic for this message.',
            },
            urgency: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
              description: 'How time-sensitive this message seems.',
            },
          },
          required: ['category', 'urgency'],
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
    return { statusCode: 200, body: JSON.stringify({ category: null, urgency: null }) }
  }

  try {
    const { content } = JSON.parse(event.body)
    const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: content }] }],
        systemInstruction: { parts: [{ text: 'Classify this message using classify_message.' }] },
        tools: CLASSIFY_TOOLS,
        toolConfig: { functionCallingConfig: { mode: 'ANY', allowedFunctionNames: ['classify_message'] } },
        generationConfig: { maxOutputTokens: 80 },
      }),
    })

    if (!res.ok) {
      return { statusCode: 200, body: JSON.stringify({ category: null, urgency: null }) }
    }

    const data = await res.json()
    const part = data.candidates?.[0]?.content?.parts?.find((p) => p.functionCall)
    if (!part) {
      return { statusCode: 200, body: JSON.stringify({ category: null, urgency: null }) }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ category: part.functionCall.args.category, urgency: part.functionCall.args.urgency }),
    }
  } catch (err) {
    console.error(err)
    return { statusCode: 200, body: JSON.stringify({ category: null, urgency: null }) }
  }
}
