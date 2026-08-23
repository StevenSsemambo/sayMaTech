import { useState, useEffect, useRef } from 'react'
import { Send, Image as ImageIcon, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/AuthContext'
import { notifyAdmin, notifyClient } from '../../lib/notifications'

const CATEGORY_LABELS = {
  billing: 'Billing',
  technical: 'Technical',
  feedback: 'Feedback',
  general: 'General',
  urgent_issue: 'Urgent issue',
}

const URGENCY_STYLES = {
  high: 'text-terracotta',
  medium: 'text-gold',
  low: 'text-ink/30',
}

async function classifyMessage(content, messageId) {
  try {
    const res = await fetch('/.netlify/functions/classify-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })
    const data = await res.json()
    if (data.category) {
      await supabase.from('messages').update({ category: data.category, urgency: data.urgency }).eq('id', messageId)
    }
  } catch (err) {
    console.error('Message classification failed:', err)
  }
}

export default function MessageThread({ projectId }) {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [clientId, setClientId] = useState(null)
  const [projectName, setProjectName] = useState('')
  const endRef = useRef(null)
  const fileRef = useRef(null)

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      const [{ data }, { data: proj }] = await Promise.all([
        supabase
          .from('messages')
          .select('id, content, image_url, category, urgency, created_at, sender_id, profiles(full_name, role)')
          .eq('project_id', projectId)
          .order('created_at', { ascending: true }),
        supabase.from('projects').select('client_id, name').eq('id', projectId).single(),
      ])
      if (active) {
        setMessages(data || [])
        setClientId(proj?.client_id || null)
        setProjectName(proj?.name || '')
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
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages', filter: `project_id=eq.${projectId}` },
        (payload) => {
          setMessages((prev) => prev.map((m) => (m.id === payload.new.id ? { ...m, ...payload.new } : m)))
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

  async function notifyOtherParty(preview) {
    if (!clientId) return
    if (user.id === clientId) {
      await notifyAdmin('message', `New message on "${projectName}": ${preview}`, projectId)
    } else {
      await notifyClient(clientId, 'message', `New message on "${projectName}": ${preview}`, projectId)
    }
  }

  async function send(e) {
    e.preventDefault()
    if (!text.trim()) return
    const content = text
    setText('')
    const { data: inserted } = await supabase
      .from('messages')
      .insert({ project_id: projectId, sender_id: user.id, content })
      .select('id')
      .single()
    notifyOtherParty(content.slice(0, 60))

    // Only classify incoming client messages — that's what admin needs to triage
    if (inserted && user.id === clientId) {
      classifyMessage(content, inserted.id)
    }
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const path = `${projectId}/${Date.now()}-${file.name}`
      const { error: uploadErr } = await supabase.storage.from('project-screenshots').upload(path, file)
      if (uploadErr) throw uploadErr
      const { data: urlData } = supabase.storage.from('project-screenshots').getPublicUrl(path)

      await supabase.from('messages').insert({
        project_id: projectId,
        sender_id: user.id,
        content: '📷 Shared a screenshot',
        image_url: urlData.publicUrl,
      })
      notifyOtherParty('shared a screenshot')
    } catch (err) {
      console.error('Upload failed:', err)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
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
              <div key={m.id} className={isMine ? 'ml-auto max-w-[80%]' : 'max-w-[80%]'}>
                {m.category && !isMine && (
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className={`text-[10px] font-mono uppercase tracking-wide ${URGENCY_STYLES[m.urgency] || 'text-ink/30'}`}>
                      {CATEGORY_LABELS[m.category] || m.category}
                    </span>
                  </div>
                )}
                <div
                  className={`rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    isMine ? 'bg-terracotta text-ivory rounded-br-sm' : 'bg-ivory-dim text-ink rounded-bl-sm'
                  }`}
                >
                  {m.image_url && (
                    <img
                      src={m.image_url}
                      alt="Shared screenshot"
                      className="rounded-lg mb-1.5 max-h-56 w-full object-cover"
                      loading="lazy"
                    />
                  )}
                  {m.content}
                </div>
              </div>
            )
          })
        )}
        <div ref={endRef} />
      </div>
      <form onSubmit={send} className="mt-3 flex items-center gap-2 border-t border-ink/10 pt-3">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id={`file-${projectId}`}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="focus-ring text-ink/40 hover:text-terracotta shrink-0"
          aria-label="Attach screenshot"
        >
          {uploading ? <Loader2 size={18} className="animate-spin" /> : <ImageIcon size={18} />}
        </button>
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
