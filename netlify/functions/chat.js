// Netlify serverless function powering the "Ask SayMyTech" assistant.
// Calls the Anthropic API server-side so the API key never reaches the browser.
//
// SETUP: In your Netlify site settings → Environment variables, add:
//   ANTHROPIC_API_KEY = your key from console.anthropic.com

const SYSTEM_PROMPT = `You are the "Ask SayMyTech" assistant on the SayMyTech Developers website.

SayMyTech Developers is a Kampala, Uganda-based software studio founded by Ssemambo Steven,
a self-taught programmer and Computer Science graduate / Lecturing Assistant at Makerere
University. The studio builds African-first, offline-first, mobile-first software — PWAs,
AI-integrated apps, and custom systems — designed for real African connectivity and device
constraints.

Product line (mention only what's relevant to the visitor's question):
- EliAi (Elimu Learn): offline-first learning app for Ugandan S1–S6 students
- StudyFellow: AI video learning companion
- YoSacco: offline-first SACCO management for Emyooga/PDM/OWC groups
- ProfitMind AI: offline supermarket POS, stock and finance with a rule-based AI advisor
- SayMyDoc: offline health companion
- GasWatch Pro: IoT LPG gas leak monitoring
- Leafy: WhatsApp-style low-bandwidth messaging
- YoSpeech: speech coaching for stuttering and public speaking
- PipStart: forex education for African traders
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
