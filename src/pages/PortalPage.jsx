import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { LogOut, FolderKanban, Receipt, Sparkles, ClipboardList, User } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'
import AuthForm from '../components/portal/AuthForm'
import StatusBadge from '../components/portal/StatusBadge'
import MessageThread from '../components/portal/MessageThread'
import NotificationBell from '../components/portal/NotificationBell'
import SpecAssistant from '../components/portal/SpecAssistant'
import AgreementPanel from '../components/portal/AgreementPanel'
import MilestonesPanel from '../components/portal/MilestonesPanel'
import FileGallery from '../components/portal/FileGallery'
import PrintableInvoice from '../components/portal/PrintableInvoice'
import AccountSettingsPanel from '../components/portal/AccountSettingsPanel'
import BackToSite from '../components/portal/BackToSite'

const REQUEST_STATUS_STYLES = {
  pending: 'bg-gold/15 text-gold',
  approved: 'bg-savanna/15 text-savanna',
  declined: 'bg-terracotta/15 text-terracotta',
}

function ProjectsTab() {
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

  if (loading) return <p className="text-ink/40 text-sm">Loading your projects…</p>

  if (projects.length === 0) {
    return (
      <div className="glass-panel-light rounded-2xl p-10 text-center">
        <FolderKanban className="mx-auto text-ink/30 mb-3" size={32} />
        <p className="text-ink/60">No active projects yet.</p>
        <p className="text-sm text-ink/40 mt-1">
          Use "New Request" to describe what you want built — once approved, it'll show up here.
        </p>
      </div>
    )
  }

  return (
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

      <div className="md:col-span-2 glass-panel-light rounded-2xl p-6 h-[600px] flex flex-col">
        {active && (
          <>
            <div className="mb-4 overflow-y-auto max-h-80 pr-1">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-bold text-lg text-ink">{active.name}</h2>
                <StatusBadge status={active.status} />
              </div>
              {active.description && <p className="text-sm text-ink/60 mt-1.5">{active.description}</p>}
              {activeInvoice && (
                <div className="mt-3 flex items-center justify-between gap-2 bg-savanna/10 text-savanna text-xs rounded-lg px-3 py-2">
                  <span className="flex items-center gap-2">
                    <Receipt size={14} />
                    {activeInvoice.invoice_number}
                    {activeInvoice.amount != null && ` — $${Number(activeInvoice.amount).toLocaleString()}`}
                    {' · '}
                    {activeInvoice.status}
                  </span>
                  <PrintableInvoice invoice={activeInvoice} projectName={active.name} />
                </div>
              )}
              <AgreementPanel
                projectId={active.id}
                projectName={active.name}
                projectSpec={active.description}
                projectBudget={active.budget}
                clientId={active.client_id}
              />
              <MilestonesPanel projectId={active.id} clientId={active.client_id} projectName={active.name} />
              <FileGallery projectId={active.id} />
            </div>
            <div className="flex-1 min-h-0">
              <MessageThread projectId={active.id} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function RequestsTab() {
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('project_requests')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false })
      setRequests(data || [])
      setLoading(false)
    }
    load()
  }, [user.id])

  if (loading) return <p className="text-ink/40 text-sm">Loading…</p>
  if (requests.length === 0) {
    return <p className="text-ink/40 text-sm">No requests submitted yet — start one under "New Request."</p>
  }

  return (
    <div className="space-y-3">
      {requests.map((r) => (
        <div key={r.id} className="glass-panel-light rounded-xl p-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="font-display font-bold text-ink">{r.title}</h3>
            <span className={`text-[10px] font-mono uppercase tracking-wide px-2 py-0.5 rounded-full ${REQUEST_STATUS_STYLES[r.status]}`}>
              {r.status}
            </span>
          </div>
          <p className="text-xs text-ink/40 mt-1">{new Date(r.created_at).toLocaleDateString()}</p>
          {r.ai_spec && (
            <details className="mt-3">
              <summary className="text-xs text-terracotta cursor-pointer">View organized specification</summary>
              <pre className="mt-2 text-xs text-ink/70 whitespace-pre-wrap font-sans bg-ivory-dim rounded-lg p-3">
                {r.ai_spec}
              </pre>
            </details>
          )}
        </div>
      ))}
    </div>
  )
}

function ClientDashboard() {
  const { profile, signOut } = useAuth()
  const [tab, setTab] = useState('projects')

  return (
    <div className="min-h-screen bg-ivory pt-24 px-6 pb-16">
      <BackToSite />
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-terracotta">Client Portal</p>
            <h1 className="font-display font-bold text-2xl text-ink mt-1">
              Welcome, {profile?.full_name || 'there'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <button
              onClick={signOut}
              className="focus-ring flex items-center gap-1.5 text-sm text-ink/50 hover:text-terracotta"
            >
              <LogOut size={15} /> Log out
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-6 bg-ivory-dim rounded-lg p-1 w-fit flex-wrap">
          <button
            onClick={() => setTab('projects')}
            className={`focus-ring flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-md transition-colors ${
              tab === 'projects' ? 'bg-ink text-ivory' : 'text-ink/60'
            }`}
          >
            <FolderKanban size={14} /> My Projects
          </button>
          <button
            onClick={() => setTab('new-request')}
            className={`focus-ring flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-md transition-colors ${
              tab === 'new-request' ? 'bg-ink text-ivory' : 'text-ink/60'
            }`}
          >
            <Sparkles size={14} /> New Request
          </button>
          <button
            onClick={() => setTab('requests')}
            className={`focus-ring flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-md transition-colors ${
              tab === 'requests' ? 'bg-ink text-ivory' : 'text-ink/60'
            }`}
          >
            <ClipboardList size={14} /> My Requests
          </button>
          <button
            onClick={() => setTab('account')}
            className={`focus-ring flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-md transition-colors ${
              tab === 'account' ? 'bg-ink text-ivory' : 'text-ink/60'
            }`}
          >
            <User size={14} /> Account
          </button>
        </div>

        {tab === 'projects' && <ProjectsTab />}
        {tab === 'new-request' && <SpecAssistant onSubmitted={() => setTab('requests')} />}
        {tab === 'requests' && <RequestsTab />}
        {tab === 'account' && <AccountSettingsPanel />}
      </div>
    </div>
  )
}

export default function PortalPage() {
  const { session, isAdmin, loading } = useAuth()

  if (loading) {
    return <div className="min-h-screen bg-ink flex items-center justify-center text-ivory/50 text-sm pt-20">Loading…</div>
  }

  if (session && isAdmin) return <Navigate to="/admin" replace />

  return session ? <ClientDashboard /> : <AuthForm />
}
