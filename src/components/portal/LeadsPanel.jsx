import { useState, useEffect } from 'react'
import { Sparkles, Mail, User } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const URGENCY_STYLES = {
  high: 'bg-terracotta/15 text-terracotta',
  medium: 'bg-gold/15 text-gold',
  low: 'bg-ink/10 text-ink/50',
}

const STATUSES = ['new', 'contacted', 'archived']

export default function LeadsPanel() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
    setLeads(data || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function updateStatus(id, status) {
    await supabase.from('leads').update({ status }).eq('id', id)
    setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, status } : l)))
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <Sparkles size={16} className="text-terracotta" />
        <h2 className="font-display font-bold text-lg text-ink">AI-captured leads</h2>
      </div>
      <p className="text-sm text-ink/50 mb-5">
        Automatically extracted from "Ask SayMyTech" conversations — no manual entry.
      </p>

      {loading ? (
        <p className="text-ink/40 text-sm">Loading…</p>
      ) : leads.length === 0 ? (
        <div className="glass-panel-light rounded-2xl p-10 text-center">
          <p className="text-ink/50 text-sm">
            No leads captured yet — they'll show up here automatically once visitors chat with
            "Ask SayMyTech" about a project.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {leads.map((lead) => (
            <div key={lead.id} className="glass-panel-light rounded-xl p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-mono uppercase tracking-wide px-2 py-0.5 rounded-full ${URGENCY_STYLES[lead.urgency]}`}>
                      {lead.urgency} intent
                    </span>
                    {lead.category && (
                      <span className="text-[10px] font-mono uppercase tracking-wide text-ink/40">
                        {lead.category}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-ink/80 mt-1.5">{lead.summary}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-ink/40">
                    {lead.name && (
                      <span className="flex items-center gap-1">
                        <User size={12} /> {lead.name}
                      </span>
                    )}
                    {lead.email && (
                      <span className="flex items-center gap-1">
                        <Mail size={12} /> {lead.email}
                      </span>
                    )}
                    <span>{new Date(lead.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <select
                  value={lead.status}
                  onChange={(e) => updateStatus(lead.id, e.target.value)}
                  className="focus-ring text-xs font-mono uppercase border border-ink/15 rounded-lg px-2 py-1.5 shrink-0"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
