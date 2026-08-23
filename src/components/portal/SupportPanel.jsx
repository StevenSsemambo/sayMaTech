import { useState, useEffect } from 'react'
import { LifeBuoy, Clock, AlertTriangle } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const CATEGORY_LABELS = {
  billing: 'Billing',
  technical: 'Technical',
  feedback: 'Feedback',
  general: 'General',
  urgent_issue: 'Urgent issue',
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  return `${days}d`
}

export default function SupportPanel() {
  const [awaiting, setAwaiting] = useState([])
  const [loading, setLoading] = useState(true)
  const [avgResponseHours, setAvgResponseHours] = useState(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data: msgs } = await supabase
        .from('messages')
        .select('id, project_id, content, category, urgency, created_at, sender_id, projects(name, client_id, profiles(full_name, email))')
        .order('created_at', { ascending: false })

      if (!msgs) {
        setLoading(false)
        return
      }

      // Latest message per project
      const latestByProject = {}
      for (const m of msgs) {
        if (!latestByProject[m.project_id]) latestByProject[m.project_id] = m
      }

      // "Awaiting response" = latest message was sent BY the client (not admin)
      const pending = Object.values(latestByProject).filter(
        (m) => m.projects && m.sender_id === m.projects.client_id
      )
      pending.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)) // oldest wait first
      setAwaiting(pending)

      // Rough average response time: for each project, find gaps between a client message
      // and the next admin message after it
      const responseTimes = []
      const byProject = {}
      for (const m of msgs) {
        if (!byProject[m.project_id]) byProject[m.project_id] = []
        byProject[m.project_id].push(m)
      }
      for (const projId in byProject) {
        const chrono = [...byProject[projId]].reverse() // oldest first
        const clientId = chrono[0]?.projects?.client_id
        for (let i = 0; i < chrono.length - 1; i++) {
          if (chrono[i].sender_id === clientId && chrono[i + 1].sender_id !== clientId) {
            const gap = (new Date(chrono[i + 1].created_at) - new Date(chrono[i].created_at)) / 3600000
            responseTimes.push(gap)
          }
        }
      }
      if (responseTimes.length > 0) {
        setAvgResponseHours(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <p className="text-ink/40 text-sm">Loading…</p>

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <LifeBuoy size={16} className="text-terracotta" />
        <h2 className="font-display font-bold text-lg text-ink">Support inbox</h2>
      </div>
      <p className="text-sm text-ink/50 mb-5">
        Client messages waiting on a reply, oldest first — auto-categorized so you can triage at a glance.
      </p>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div className="glass-panel-light rounded-xl p-5">
          <div className="w-9 h-9 rounded-lg bg-terracotta/15 flex items-center justify-center mb-3">
            <Clock size={16} className="text-terracotta" />
          </div>
          <p className="text-2xl font-display font-bold text-ink">
            {avgResponseHours != null ? `${avgResponseHours.toFixed(1)}h` : '—'}
          </p>
          <p className="text-xs text-ink/50 mt-1">Average response time</p>
        </div>
        <div className="glass-panel-light rounded-xl p-5">
          <div className="w-9 h-9 rounded-lg bg-gold/15 flex items-center justify-center mb-3">
            <AlertTriangle size={16} className="text-gold" />
          </div>
          <p className="text-2xl font-display font-bold text-ink">{awaiting.length}</p>
          <p className="text-xs text-ink/50 mt-1">Awaiting your response</p>
        </div>
      </div>

      {awaiting.length === 0 ? (
        <div className="glass-panel-light rounded-2xl p-10 text-center">
          <p className="text-ink/50 text-sm">Inbox zero — nothing waiting on you right now.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {awaiting.map((m) => {
            const overdue = Date.now() - new Date(m.created_at).getTime() > 24 * 3600000
            return (
              <div
                key={m.id}
                className={`glass-panel-light rounded-xl p-4 flex items-center justify-between gap-3 flex-wrap ${
                  overdue ? 'border border-terracotta/40' : ''
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-ink truncate">{m.projects?.name}</p>
                    {m.category && (
                      <span className="text-[10px] font-mono uppercase tracking-wide text-ink/40">
                        {CATEGORY_LABELS[m.category] || m.category}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-ink/50 truncate mt-0.5">{m.content}</p>
                  <p className="text-[11px] text-ink/35 mt-0.5">
                    {m.projects?.profiles?.full_name || m.projects?.profiles?.email}
                  </p>
                </div>
                <span className={`text-xs font-mono shrink-0 ${overdue ? 'text-terracotta' : 'text-ink/40'}`}>
                  waiting {timeAgo(m.created_at)}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
