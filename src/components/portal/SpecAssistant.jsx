import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, FileCheck, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/AuthContext'
import { notifyAdmin } from '../../lib/notifications'

export default function SpecAssistant({ onSubmitted }) {
  const { user } = useAuth()
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "Hi! Tell me about the software you want built — what problem it solves, who it's for, and any features you already have in mind. No need for technical language, just describe it like you would to a friend.",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [composing, setComposing] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send(text) {
    const content = text ?? input
    if (!content.trim() || loading) return
    const next = [...messages, { role: 'user', content }]
    setMessages(next)
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/.netlify/functions/spec-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      })
      const data = await res.json()
      setMessages([...next, { role: 'assistant', content: data.reply }])
    } catch {
      setMessages([...next, { role: 'assistant', content: "Something went wrong — try again in a moment." }])
    } finally {
      setLoading(false)
    }
  }

  async function composeAndSubmit() {
    setComposing(true)
    try {
      const res = await fetch('/.netlify/functions/spec-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, action: 'compose_spec' }),
      })
      const data = await res.json()
      if (!data.spec) {
        setMessages((m) => [...m, { role: 'assistant', content: data.error || "Let's chat a bit more first." }])
        setComposing(false)
        return
      }

      const rawDescription = messages
        .filter((m) => m.role === 'user')
        .map((m) => m.content)
        .join('\n')

      await supabase.from('project_requests').insert({
        client_id: user.id,
        title: data.spec.title,
        raw_description: rawDescription,
        ai_spec: data.spec.spec,
      })

      await notifyAdmin('project_request', `New project request: "${data.spec.title}"`)

      setSubmitted(true)
      onSubmitted?.()
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: "Couldn't submit that just now — try again." }])
    } finally {
      setComposing(false)
    }
  }

  if (submitted) {
    return (
      <div className="glass-panel-light rounded-2xl p-10 text-center">
        <FileCheck className="mx-auto text-savanna mb-3" size={32} />
        <p className="font-display font-bold text-ink text-lg">Request submitted!</p>
        <p className="text-sm text-ink/60 mt-1">
          We've organized what you told us into a spec and sent it to the team for review. You'll
          be notified once it's approved.
        </p>
      </div>
    )
  }

  return (
    <div className="glass-panel-light rounded-2xl flex flex-col h-[520px] overflow-hidden">
      <div className="bg-ink/95 text-ivory px-5 py-3.5 flex items-center gap-2">
        <Sparkles size={15} className="text-gold" />
        <p className="font-display font-semibold text-sm">Project Spec Assistant</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
              m.role === 'user' ? 'bg-terracotta text-ivory ml-auto rounded-br-sm' : 'bg-ivory-dim text-ink rounded-bl-sm'
            }`}
          >
            {m.content}
          </div>
        ))}
        {loading && (
          <div className="bg-ivory-dim text-ink/50 rounded-xl rounded-bl-sm px-3.5 py-2.5 text-sm w-fit">Thinking…</div>
        )}
        <div ref={endRef} />
      </div>

      <div className="border-t border-ink/10 p-3 space-y-2">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            send()
          }}
          className="flex items-center gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your project…"
            className="focus-ring flex-1 bg-ivory-dim rounded-lg px-3.5 py-2.5 text-sm text-ink"
          />
          <button
            type="submit"
            disabled={loading}
            className="focus-ring bg-terracotta text-ivory rounded-lg p-2.5 disabled:opacity-50"
            aria-label="Send"
          >
            <Send size={16} />
          </button>
        </form>
        {messages.filter((m) => m.role === 'user').length >= 2 && (
          <button
            onClick={composeAndSubmit}
            disabled={composing}
            className="focus-ring w-full flex items-center justify-center gap-1.5 text-xs font-medium text-savanna bg-savanna/10 py-2 rounded-lg disabled:opacity-50"
          >
            {composing ? <Loader2 size={13} className="animate-spin" /> : <FileCheck size={13} />}
            {composing ? 'Organizing your spec…' : "I'm ready — organize this into a request"}
          </button>
        )}
      </div>
    </div>
  )
}
