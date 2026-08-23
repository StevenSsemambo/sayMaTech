import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { HelpCircle, ChevronDown } from 'lucide-react'
import { supabase } from '../lib/supabase'

function FaqItem({ entry, index }) {
  const [open, setOpen] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35, delay: (index % 6) * 0.05 }}
      className="glass-panel-light rounded-xl overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="focus-ring w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <span className="text-sm font-medium text-ink">{entry.question}</span>
        <ChevronDown size={16} className={`text-ink/40 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <p className="px-5 pb-4 text-sm text-ink/60 leading-relaxed">{entry.answer}</p>}
    </motion.div>
  )
}

export default function FaqPage() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('faq_entries')
      .select('*')
      .order('category', { ascending: true })
      .then(({ data }) => {
        setEntries(data || [])
        setLoading(false)
      })
  }, [])

  const grouped = entries.reduce((acc, e) => {
    const key = e.category || 'General'
    if (!acc[key]) acc[key] = []
    acc[key].push(e)
    return acc
  }, {})

  return (
    <div className="pt-32 pb-24 px-6 bg-ivory min-h-screen">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 mb-3">
          <HelpCircle size={18} className="text-terracotta" />
          <span className="text-xs font-mono uppercase tracking-widest text-terracotta">FAQ</span>
        </div>
        <h1 className="font-display font-bold text-4xl text-ink mb-3">Common questions.</h1>
        <p className="text-ink/60 mb-10">
          Can't find what you need? Ask "Ask SayMyTech" directly, or start a conversation at the Client Portal.
        </p>

        {loading ? (
          <p className="text-ink/40 text-sm">Loading…</p>
        ) : entries.length === 0 ? (
          <p className="text-ink/40 text-sm">Nothing here yet — check back soon.</p>
        ) : (
          Object.entries(grouped).map(([category, items]) => (
            <div key={category} className="mb-8">
              <p className="text-xs font-mono uppercase tracking-widest text-ink/40 mb-3">{category}</p>
              <div className="space-y-2">
                {items.map((entry, i) => (
                  <FaqItem key={entry.id} entry={entry} index={i} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
