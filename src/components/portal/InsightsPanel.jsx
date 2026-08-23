import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts'
import { BarChart3, Users, FileCheck2, Wallet, TrendingUp } from 'lucide-react'
import { supabase } from '../../lib/supabase'

function currency(n) {
  return `UGX ${Number(n || 0).toLocaleString()}`
}

function FunnelStat({ icon: Icon, label, value, accent }) {
  return (
    <div className="glass-panel-light rounded-xl p-5">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${accent}`}>
        <Icon size={16} />
      </div>
      <p className="text-2xl font-display font-bold text-ink">{value}</p>
      <p className="text-xs text-ink/50 mt-1">{label}</p>
    </div>
  )
}

export default function InsightsPanel() {
  const [funnel, setFunnel] = useState(null)
  const [byCategory, setByCategory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [leadsRes, requestsRes, projectsRes, invoicesRes, insightsRes] = await Promise.all([
        supabase.from('leads').select('id', { count: 'exact', head: true }),
        supabase.from('project_requests').select('id', { count: 'exact', head: true }),
        supabase.from('projects').select('id', { count: 'exact', head: true }),
        supabase.from('invoices').select('id', { count: 'exact', head: true }).eq('status', 'paid'),
        supabase.rpc('get_lead_revenue_insights'),
      ])

      setFunnel({
        leads: leadsRes.count || 0,
        requests: requestsRes.count || 0,
        projects: projectsRes.count || 0,
        paidInvoices: invoicesRes.count || 0,
      })
      setByCategory(insightsRes.data || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <p className="text-ink/40 text-sm">Loading…</p>

  const chartData = byCategory.map((c) => ({
    category: c.category.length > 16 ? c.category.slice(0, 16) + '…' : c.category,
    revenue: Number(c.total_revenue) || 0,
  }))

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <BarChart3 size={16} className="text-terracotta" />
        <h2 className="font-display font-bold text-lg text-ink">Insights</h2>
      </div>
      <p className="text-sm text-ink/50 mb-5">
        Connects what marketing brings in to what finance actually collects — leads matched
        through to real revenue by category.
      </p>

      <div className="grid sm:grid-cols-4 gap-4 mb-6">
        <FunnelStat icon={Users} label="Total leads" value={funnel.leads} accent="bg-terracotta/15 text-terracotta" />
        <FunnelStat icon={FileCheck2} label="Requests submitted" value={funnel.requests} accent="bg-gold/15 text-gold" />
        <FunnelStat icon={TrendingUp} label="Projects created" value={funnel.projects} accent="bg-savanna/15 text-savanna" />
        <FunnelStat icon={Wallet} label="Invoices paid" value={funnel.paidInvoices} accent="bg-ink/10 text-ink/60" />
      </div>

      {byCategory.length === 0 ? (
        <div className="glass-panel-light rounded-2xl p-10 text-center">
          <p className="text-ink/50 text-sm">
            No categorized leads yet — this fills in automatically as leads and revenue accumulate.
          </p>
        </div>
      ) : (
        <>
          <div className="glass-panel-light rounded-2xl p-5 mb-6">
            <p className="text-xs font-mono uppercase tracking-widest text-ink/40 mb-3">Revenue by lead category</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(11,31,26,0.06)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#0B1F1A99' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                <YAxis type="category" dataKey="category" tick={{ fontSize: 11, fill: '#0B1F1A99' }} axisLine={false} tickLine={false} width={110} />
                <Tooltip formatter={(v) => currency(v)} contentStyle={{ borderRadius: 8, border: '1px solid rgba(11,31,26,0.1)', fontSize: 12 }} />
                <Bar dataKey="revenue" fill="#E8622C" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-ink/40 mb-3">By category</p>
            <div className="space-y-2">
              {byCategory.map((c) => (
                <div key={c.category} className="glass-panel-light rounded-xl p-4 flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <p className="text-sm font-medium text-ink">{c.category}</p>
                    <p className="text-xs text-ink/40 mt-0.5">
                      {c.lead_count} {c.lead_count === 1 ? 'lead' : 'leads'} · {c.converted_count} converted to a project
                    </p>
                  </div>
                  <span className="text-sm font-mono text-savanna">{currency(c.total_revenue)}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
