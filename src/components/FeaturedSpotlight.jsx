import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import SignalField from './SignalField'
import Magnetic from './Magnetic'

const SPOTLIGHT = [
  {
    name: 'EliAi — Elimu Learn',
    tag: 'Education',
    headline: 'Learning that keeps up, even offline.',
    features: ['Offline-capable lessons', 'Adaptive pacing per student', 'Built for secondary schools'],
    color: '#1B6B4A',
  },
  {
    name: 'YoSacco',
    tag: 'Finance',
    headline: 'Group savings everyone can actually see.',
    features: ['Transparent contributions', 'Loan tracking built in', 'Made for cooperative groups'],
    color: '#E8622C',
  },
  {
    name: 'ProfitMind AI',
    tag: 'Retail',
    headline: 'An AI advisor that watches your stock.',
    features: ['Live revenue dashboard', 'AI restock alerts', 'Built for small businesses'],
    color: '#F2B705',
  },
  {
    name: 'SayMyDoc',
    tag: 'Health',
    headline: 'A health companion for everyday life.',
    features: ['Works on low connectivity', 'Plain-language guidance', 'Built for real access, not hospitals only'],
    color: '#1B6B4A',
  },
]

export default function FeaturedSpotlight() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const id = setInterval(() => setIndex((i) => (i + 1) % SPOTLIGHT.length), 5500)
    return () => clearInterval(id)
  }, [paused])

  const active = SPOTLIGHT[index]

  return (
    <section
      className="relative bg-ink text-ivory py-20 px-6 overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <SignalField density={0.00006} />
      <div className="relative max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mb-8">
          <Sparkles size={14} className="text-gold" />
          <span className="text-xs font-mono uppercase tracking-widest text-gold">Spotlight</span>
        </div>

        <div className="min-h-[280px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.name}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <span
                className="text-[11px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full"
                style={{ backgroundColor: `${active.color}26`, color: active.color }}
              >
                {active.tag}
              </span>
              <h2 className="font-display font-bold text-3xl md:text-5xl mt-4 max-w-2xl leading-tight">
                {active.headline}
              </h2>
              <p className="mt-3 text-lg text-ivory/60">{active.name}</p>

              <div className="mt-6 flex flex-wrap gap-3">
                {active.features.map((f, i) => (
                  <motion.span
                    key={f}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
                    className="glass-panel text-xs text-ivory/80 px-3.5 py-2 rounded-full"
                  >
                    {f}
                  </motion.span>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8"
              >
                <Magnetic>
                  <Link
                    to="/products"
                    className="focus-ring inline-flex items-center gap-2 bg-terracotta hover:bg-terracotta-soft text-ivory font-medium px-6 py-3.5 rounded-xl transition-colors"
                  >
                    See {active.name.split(' — ')[0]} <ArrowRight size={18} />
                  </Link>
                </Magnetic>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex gap-2 mt-10">
          {SPOTLIGHT.map((s, i) => (
            <button
              key={s.name}
              onClick={() => setIndex(i)}
              className="focus-ring h-1 rounded-full transition-all"
              style={{
                width: i === index ? 32 : 16,
                backgroundColor: i === index ? active.color : 'rgba(253,248,240,0.2)',
              }}
              aria-label={`Show ${s.name}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
