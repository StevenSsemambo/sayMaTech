import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { LogOut, FolderKanban, Receipt } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'
import AuthForm from '../components/portal/AuthForm'
import StatusBadge from '../components/portal/StatusBadge'
import MessageThread from '../components/portal/MessageThread'

function ClientDashboard() {
  const { profile, signOut } = useAuth()
  const [projects, setProjects] = useState([])
  const [active, setActive] = useState(null)
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: projectData }, { data: invoiceData }] = await Promise.all([
        supabase.from('projects').select('*').order('created_at', { ascending: false }),
        supabase.from('invoices').select('*').order('created_at', { ascending: false }),
      ])
      setProjects(projectData || [])
      setInvoices(invoiceData || [])
      if (projectData?.length) setActive(projectData[0])
      setLoading(false)
    }
    load()
  }, [])

  const activeInvoice = active ? invoices.find((inv) => inv.project_id === active.id) : null

  return (
    <div className="min-h-screen bg-ivory pt-24 px-6 pb-16">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-terracotta">Client Portal</p>
            <h1 className="font-display font-bold text-2xl text-ink mt-1">
              Welcome, {profile?.full_name || 'there'}
            </h1>
          </div>
          <button
            onClick={signOut}
            className="focus-ring flex items-center gap-1.5 text-sm text-ink/50 hover:text-terracotta"
          >
            <LogOut size={15} /> Log out
          </button>
        </div>

        {loading ? (
          <p className="text-ink/40 text-sm">Loading your projects…</p>
        ) : projects.length === 0 ? (
          <div className="glass-panel-light rounded-2xl p-10 text-center">
            <FolderKanban className="mx-auto text-ink/30 mb-3" size={32} />
            <p className="text-ink/60">No projects linked to your account yet.</p>
            <p className="text-sm text-ink/40 mt-1">Once we kick off, your project will show up here.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              {projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setActive(p)}
                  className={`focus-ring w-full text-left rounded-xl p-4 transition-colors ${
                    active?.id === p.id ? 'bg-ink text-ivory' : 'bg-ivory-dim text-ink hover:bg-ink/5'
                  }`}
                >
                  <p className="font-medium text-sm">{p.name}</p>
                  <div className="mt-2">
                    <StatusBadge status={p.status} />
                  </div>
                </button>
              ))}
            </div>

            <div className="md:col-span-2 glass-panel-light rounded-2xl p-6 h-[520px] flex flex-col">
              {active && (
                <>
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <h2 className="font-display font-bold text-lg text-ink">{active.name}</h2>
                      <StatusBadge status={active.status} />
                    </div>
                    {active.description && (
                      <p className="text-sm text-ink/60 mt-1.5">{active.description}</p>
                    )}
                    {activeInvoice && (
                      <div className="mt-3 flex items-center gap-2 bg-savanna/10 text-savanna text-xs rounded-lg px-3 py-2 w-fit">
                        <Receipt size={14} />
                        <span>
                          {activeInvoice.invoice_number}
                          {activeInvoice.amount != null && ` — ${activeInvoice.amount}`}
                          {' · '}
                          {activeInvoice.status}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-h-0">
                    <MessageThread projectId={active.id} />
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function PortalPage() {
  const { session, loading } = useAuth()

  if (loading) {
    return <div className="min-h-screen bg-ink flex items-center justify-center text-ivory/50 text-sm pt-20">Loading…</div>
  }

  return session ? <ClientDashboard /> : <AuthForm />
}
