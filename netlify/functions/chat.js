// Netlify serverless function powering the "Ask SayMyTech" assistant.
// Calls the Anthropic API server-side so the API key never reaches the browser.
//
// SETUP: In your Netlify site settings → Environment variables, add:
//   ANTHROPIC_API_KEY = your key from console.anthropic.com

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
