import { useState } from 'react'
import { User, Save, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/AuthContext'

export default function AccountSettingsPanel() {
  const { user, profile } = useAuth()
  const [name, setName] = useState(profile?.full_name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [password, setPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      if (name !== profile?.full_name) {
        await supabase.from('profiles').update({ full_name: name }).eq('id', user.id)
      }
      const authUpdates = {}
      if (email !== user.email) authUpdates.email = email
      if (password) authUpdates.password = password
      if (Object.keys(authUpdates).length > 0) {
        const { error } = await supabase.auth.updateUser(authUpdates)
        if (error) throw error
      }
      setMessage('Saved! If you changed your email, check your inbox to confirm it.')
      setPassword('')
    } catch (err) {
      setMessage(err.message || 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-md">
      <div className="flex items-center gap-2 mb-1">
        <User size={16} className="text-terracotta" />
        <h2 className="font-display font-bold text-lg text-ink">Account settings</h2>
      </div>
      <p className="text-sm text-ink/50 mb-5">Update your name, email, or password.</p>

      <form onSubmit={handleSave} className="glass-panel-light rounded-xl p-5 space-y-4">
        <div>
          <label className="text-xs font-medium text-ink/60">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="focus-ring mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-ink/60">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="focus-ring mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-ink/60">New password (leave blank to keep current)</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            className="focus-ring mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm"
            placeholder="••••••••"
          />
        </div>
        {message && <p className="text-xs text-ink/60">{message}</p>}
        <button
          type="submit"
          disabled={saving}
          className="focus-ring flex items-center gap-1.5 text-sm bg-ink text-ivory px-4 py-2.5 rounded-lg disabled:opacity-50"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Save changes
        </button>
      </form>
    </div>
  )
}
