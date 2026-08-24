import { useState, useEffect } from 'react'
import { CheckCircle2, Circle, Loader2, Plus, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/AuthContext'
import { logAudit } from '../../lib/audit'
import { notifyClient } from '../../lib/notifications'

const STATUS_ICON = {
  done: <CheckCircle2 size={16} className="text-savanna" />,
  in_progress: <Loader2 size={16} className="text-gold" />,
  pending: <Circle size={16} className="text-ink/25" />,
}

export default function MilestonesPanel({ projectId, clientId, projectName }) {
  const { isAdmin } = useAuth()
  const [milestones, setMilestones] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState('')

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('milestones')
      .select('*')
      .eq('project_id', projectId)
      .order('order_index', { ascending: true })
    setMilestones(data || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
    const channel = supabase
      .channel(`milestones-${projectId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'milestones', filter: `project_id=eq.${projectId}` }, load)
      .subscribe()
    return () => supabase.removeChannel(channel)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  async function addMilestone(e) {
    e.preventDefault()
    if (!title.trim()) return
    await supabase.from('milestones').insert({ project_id: projectId, title, order_index: milestones.length })
    logAudit('milestone_created', 'milestone', projectId, title)
    setTitle('')
    setAdding(false)
  }

  async function cycleStatus(m) {
    const next = m.status === 'pending' ? 'in_progress' : m.status === 'in_progress' ? 'done' : 'pending'
    await supabase.from('milestones').update({ status: next, updated_at: new Date().toISOString() }).eq('id', m.id)
    logAudit('milestone_status_changed', 'milestone', m.id, `${m.title}: ${m.status} -> ${next}`)
    if (next === 'done') {
      notifyClient(clientId, 'milestone', `"${m.title}" is done on "${projectName}"`, projectId)
    }
  }

  async function remove(m) {
    await supabase.from('milestones').delete().eq('id', m.id)
    logAudit('milestone_deleted', 'milestone', m.id, m.title)
  }

  if (loading) return <p className="text-xs text-ink/40">Loading timeline…</p>

  return (
    <div className="mt-3">
      <p className="text-xs font-mono uppercase tracking-wide text-ink/40 mb-2">Timeline</p>
      {milestones.length === 0 ? (
        <p className="text-xs text-ink/40">
          {isAdmin ? 'No milestones yet — add the first step below.' : 'No timeline steps added yet.'}
        </p>
      ) : (
        <div className="space-y-1.5">
          {milestones.map((m) => (
            <div key={m.id} className="flex items-center gap-2 group">
              <button
                onClick={() => isAdmin && cycleStatus(m)}
                disabled={!isAdmin}
                className={isAdmin ? 'focus-ring cursor-pointer' : ''}
              >
                {STATUS_ICON[m.status]}
              </button>
              <span className={`text-xs flex-1 ${m.status === 'done' ? 'text-ink/40 line-through' : 'text-ink/70'}`}>
                {m.title}
              </span>
              {isAdmin && (
                <button
                  onClick={() => remove(m)}
                  className="focus-ring opacity-0 group-hover:opacity-100 text-ink/30 hover:text-terracotta transition-opacity"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {isAdmin && (
        <div className="mt-2">
          {adding ? (
            <form onSubmit={addMilestone} className="flex gap-1.5">
              <input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Milestone name…"
                className="focus-ring flex-1 text-xs rounded-lg border border-ink/15 px-2.5 py-1.5"
              />
              <button type="submit" className="focus-ring text-xs bg-ink text-ivory px-2.5 py-1.5 rounded-lg">
                Add
              </button>
            </form>
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="focus-ring flex items-center gap-1 text-xs text-terracotta"
            >
              <Plus size={12} /> Add milestone
            </button>
          )}
        </div>
      )}
    </div>
  )
}
