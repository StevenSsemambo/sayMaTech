import { useState, useEffect, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts'
import { Wallet, TrendingUp, Clock, Receipt } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { logAudit } from '../../lib/audit'
import PrintableInvoice from './PrintableInvoice'

const STATUS_STYLES = {
  unpaid: 'bg-gold/15 text-gold',
  paid: 'bg-savanna/15 text-savanna',
  waived: 'bg-ink/10 text-ink/50',
}

function currency(n) {
  if (n == null) return '—'
  return `$${Number(n).toLocaleString()}`
}

function StatCard({ icon: Icon, label, value, accent }) {
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

export default function FinancePanel() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('invoices')
      .select('*, projects(name), profiles(full_name, email)')
      .order('created_at', { ascending: false })
    setInvoices(data || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function updateStatus(inv, status) {
    setBusyId(inv.id)
    try {
      const paid_at = status === 'paid' ? new Date().toISOString() : null
      await supabase.from('invoices').update({ status, paid_at }).eq('id', inv.id)
      logAudit('invoice_status_changed', 'invoice', inv.id, `${inv.invoice_number}: ${inv.status} -> ${status}`)
      setInvoices((is) => is.map((i) => (i.id === inv.id ? { ...i, status, paid_at } : i)))
    } finally {
      setBusyId(null)
    }
  }

  const stats = useMemo(() => {
    const paid = invoices.filter((i) => i.status === 'paid')
    const unpaid = invoices.filter((i) => i.status === 'unpaid')
    const totalRevenue = paid.reduce((sum, i) => sum + (Number(i.amount) || 0), 0)
    const outstanding = unpaid.reduce((sum, i) => sum + (Number(i.amount) || 0), 0)
    const avg = paid.length ? totalRevenue / paid.length : 0
    return { totalRevenue, outstanding, avg, paidCount: paid.length, unpaidCount: unpaid.length }
  }, [invoices])

  const chartData = useMemo(() => {
    const months = {}
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = d.toLocaleDateString('en-US', { month: 'short' })
      months[key] = 0
    }
    invoices
      .filter((i) => i.status === 'paid' && i.paid_at)
      .forEach((i) => {
        const key = new Date(i.paid_at).toLocaleDateString('en-US', { month: 'short' })
        if (key in months) months[key] += Number(i.amount) || 0
      })
    return Object.entries(months).map(([month, revenue]) => ({ month, revenue }))
  }, [invoices])

  if (loading) return <p className="text-ink/40 text-sm">Loading…</p>

  return (
    <div>
      <div className="flex items-center gap-2 mb-5">
        <Wallet size={16} className="text-terracotta" />
        <h2 className="font-display font-bold text-lg text-ink">Finance</h2>
      </div>

      <div className="grid sm:grid-cols-4 gap-4 mb-6">
        <StatCard icon={TrendingUp} label="Total revenue (paid)" value={currency(stats.totalRevenue)} accent="bg-savanna/15 text-savanna" />
        <StatCard icon={Clock} label="Outstanding" value={currency(stats.outstanding)} accent="bg-gold/15 text-gold" />
        <StatCard icon={Receipt} label="Avg. invoice value" value={currency(stats.avg)} accent="bg-terracotta/15 text-terracotta" />
        <StatCard icon={Wallet} label="Paid / Unpaid" value={`${stats.paidCount} / ${stats.unpaidCount}`} accent="bg-ink/10 text-ink/60" />
      </div>

      <div className="glass-panel-light rounded-2xl p-5 mb-6">
        <p className="text-xs font-mono uppercase tracking-widest text-ink/40 mb-3">Revenue — last 6 months</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(11,31,26,0.06)" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#0B1F1A99' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#0B1F1A99' }} axisLine={false} tickLine={false} width={70} tickFormatter={(v) => `$${v / 1000}k`} />
            <Tooltip
              formatter={(value) => currency(value)}
              contentStyle={{ borderRadius: 8, border: '1px solid rgba(11,31,26,0.1)', fontSize: 12 }}
            />
            <Bar dataKey="revenue" fill="#E8622C" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div>
        <p className="text-xs font-mono uppercase tracking-widest text-ink/40 mb-3">All invoices</p>
        {invoices.length === 0 ? (
          <p className="text-ink/40 text-sm">No invoices yet — they're auto-created when a project is marked completed.</p>
        ) : (
          <div className="space-y-2">
            {invoices.map((inv) => (
              <div key={inv.id} className="glass-panel-light rounded-xl p-4 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="text-sm font-medium text-ink">
                    {inv.invoice_number} — {inv.projects?.name || 'Unknown project'}
                  </p>
                  <p className="text-xs text-ink/40 mt-0.5">
                    {inv.profiles?.full_name || inv.profiles?.email} · {new Date(inv.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono text-ink">{currency(inv.amount)}</span>
                  <PrintableInvoice invoice={inv} projectName={inv.projects?.name || 'Project'} />
                  <select
                    value={inv.status}
                    onChange={(e) => updateStatus(inv, e.target.value)}
                    disabled={busyId === inv.id}
                    className={`focus-ring text-[11px] font-mono uppercase tracking-wide px-2.5 py-1.5 rounded-full border-0 ${STATUS_STYLES[inv.status]}`}
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                    <option value="waived">Waived</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
