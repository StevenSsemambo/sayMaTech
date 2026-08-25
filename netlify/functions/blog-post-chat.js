// Netlify serverless function for "Ask about this post" — a mini AI chat scoped
// ONLY to the content of one specific blog post, not the whole company knowledge base.

const GEMINI_MODEL = 'gemini-3.6-flash'
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return { statusCode: 200, body: JSON.stringify({ reply: "The assistant isn't configured right now." }) }
  }

  try {
    const { postTitle, postContent, question } = JSON.parse(event.body)

    const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: question }] }],
        systemInstruction: {
          parts: [
            {
              text: `You answer questions about ONE specific SayMyTech blog post titled "${postTitle}". Only use this post's content to answer — if the question is outside what this post covers, say so briefly and suggest checking the site's FAQ or chat instead. Keep answers short (2-3 sentences).\n\nPost content:\n${postContent}`,
            },
          ],
        },
        generationConfig: { maxOutputTokens: 250 },
      }),
    })

    if (!res.ok) {
      return { statusCode: 200, body: JSON.stringify({ reply: "Couldn't answer that just now — try again shortly." }) }
    }

    const data = await res.json()
    const reply = data.candidates?.[0]?.content?.parts?.find((p) => p.text)?.text || "Not sure — try rephrasing?"
    return { statusCode: 200, body: JSON.stringify({ reply }) }
  } catch (err) {
    console.error(err)
    return { statusCode: 200, body: JSON.stringify({ reply: 'Something went wrong.' }) }
  }
}
