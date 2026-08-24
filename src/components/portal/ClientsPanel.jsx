import { useState, useEffect } from 'react'
import { Users } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function ClientsPanel() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [{ data: profiles }, { data: projects }] = await Promise.all([
        supabase.from('profiles').select('*').eq('role', 'client').order('created_at', { ascending: false }),
        supabase.from('projects').select('id, client_id'),
      ])
      const counts = {}
      for (const p of projects || []) {
        counts[p.client_id] = (counts[p.client_id] || 0) + 1
      }
      setClients((profiles || []).map((c) => ({ ...c, projectCount: counts[c.id] || 0 })))
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <p className="text-ink/40 text-sm">Loading…</p>

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <Users size={16} className="text-terracotta" />
        <h2 className="font-display font-bold text-lg text-ink">Clients</h2>
      </div>
      <p className="text-sm text-ink/50 mb-5">Everyone who's ever signed up for the client portal.</p>

      {clients.length === 0 ? (
        <p className="text-ink/40 text-sm">No client accounts yet.</p>
      ) : (
        <div className="space-y-2">
          {clients.map((c) => (
            <div key={c.id} className="glass-panel-light rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ink">{c.full_name || 'Unnamed'}</p>
                <p className="text-xs text-ink/40">{c.email}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-ink/50">{c.projectCount} project{c.projectCount === 1 ? '' : 's'}</p>
                <p className="text-[11px] text-ink/35">joined {new Date(c.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
