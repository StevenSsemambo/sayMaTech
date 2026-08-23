// Netlify serverless function that drafts a project agreement using Gemini.
// Called by the admin panel when a project request is approved. The output is
// always a DRAFT — an admin must review and explicitly send it before a client
// ever sees it (see the agreements table's status flow: draft -> sent -> accepted).

const GEMINI_MODEL = 'gemini-3.6-flash'
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

const SYSTEM_PROMPT = `You draft a plain-language project agreement for SayMyTech Developers ("It's Your Tech"),
an independent software development practice founded by Ssemambo Steven. IMPORTANT: SayMyTech
is not yet a formally registered/incorporated company — never write "Inc.", "Ltd.", "LLC", claim
a registration number, or imply formal incorporation. Refer to it as "SayMyTech Developers" or
"the developer" and to Steven as the founder/developer.

Write a clear, friendly-but-professional agreement in markdown with these sections:
1. **Project Overview** — one paragraph summarizing what's being built, based on the spec given.
2. **Scope & Deliverables** — bullet list of what's included, drawn directly from the spec.
3. **Timeline** — a general, non-committal estimate ("work will begin within X of acceptance,
   with regular updates via the client portal") — never invent a specific delivery date.
4. **Payment Terms** — reference the agreed budget if given; otherwise state that pricing will
   be confirmed separately. Mention that an invoice will be issued through the client portal.
5. **Revisions** — a reasonable, generic revisions policy (e.g. "reasonable revisions within the
   agreed scope are included; changes beyond scope may affect timeline or cost").
6. **Ownership** — once paid in full, the client owns the delivered work; SayMyTech may reference
   the project in its portfolio unless the client requests otherwise.
7. **Confidentiality** — both sides agree to keep shared project details confidential.
8. **Acceptance** — a short closing line noting that accepting these terms in the client portal
   confirms agreement to proceed.

Keep it grounded ONLY in the spec/budget given — never invent features, dates, or amounts not
provided. Keep total length moderate (roughly 300-450 words). Output plain markdown, no
preamble before section 1.`

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'GEMINI_API_KEY not configured' }) }
  }

  try {
    const { projectName, spec, budget } = JSON.parse(event.body)

    const userContent = `Project name: ${projectName}\n\nSpecification:\n${spec || 'No detailed spec provided.'}\n\nBudget: ${
      budget != null ? budget : 'Not yet set — reference that pricing will be confirmed separately.'
    }`

    const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: userContent }] }],
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        generationConfig: { maxOutputTokens: 900 },
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('Gemini error:', errText)
      return { statusCode: 502, body: JSON.stringify({ error: 'Failed to draft agreement' }) }
    }

    const data = await res.json()
    const content = data.candidates?.[0]?.content?.parts?.find((p) => p.text)?.text

    if (!content) {
      return { statusCode: 502, body: JSON.stringify({ error: 'No draft produced' }) }
    }

    return { statusCode: 200, body: JSON.stringify({ content }) }
  } catch (err) {
    console.error(err)
    return { statusCode: 500, body: JSON.stringify({ error: 'Unexpected error' }) }
  }
}
