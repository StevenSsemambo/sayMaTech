import { useState, useEffect } from 'react'
import { FileText, Send, Check, Loader2, RefreshCw } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/AuthContext'
import { notifyClient, notifyAdmin } from '../../lib/notifications'

export default function AgreementPanel({ projectId, projectName, projectSpec, projectBudget, clientId }) {
  const { user, isAdmin } = useAuth()
  const [agreement, setAgreement] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editText, setEditText] = useState('')
  const [editing, setEditing] = useState(false)
  const [busy, setBusy] = useState(false)
  const [checked, setChecked] = useState(false)

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('agreements')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    setAgreement(data || null)
    setEditText(data?.content || '')
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  async function generateDraft() {
    setBusy(true)
    try {
      const res = await fetch('/.netlify/functions/generate-agreement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectName, spec: projectSpec, budget: projectBudget }),
      })
      const data = await res.json()
      if (data.content) {
        const { data: inserted } = await supabase
          .from('agreements')
          .insert({ project_id: projectId, client_id: clientId, content: data.content })
          .select('*')
          .single()
        setAgreement(inserted)
        setEditText(inserted.content)
      }
    } finally {
      setBusy(false)
    }
  }

  async function saveEdit() {
    setBusy(true)
    try {
      await supabase.from('agreements').update({ content: editText, updated_at: new Date().toISOString() }).eq('id', agreement.id)
      setAgreement((a) => ({ ...a, content: editText }))
      setEditing(false)
    } finally {
      setBusy(false)
    }
  }

  async function send() {
    setBusy(true)
    try {
      await supabase.from('agreements').update({ status: 'sent' }).eq('id', agreement.id)
      await notifyClient(clientId, 'agreement', `A project agreement for "${projectName}" is ready for your review.`, projectId)
      setAgreement((a) => ({ ...a, status: 'sent' }))
    } finally {
      setBusy(false)
    }
  }

  async function accept() {
    setBusy(true)
    try {
      await supabase.rpc('accept_agreement', { p_agreement_id: agreement.id })
      await notifyAdmin('agreement_accepted', `Client accepted the agreement for "${projectName}"`, projectId)
      setAgreement((a) => ({ ...a, status: 'accepted', accepted_at: new Date().toISOString() }))
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <p className="text-xs text-ink/40">Loading agreement…</p>

  // --- Admin view ---
  if (isAdmin) {
    if (!agreement) {
      return (
        <button
          onClick={generateDraft}
          disabled={busy}
          className="focus-ring flex items-center gap-1.5 text-xs bg-ink text-ivory px-3 py-2 rounded-lg disabled:opacity-50"
        >
          {busy ? <Loader2 size={13} className="animate-spin" /> : <FileText size={13} />}
          {busy ? 'Drafting…' : 'Generate agreement draft'}
        </button>
      )
    }

    return (
      <div className="mt-3 bg-ivory-dim rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <FileText size={14} className="text-terracotta" />
            <span className="text-xs font-mono uppercase tracking-wide text-ink/50">Agreement</span>
            <span
              className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full ${
                agreement.status === 'accepted'
                  ? 'bg-savanna/15 text-savanna'
                  : agreement.status === 'sent'
                  ? 'bg-gold/15 text-gold'
                  : 'bg-ink/10 text-ink/50'
              }`}
            >
              {agreement.status}
            </span>
          </div>
          <div className="flex gap-2">
            {agreement.status === 'draft' && !editing && (
              <button onClick={() => setEditing(true)} className="focus-ring text-xs text-ink/50 hover:text-terracotta">
                Edit
              </button>
            )}
            <button onClick={generateDraft} disabled={busy} className="focus-ring text-xs text-ink/50 hover:text-terracotta flex items-center gap-1">
              <RefreshCw size={11} /> Regenerate
            </button>
          </div>
        </div>

        {editing ? (
          <>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={10}
              className="focus-ring w-full rounded-lg border border-ink/15 px-3 py-2 text-xs font-mono resize-y"
            />
            <div className="flex gap-2 mt-2">
              <button onClick={saveEdit} disabled={busy} className="focus-ring text-xs bg-ink text-ivory px-3 py-1.5 rounded-lg disabled:opacity-50">
                Save
              </button>
              <button onClick={() => setEditing(false)} className="focus-ring text-xs text-ink/50 px-3 py-1.5">
                Cancel
              </button>
            </div>
          </>
        ) : (
          <pre className="text-xs text-ink/70 whitespace-pre-wrap font-sans max-h-52 overflow-y-auto">{agreement.content}</pre>
        )}

        {agreement.status === 'draft' && !editing && (
          <button
            onClick={send}
            disabled={busy}
            className="focus-ring mt-3 flex items-center gap-1.5 text-xs bg-terracotta text-ivory px-3 py-2 rounded-lg disabled:opacity-50"
          >
            {busy ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
            Send to client
          </button>
        )}
        {agreement.status === 'accepted' && (
          <p className="text-xs text-savanna mt-2">
            Accepted {agreement.accepted_at ? new Date(agreement.accepted_at).toLocaleString() : ''}
          </p>
        )}
      </div>
    )
  }

  // --- Client view — only ever sees sent/accepted agreements (draft is invisible via RLS) ---
  if (!agreement) return null

  return (
    <div className="mt-3 bg-ivory-dim rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <FileText size={14} className="text-terracotta" />
        <span className="text-xs font-mono uppercase tracking-wide text-ink/50">Project agreement</span>
      </div>
      <pre className="text-xs text-ink/70 whitespace-pre-wrap font-sans max-h-64 overflow-y-auto">{agreement.content}</pre>

      {agreement.status === 'sent' && (
        <div className="mt-3 space-y-2">
          <label className="flex items-center gap-2 text-xs text-ink/70">
            <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} className="rounded" />
            I've read and agree to these terms
          </label>
          <button
            onClick={accept}
            disabled={!checked || busy}
            className="focus-ring flex items-center gap-1.5 text-xs bg-savanna text-ivory px-3 py-2 rounded-lg disabled:opacity-40"
          >
            {busy ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
            Accept agreement
          </button>
        </div>
      )}
      {agreement.status === 'accepted' && (
        <p className="text-xs text-savanna mt-3 flex items-center gap-1.5">
          <Check size={13} /> You accepted these terms{' '}
          {agreement.accepted_at ? `on ${new Date(agreement.accepted_at).toLocaleDateString()}` : ''}
        </p>
      )}
    </div>
  )
}
