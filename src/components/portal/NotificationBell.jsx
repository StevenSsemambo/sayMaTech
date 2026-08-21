import { useState, useEffect, useRef } from 'react'
import { Bell } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/AuthContext'

export default function NotificationBell() {
  const { user, isAdmin } = useAuth()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState([])
  const ref = useRef(null)

  async function load() {
    let query = supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(20)
    query = isAdmin ? query.or(`for_admin.eq.true,recipient_id.eq.${user.id}`) : query.eq('recipient_id', user.id)
    const { data } = await query
    setItems(data || [])
  }

  useEffect(() => {
    if (!user) return
    load()

    const channel = supabase
      .channel('notifications-' + user.id)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, () => load())
      .subscribe()

    return () => supabase.removeChannel(channel)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const unreadCount = items.filter((n) => !n.read).length

  async function markAllRead() {
    const unreadIds = items.filter((n) => !n.read).map((n) => n.id)
    if (unreadIds.length === 0) return
    await supabase.from('notifications').update({ read: true }).in('id', unreadIds)
    setItems((its) => its.map((n) => ({ ...n, read: true })))
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => {
          setOpen((o) => !o)
          if (!open) markAllRead()
        }}
        className="focus-ring relative text-ink/60 hover:text-terracotta transition-colors"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-terracotta text-ivory text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-80 max-h-96 overflow-y-auto glass-panel-light rounded-xl shadow-xl p-2 z-50">
          {items.length === 0 ? (
            <p className="text-sm text-ink/40 p-4 text-center">No notifications yet.</p>
          ) : (
            items.map((n) => (
              <div key={n.id} className="px-3 py-2.5 rounded-lg hover:bg-ink/5 text-sm">
                <p className="text-ink/80">{n.message}</p>
                <p className="text-[11px] text-ink/40 mt-0.5">
                  {new Date(n.created_at).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
