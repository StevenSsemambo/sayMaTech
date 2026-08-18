import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Sparkles } from 'lucide-react'

const SUGGESTIONS = [
  'I want to build an app for my business',
  'Which product helps with student learning?',
  'Do you build offline apps?',
]

export default function AskSayMyTech() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "Hey — I'm the SayMyTech assistant. Ask me about our products, or tell me what you're trying to build and I'll help scope it out.",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  async function send(text) {
    const content = text ?? input
    if (!content.trim() || loading) return
    const next = [...messages, { role: 'user', content }]
    setMessages(next)
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      })
      if (!res.ok) throw new Error('Request failed')
      const data = await res.json()
      setMessages([...next, { role: 'assistant', content: data.reply }])
    } catch (err) {
      setMessages([
        ...next,
        {
          role: 'assistant',
          content:
            "I couldn't reach the server just now. Please try again in a moment, or use the contact form below.",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <motion.button
        onClick={() => setOpen(!open)}
        className="focus-ring glow-border fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-terracotta text-ivory rounded-full pl-4 pr-5 py-3.5 shadow-xl shadow-terracotta/30"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gold" />
        </span>
        {open ? <X size={18} /> : <MessageCircle size={18} />}
        <span className="text-sm font-medium">{open ? 'Close' : 'Ask SayMyTech'}</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="glass-panel-light fixed bottom-24 right-6 z-50 w-[92vw] max-w-sm h-[70vh] max-h-[560px] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="bg-ink/95 backdrop-blur-sm text-ivory px-5 py-4 flex items-center gap-2">
              <Sparkles size={16} className="text-gold" />
              <div>
                <p className="font-display font-semibold text-sm">Ask SayMyTech</p>
                <p className="text-xs text-ivory/50">Products &amp; project scoping</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-terracotta text-ivory ml-auto rounded-br-sm'
                      : 'bg-ivory-dim text-ink rounded-bl-sm'
                  }`}
                >
                  {m.content}
                </div>
              ))}
              {loading && (
                <div className="bg-ivory-dim text-ink/50 rounded-xl rounded-bl-sm px-3.5 py-2.5 text-sm w-fit">
                  Thinking…
                </div>
              )}
              <div ref={endRef} />
            </div>

            {messages.length === 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="focus-ring text-xs bg-ivory-dim hover:bg-ink/10 text-ink/70 rounded-full px-3 py-1.5 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault()
                send()
              }}
              className="border-t border-ink/10 p-3 flex items-center gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message…"
                className="focus-ring flex-1 bg-ivory-dim rounded-lg px-3.5 py-2.5 text-sm text-ink"
              />
              <button
                type="submit"
                disabled={loading}
                className="focus-ring bg-terracotta text-ivory rounded-lg p-2.5 disabled:opacity-50"
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
