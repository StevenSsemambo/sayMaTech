import { useState, useEffect } from 'react'
import { ClipboardList, Check, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { notifyClient } from '../../lib/notifications'

const STATUS_STYLES = {
  pending: 'bg-gold/15 text-gold',
  approved: 'bg-savanna/15 text-savanna',
  declined: 'bg-terracotta/15 text-terracotta',
}

export default function RequestsPanel({ onApproved }) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('project_requests')
      .select('*, profiles(full_name, email)')
      .order('created_at', { ascending: false })
    setRequests(data || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function approve(req) {
    setBusyId(req.id)
    try {
      const { data: project } = await supabase
        .from('projects')
        .insert({
          client_id: req.client_id,
          name: req.title,
          description: req.ai_spec,
        })
        .select('id, budget')
        .single()

      await supabase.from('project_requests').update({ status: 'approved' }).eq('id', req.id)
      await notifyClient(req.client_id, 'request_approved', `Your project request "${req.title}" was approved and is now active!`)
      setRequests((rs) => rs.map((r) => (r.id === req.id ? { ...r, status: 'approved' } : r)))

      // Auto-draft an agreement — stays in 'draft' status, only visible to admin until sent
      if (project) {
        try {
          const res = await fetch('/.netlify/functions/generate-agreement', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectName: req.title, spec: req.ai_spec, budget: project.budget }),
          })
          const data = await res.json()
          if (data.content) {
            await supabase.from('agreements').insert({
              project_id: project.id,
              client_id: req.client_id,
              content: data.content,
            })
          }
        } catch (err) {
          console.error('Agreement draft failed:', err)
        }
      }

      onApproved?.()
    } finally {
      setBusyId(null)
    }
  }

  async function decline(req) {
    setBusyId(req.id)
    try {
      await supabase.from('project_requests').update({ status: 'declined' }).eq('id', req.id)
      await notifyClient(req.client_id, 'request_declined', `We reviewed your request "${req.title}" — let's chat about it further.`)
      setRequests((rs) => rs.map((r) => (r.id === req.id ? { ...r, status: 'declined' } : r)))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <ClipboardList size={16} className="text-terracotta" />
        <h2 className="font-display font-bold text-lg text-ink">Project requests</h2>
      </div>
      <p className="text-sm text-ink/50 mb-5">
        AI-organized specs from clients, ready for your review — approving creates the real project automatically.
      </p>

      {loading ? (
        <p className="text-ink/40 text-sm">Loading…</p>
      ) : requests.length === 0 ? (
        <div className="glass-panel-light rounded-2xl p-10 text-center">
          <p className="text-ink/50 text-sm">No requests yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <div key={r.id} className="glass-panel-light rounded-xl p-5">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display font-bold text-ink">{r.title}</h3>
                    <span className={`text-[10px] font-mono uppercase tracking-wide px-2 py-0.5 rounded-full ${STATUS_STYLES[r.status]}`}>
                      {r.status}
                    </span>
                  </div>
                  <p className="text-xs text-ink/40 mt-0.5">
                    {r.profiles?.full_name || r.profiles?.email} · {new Date(r.created_at).toLocaleDateString()}
                  </p>
                </div>
                {r.status === 'pending' && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => approve(r)}
                      disabled={busyId === r.id}
                      className="focus-ring flex items-center gap-1 text-xs bg-savanna text-ivory px-3 py-1.5 rounded-lg disabled:opacity-50"
                    >
                      <Check size={13} /> Approve
                    </button>
                    <button
                      onClick={() => decline(r)}
                      disabled={busyId === r.id}
                      className="focus-ring flex items-center gap-1 text-xs bg-ink/10 text-ink px-3 py-1.5 rounded-lg disabled:opacity-50"
                    >
                      <X size={13} /> Decline
                    </button>
                  </div>
                )}
              </div>
              <details className="mt-3">
                <summary className="text-xs text-terracotta cursor-pointer">View AI-organized spec</summary>
                <pre className="mt-2 text-xs text-ink/70 whitespace-pre-wrap font-sans bg-ivory-dim rounded-lg p-3">
                  {r.ai_spec}
                </pre>
              </details>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
