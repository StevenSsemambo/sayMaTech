import { useState, useEffect } from 'react'
import { History } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function AuditLogPanel() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data } = await supabase
        .from('audit_log')
        .select('*, profiles(full_name, email)')
        .order('created_at', { ascending: false })
        .limit(100)
      setEntries(data || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <p className="text-ink/40 text-sm">Loading…</p>

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <History size={16} className="text-terracotta" />
        <h2 className="font-display font-bold text-lg text-ink">Audit trail</h2>
      </div>
      <p className="text-sm text-ink/50 mb-5">Who changed what, when — the last 100 actions.</p>

      {entries.length === 0 ? (
        <p className="text-ink/40 text-sm">No activity logged yet.</p>
      ) : (
        <div className="space-y-1.5">
          {entries.map((e) => (
            <div key={e.id} className="flex items-center justify-between text-xs glass-panel-light rounded-lg px-3.5 py-2.5">
              <div>
                <span className="text-ink/70">{e.action.replace(/_/g, ' ')}</span>
                {e.details && <span className="text-ink/40"> — {e.details}</span>}
              </div>
              <div className="flex items-center gap-3 text-ink/35 shrink-0 ml-3">
                <span>{e.profiles?.full_name || e.profiles?.email || 'system'}</span>
                <span>{new Date(e.created_at).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
