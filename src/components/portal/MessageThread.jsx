import { useState, useEffect, useRef } from 'react'
import { Send } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/AuthContext'

export default function MessageThread({ projectId }) {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const endRef = useRef(null)

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      const { data } = await supabase
        .from('messages')
        .select('id, content, created_at, sender_id, profiles(full_name, role)')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true })
      if (active) {
        setMessages(data || [])
        setLoading(false)
      }
    }
    load()

    const channel = supabase
      .channel(`messages-${projectId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `project_id=eq.${projectId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new])
        }
      )
      .subscribe()

    return () => {
      active = false
      supabase.removeChannel(channel)
    }
  }, [projectId])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send(e) {
    e.preventDefault()
    if (!text.trim()) return
    const content = text
    setText('')
    await supabase.from('messages').insert({ project_id: projectId, sender_id: user.id, content })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {loading ? (
          <p className="text-sm text-ink/40">Loading conversation…</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-ink/40">No messages yet — say hello.</p>
        ) : (
          messages.map((m) => {
            const isMine = m.sender_id === user.id
            return (
              <div
                key={m.id}
                className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  isMine ? 'bg-terracotta text-ivory ml-auto rounded-br-sm' : 'bg-ivory-dim text-ink rounded-bl-sm'
                }`}
              >
                {m.content}
              </div>
            )
          })
        )}
        <div ref={endRef} />
      </div>
      <form onSubmit={send} className="mt-3 flex items-center gap-2 border-t border-ink/10 pt-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message…"
          className="focus-ring flex-1 bg-ivory-dim rounded-lg px-3.5 py-2.5 text-sm text-ink"
        />
        <button
          type="submit"
          className="focus-ring bg-terracotta text-ivory rounded-lg p-2.5"
          aria-label="Send message"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  )
}
