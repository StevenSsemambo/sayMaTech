import { useState, useEffect } from 'react'
import { LogOut, Plus, ShieldAlert, FolderKanban, Sparkles, Receipt, ClipboardList } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'
import AuthForm from '../components/portal/AuthForm'
import StatusBadge from '../components/portal/StatusBadge'
import MessageThread from '../components/portal/MessageThread'
import LeadsPanel from '../components/portal/LeadsPanel'
import RequestsPanel from '../components/portal/RequestsPanel'
import NotificationBell from '../components/portal/NotificationBell'
import BackToSite from '../components/portal/BackToSite'
import { notifyClient } from '../lib/notifications'

const STATUSES = ['discovery', 'in_progress', 'review', 'completed', 'on_hold']

function NewProjectForm({ onCreated }) {
  const [open, setOpen] = useState(false)
  const [clientEmail, setClientEmail] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [budget, setBudget] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleCreate(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { data: client, error: findErr } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', clientEmail.trim())
      .maybeSingle()

    if (findErr || !client) {
      setError('No client account found with that email — they need to sign up first.')
      setLoading(false)
      return
    }

    const { error: insertErr } = await supabase
      .from('projects')
      .insert({ client_id: client.id, name, description, budget: budget ? Number(budget) : null })

    setLoading(false)
    if (insertErr) {
      setError(insertErr.message)
    } else {
      setName('')
      setDescription('')
      setClientEmail('')
      setBudget('')
      setOpen(false)
      onCreated()
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="focus-ring flex items-center gap-1.5 text-sm bg-terracotta text-ivory px-3.5 py-2 rounded-lg"
      >
        <Plus size={15} /> New project
      </button>
    )
  }

  return (
    <form onSubmit={handleCreate} className="glass-panel-light rounded-xl p-4 space-y-3 mb-4">
      <input
        required
        type="email"
        placeholder="Client's account email"
        value={clientEmail}
        onChange={(e) => setClientEmail(e.target.value)}
        className="focus-ring w-full rounded-lg border border-ink/15 px-3 py-2 text-sm"
      />
      <input
        required
        placeholder="Project name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="focus-ring w-full rounded-lg border border-ink/15 px-3 py-2 text-sm"
      />
      <textarea
        placeholder="Short description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        className="focus-ring w-full rounded-lg border border-ink/15 px-3 py-2 text-sm resize-none"
      />
      <input
        type="number"
        min="0"
        step="0.01"
        placeholder="Budget / agreed amount (optional — used for auto-invoicing)"
        value={budget}
        onChange={(e) => setBudget(e.target.value)}
        className="focus-ring w-full rounded-lg border border-ink/15 px-3 py-2 text-sm"
      />
      {error && <p className="text-xs text-terracotta">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="focus-ring text-sm bg-ink text-ivory px-3.5 py-2 rounded-lg disabled:opacity-50"
        >
          {loading ? 'Creating…' : 'Create'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="focus-ring text-sm text-ink/50 px-3.5 py-2"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

async function generateInvoiceNumber() {
  const { data } = await supabase.rpc('nextval_invoice_number')
  if (data) return `INV-${data}`
  // fallback if the RPC isn't available for some reason
  return `INV-${Date.now().toString().slice(-6)}`
}

function ProjectsView() {
  const [projects, setProjects] = useState([])
  const [active, setActive] = useState(null)
  const [loading, setLoading] = useState(true)
  const [invoiceNotice, setInvoiceNotice] = useState('')

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('projects')
      .select('*, profiles(full_name, email)')
      .order('created_at', { ascending: false })
    setProjects(data || [])
    if (data?.length && !active) setActive(data[0])
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function updateStatus(project, status) {
    await supabase.from('projects').update({ status }).eq('id', project.id)
    setActive((a) => (a?.id === project.id ? { ...a, status } : a))
    setProjects((ps) => ps.map((p) => (p.id === project.id ? { ...p, status } : p)))

    notifyClient(
      project.client_id,
      'status_change',
      `Your project "${project.name}" moved to: ${status.replace('_', ' ')}`,
      project.id
    )

    // Automation: completing a project auto-creates its invoice, if one doesn't exist yet
    if (status === 'completed') {
      const { data: existing } = await supabase
        .from('invoices')
        .select('id')
        .eq('project_id', project.id)
        .maybeSingle()

      if (!existing) {
        const invoiceNumber = await generateInvoiceNumber()
        const { error } = await supabase.from('invoices').insert({
          project_id: project.id,
          client_id: project.client_id,
          invoice_number: invoiceNumber,
          amount: project.budget ?? null,
        })
        if (!error) {
          setInvoiceNotice(`Invoice ${invoiceNumber} auto-created for "${project.name}".`)
          setTimeout(() => setInvoiceNotice(''), 5000)
        }
      }
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <NewProjectForm onCreated={load} />
        {invoiceNotice && (
          <span className="flex items-center gap-1.5 text-xs text-savanna bg-savanna/10 px-3 py-1.5 rounded-full">
            <Receipt size={13} /> {invoiceNotice}
          </span>
        )}
      </div>

      {loading ? (
        <p className="text-ink/40 text-sm">Loading…</p>
      ) : projects.length === 0 ? (
        <p className="text-ink/40 text-sm">No client projects yet. Create the first one above.</p>
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
                <p className="text-xs opacity-60 mt-0.5">{p.profiles?.full_name || p.profiles?.email}</p>
                <div className="mt-2">
                  <StatusBadge status={p.status} />
                </div>
              </button>
            ))}
          </div>

          <div className="md:col-span-2 glass-panel-light rounded-2xl p-6 h-[560px] flex flex-col">
            {active && (
              <>
                <div className="mb-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h2 className="font-display font-bold text-lg text-ink">{active.name}</h2>
                    <select
                      value={active.status}
                      onChange={(e) => updateStatus(active, e.target.value)}
                      className="focus-ring text-xs font-mono uppercase border border-ink/15 rounded-lg px-2 py-1.5"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="text-xs text-ink/40 mt-1">{active.profiles?.email}</p>
                  {active.budget != null && (
                    <p className="text-xs text-ink/40 mt-0.5">Budget: {active.budget}</p>
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
  )
}

function AdminDashboard() {
  const { signOut } = useAuth()
  const [tab, setTab] = useState('projects')

  return (
    <div className="min-h-screen bg-ivory pt-24 px-6 pb-16">
      <BackToSite />
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-terracotta">Admin</p>
            <h1 className="font-display font-bold text-2xl text-ink mt-1">Company control panel</h1>
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

        <div className="flex gap-2 mb-6 bg-ivory-dim rounded-lg p-1 w-fit">
          <button
            onClick={() => setTab('projects')}
            className={`focus-ring flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-md transition-colors ${
              tab === 'projects' ? 'bg-ink text-ivory' : 'text-ink/60'
            }`}
          >
            <FolderKanban size={14} /> Projects
          </button>
          <button
            onClick={() => setTab('requests')}
            className={`focus-ring flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-md transition-colors ${
              tab === 'requests' ? 'bg-ink text-ivory' : 'text-ink/60'
            }`}
          >
            <ClipboardList size={14} /> Requests
          </button>
          <button
            onClick={() => setTab('leads')}
            className={`focus-ring flex items-center gap-1.5 text-sm font-medium px-3.5 py-2 rounded-md transition-colors ${
              tab === 'leads' ? 'bg-ink text-ivory' : 'text-ink/60'
            }`}
          >
            <Sparkles size={14} /> Leads
          </button>
        </div>

        {tab === 'projects' && <ProjectsView />}
        {tab === 'requests' && <RequestsPanel onApproved={() => setTab('projects')} />}
        {tab === 'leads' && <LeadsPanel />}
      </div>
    </div>
  )
}

export default function AdminPage() {
  const { session, isAdmin, loading } = useAuth()

  if (loading) {
    return <div className="min-h-screen bg-ink flex items-center justify-center text-ivory/50 text-sm pt-20">Loading…</div>
  }

  if (!session) return <AuthForm />

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center px-6 pt-20">
        <div className="text-center">
          <ShieldAlert className="mx-auto text-terracotta mb-3" size={32} />
          <p className="text-ink/70">This account doesn't have admin access.</p>
        </div>
      </div>
    )
  }

  return <AdminDashboard />
}
