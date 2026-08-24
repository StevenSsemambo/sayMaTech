import { useState, useEffect } from 'react'
import { Settings, Save, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function SettingsPanel() {
  const [form, setForm] = useState({ business_name: '', address: '', contact_email: '', contact_phone: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('business_settings').select('*').eq('id', 1).maybeSingle()
      if (data) {
        setForm({
          business_name: data.business_name || '',
          address: data.address || '',
          contact_email: data.contact_email || '',
          contact_phone: data.contact_phone || '',
        })
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    await supabase.from('business_settings').upsert({ id: 1, ...form, updated_at: new Date().toISOString() })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  if (loading) return <p className="text-ink/40 text-sm">Loading…</p>

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-2 mb-1">
        <Settings size={16} className="text-terracotta" />
        <h2 className="font-display font-bold text-lg text-ink">Business settings</h2>
      </div>
      <p className="text-sm text-ink/50 mb-5">
        Feeds into invoices and generated contracts — since SayMyTech isn't formally
        incorporated yet, keep "Business name" informal (e.g. avoid "Ltd." or "Inc.").
      </p>

      <form onSubmit={handleSave} className="glass-panel-light rounded-xl p-5 space-y-4">
        <div>
          <label className="text-xs font-medium text-ink/60">Business name</label>
          <input
            value={form.business_name}
            onChange={(e) => setForm({ ...form, business_name: e.target.value })}
            placeholder="SayMyTech Developers"
            className="focus-ring mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-ink/60">Address</label>
          <input
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="Kampala, Uganda"
            className="focus-ring mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-ink/60">Contact email</label>
          <input
            value={form.contact_email}
            onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
            placeholder="hello@saymytech.dev"
            className="focus-ring mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-ink/60">Contact phone</label>
          <input
            value={form.contact_phone}
            onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
            placeholder="+256 7XX XXX XXX"
            className="focus-ring mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="focus-ring flex items-center gap-1.5 text-sm bg-ink text-ivory px-4 py-2.5 rounded-lg disabled:opacity-50"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {saved ? 'Saved!' : 'Save'}
        </button>
      </form>
    </div>
  )
}
