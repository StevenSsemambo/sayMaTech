import { useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import LogoMark from '../Logo'

export default function AuthForm() {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setNotice('')
    setLoading(true)

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      })
      if (error) {
        setError(error.message)
      } else {
        setNotice('Check your email to confirm your account, then log in.')
        setMode('login')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-6 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-panel w-full max-w-sm rounded-2xl p-8"
      >
        <div className="flex items-center gap-2.5 mb-6">
          <LogoMark size={34} />
          <span className="font-display font-bold text-lg text-ivory">Client Portal</span>
        </div>

        <div className="flex gap-2 mb-6 bg-ivory/5 rounded-lg p-1">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 text-sm font-medium py-2 rounded-md transition-colors ${
              mode === 'login' ? 'bg-terracotta text-ivory' : 'text-ivory/60'
            }`}
          >
            Log in
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 text-sm font-medium py-2 rounded-md transition-colors ${
              mode === 'signup' ? 'bg-terracotta text-ivory' : 'text-ivory/60'
            }`}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="text-xs font-medium text-ivory/60">Your name</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="focus-ring mt-1 w-full rounded-lg bg-ivory/10 border border-ivory/15 px-3.5 py-2.5 text-ivory text-sm"
                placeholder="Jane Nakato"
              />
            </div>
          )}
          <div>
            <label className="text-xs font-medium text-ivory/60">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="focus-ring mt-1 w-full rounded-lg bg-ivory/10 border border-ivory/15 px-3.5 py-2.5 text-ivory text-sm"
              placeholder="jane@company.com"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-ivory/60">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="focus-ring mt-1 w-full rounded-lg bg-ivory/10 border border-ivory/15 px-3.5 py-2.5 text-ivory text-sm"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-xs text-terracotta-soft">{error}</p>}
          {notice && <p className="text-xs text-savanna">{notice}</p>}

          <button
            type="submit"
            disabled={loading}
            className="focus-ring w-full bg-terracotta hover:bg-terracotta-soft text-ivory font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
