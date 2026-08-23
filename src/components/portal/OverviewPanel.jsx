import { useState, useEffect } from 'react'
import { LayoutDashboard, LifeBuoy, ClipboardList, Wallet, TrendingUp, ArrowRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'

function currency(n) {
  return `$${Number(n || 0).toLocaleString()}`
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const hours = Math.floor(diff / 3600000)
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}d`
}

function SectionCard({ icon: Icon, title, accent, onGoTo, children, empty }) {
  return (
    <div className="glass-panel-light rounded-2xl p-5 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent}`}>
            <Icon size={15} />
          </span>
          <h3 className="font-display font-bold text-sm text-ink">{title}</h3>
        </div>
        <button onClick={onGoTo} className="focus-ring text-ink/30 hover:text-terracotta">
          <ArrowRight size={15} />
        </button>
      </div>
      <div className="flex-1">
        {empty ? <p className="text-xs text-ink/40">{empty}</p> : children}
      </div>
    </div>
  )
}

export default function OverviewPanel({ onNavigate }) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [messagesRes, requestsRes, invoicesRes, trendingRes, leadsRes] = await Promise.all([
        supabase
          .from('messages')
          .select('id, project_id, content, created_at, sender_id, projects(name, client_id)')
          .order('created_at', { ascending: false }),
        supabase
          .from('project_requests')
          .select('id, title, created_at, profiles(full_name, email)')
          .eq('status', 'pending')
          .order('created_at', { ascending: false }),
        supabase.from('invoices').select('amount').eq('status', 'unpaid'),
        supabase.rpc('get_trending_category'),
        supabase.from('leads').select('id', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString()),
      ])

      const latestByProject = {}
      for (const m of messagesRes.data || []) {
        if (!latestByProject[m.project_id]) latestByProject[m.project_id] = m
      }
      const awaiting = Object.values(latestByProject)
        .filter((m) => m.projects && m.sender_id === m.projects.client_id)
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))

      const unpaidTotal = (invoicesRes.data || []).reduce((sum, i) => sum + (Number(i.amount) || 0), 0)

      setData({
        awaiting,
        pendingRequests: requestsRes.data || [],
        unpaidTotal,
        unpaidCount: invoicesRes.data?.length || 0,
        trending: trendingRes.data?.[0] || null,
        leadsThisWeek: leadsRes.count || 0,
      })
      setLoading(false)
    }
    load()
  }, [])

  if (loading || !data) return <p className="text-ink/40 text-sm">Loading…</p>

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <LayoutDashboard size={16} className="text-terracotta" />
        <h2 className="font-display font-bold text-lg text-ink">Overview</h2>
      </div>
      <p className="text-sm text-ink/50 mb-5">What actually needs your attention today, pulled from every department.</p>

      <div className="grid md:grid-cols-2 gap-5">
        <SectionCard
          icon={LifeBuoy}
          title={`Support — ${data.awaiting.length} awaiting reply`}
          accent="bg-terracotta/15 text-terracotta"
          onGoTo={() => onNavigate('support')}
          empty={data.awaiting.length === 0 ? 'Inbox zero — nothing waiting on you.' : null}
        >
          <div className="space-y-2">
            {data.awaiting.slice(0, 3).map((m) => (
              <div key={m.id} className="flex items-center justify-between text-xs">
                <span className="text-ink/70 truncate">{m.projects?.name}</span>
                <span className="text-ink/40 shrink-0 ml-2">{timeAgo(m.created_at)}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          icon={ClipboardList}
          title={`Requests — ${data.pendingRequests.length} pending`}
          accent="bg-gold/15 text-gold"
          onGoTo={() => onNavigate('requests')}
          empty={data.pendingRequests.length === 0 ? 'No requests waiting for review.' : null}
        >
          <div className="space-y-2">
            {data.pendingRequests.slice(0, 3).map((r) => (
              <div key={r.id} className="flex items-center justify-between text-xs">
                <span className="text-ink/70 truncate">{r.title}</span>
                <span className="text-ink/40 shrink-0 ml-2">{r.profiles?.full_name || r.profiles?.email}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          icon={Wallet}
          title="Finance"
          accent="bg-savanna/15 text-savanna"
          onGoTo={() => onNavigate('finance')}
        >
          <p className="text-xl font-display font-bold text-ink">{currency(data.unpaidTotal)}</p>
          <p className="text-xs text-ink/50 mt-0.5">outstanding across {data.unpaidCount} invoice{data.unpaidCount === 1 ? '' : 's'}</p>
        </SectionCard>

        <SectionCard
          icon={TrendingUp}
          title="This week"
          accent="bg-ink/10 text-ink/60"
          onGoTo={() => onNavigate('insights')}
        >
          <p className="text-xl font-display font-bold text-ink">{data.leadsThisWeek} new leads</p>
          {data.trending && (
            <p className="text-xs text-ink/50 mt-0.5">
              Trending: <strong className="text-ink/70">{data.trending.category}</strong> ({data.trending.lead_count})
            </p>
          )}
        </SectionCard>
      </div>
    </div>
  )
}
