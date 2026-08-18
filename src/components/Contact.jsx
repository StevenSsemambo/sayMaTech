import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Check } from 'lucide-react'

export default function Contact() {
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', project: '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    // Wire this to your email/CRM of choice (Netlify Forms, Formspree, or a function).
    setSent(true)
  }

  return (
    <section id="contact" className="bg-terracotta px-6 pt-40 pb-24 relative overflow-hidden">
      <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-gold/20 blur-3xl" />
      <div className="max-w-3xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-display font-bold text-3xl md:text-4xl text-ivory">
            Have something worth building?
          </h2>
          <p className="mt-4 text-ivory/85 text-lg">
            Tell us what you're trying to build. We'll reply with real next steps, not a sales pitch.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {sent ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, type: 'spring', bounce: 0.4 }}
              className="mt-10 bg-ivory rounded-2xl p-10 flex flex-col items-center text-center gap-3 text-ink"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.15, type: 'spring', bounce: 0.5 }}
                className="w-14 h-14 rounded-full bg-savanna/15 flex items-center justify-center"
              >
                <Check className="text-savanna" size={26} />
              </motion.div>
              <p className="font-display font-bold text-lg">Got it — we'll be in touch shortly.</p>
              <p className="text-sm text-ink/50">Thanks for reaching out to SayMyTech.</p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="mt-10 bg-ivory rounded-2xl p-8 grid gap-5"
            >
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-medium text-ink/70" htmlFor="name">Your name</label>
                  <input
                    id="name"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="focus-ring mt-1.5 w-full rounded-lg border border-ink/15 px-4 py-3 text-ink"
                    placeholder="Jane Nakato"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-ink/70" htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="focus-ring mt-1.5 w-full rounded-lg border border-ink/15 px-4 py-3 text-ink"
                    placeholder="jane@company.com"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-ink/70" htmlFor="project">What are you building?</label>
                <textarea
                  id="project"
                  required
                  rows={4}
                  value={form.project}
                  onChange={(e) => setForm({ ...form, project: e.target.value })}
                  className="focus-ring mt-1.5 w-full rounded-lg border border-ink/15 px-4 py-3 text-ink resize-none"
                  placeholder="A short description of the idea, timeline, or problem you're solving..."
                />
              </div>
              <button
                type="submit"
                className="focus-ring justify-self-start inline-flex items-center gap-2 bg-ink hover:bg-ink-soft text-ivory font-medium px-6 py-3.5 rounded-xl transition-colors"
              >
                Send it over <ArrowRight size={18} />
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
