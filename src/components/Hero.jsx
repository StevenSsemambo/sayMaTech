import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, Sparkles, Globe2 } from 'lucide-react'
import LogoMark from './Logo'
import RotatingWord from './RotatingWord'
import CursorGlow from './CursorGlow'
import SignalField from './SignalField'
import Magnetic from './Magnetic'

const PROBLEMS = ['study.', 'money.', 'health.', 'communication.', 'work.']

const VISITOR_STORAGE_KEY = 'saymytech_visitor_email'

// Instant, zero-latency variants for shared links — works for any traffic source,
// including a future ad campaign, with no AI call needed.
const INTEREST_COPY = {
  study: {
    word: 'study.',
    subtext:
      "SayMyTech builds AI-powered learning tools that help students actually retain what they study — built to work everywhere, even on a patchy connection.",
  },
  money: {
    word: 'money.',
    subtext:
      "SayMyTech builds finance and savings software — from cooperative group management to smart forex education — that puts real numbers people can trust in front of them.",
  },
  health: {
    word: 'health.',
    subtext:
      "SayMyTech builds everyday health software — companions, monitors, and coaching tools — designed for real people, not just hospitals with big IT budgets.",
  },
  communication: {
    word: 'communication.',
    subtext:
      "SayMyTech builds fast, lightweight communication tools that work even when bandwidth doesn't — because a great app shouldn't require a great connection.",
  },
  work: {
    word: 'work.',
    subtext:
      "SayMyTech builds practical business software — POS systems, farm managers, project tools — that solve the everyday problems that actually slow work down.",
  },
}

export default function Hero() {
  const [searchParams] = useSearchParams()
  const interest = searchParams.get('interest')
  const variant = interest && INTEREST_COPY[interest] ? INTEREST_COPY[interest] : null

  const [personalized, setPersonalized] = useState(null)

  useEffect(() => {
    const email = typeof window !== 'undefined' ? localStorage.getItem(VISITOR_STORAGE_KEY) : null
    if (!email) return
    fetch('/.netlify/functions/personalize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitorEmail: email }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.personalized) setPersonalized(data.personalized)
      })
      .catch(() => {})
  }, [])

  return (
    <section id="top" className="relative bg-ink text-ivory pt-36 pb-28 px-6 overflow-hidden">
      {/* Ambient gold glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gold/10 blur-3xl" />
      <div className="absolute top-1/2 -left-32 w-80 h-80 rounded-full bg-terracotta/10 blur-3xl" />
      <SignalField />
      <CursorGlow />

      <div className="relative max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 mb-10"
        >
          <LogoMark size={40} />
          <span className="font-display font-bold text-2xl tracking-tight text-ivory">
            SayMy<span className="text-terracotta-soft">Tech</span>
          </span>
        </motion.div>

        <AnimatePresence mode="wait">
          {personalized ? (
            <motion.div
              key="personalized"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="glass-panel glow-border inline-flex items-center gap-2 text-xs md:text-sm text-gold rounded-full px-4 py-1.5 mb-8"
            >
              <Sparkles size={13} />
              {personalized.greeting}
            </motion.div>
          ) : (
            <motion.div
              key="default"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="glass-panel glow-border inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-gold rounded-full px-4 py-1.5 mb-8"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
              Building for everyday problems, everywhere
            </motion.div>
          )}
        </AnimatePresence>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-display font-bold text-5xl md:text-7xl leading-[1.05] max-w-4xl"
        >
          Software that solves
          <span className="block text-terracotta">
            {variant ? variant.word : <RotatingWord words={PROBLEMS} />}
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-5 font-mono text-sm tracking-widest uppercase text-terracotta-soft"
        >
          It's Your Tech
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-8 text-lg md:text-xl text-ivory/70 max-w-2xl leading-relaxed"
        >
          {variant
            ? variant.subtext
            : "SayMyTech Developers designs and builds AI-integrated software that solves real, everyday problems — for study, money, health, communication, and work. No region limits our thinking, and no corner gets cut on design or engineering."}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-10 flex flex-wrap gap-4"
        >
          <Magnetic>
            <Link
              to={personalized ? '/portal' : '/contact'}
              className="focus-ring inline-flex items-center gap-2 bg-terracotta hover:bg-terracotta-soft text-ivory font-medium px-6 py-3.5 rounded-xl transition-colors"
            >
              {personalized ? personalized.ctaLabel : 'Start a project'} <ArrowRight size={18} />
            </Link>
          </Magnetic>
          <Magnetic>
            <Link
              to="/products"
              className="focus-ring glass-panel inline-flex items-center gap-2 hover:bg-ivory/10 text-ivory font-medium px-6 py-3.5 rounded-xl transition-colors"
            >
              See what we've built
            </Link>
          </Magnetic>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 flex items-center gap-6 text-sm text-ivory/50 font-mono"
        >
          <span className="flex items-center gap-2"><Sparkles size={16} /> AI where it actually helps</span>
          <span className="w-px h-4 bg-ivory/20" />
          <span className="flex items-center gap-2"><Globe2 size={16} /> Built for any market, any user</span>
        </motion.div>
      </div>
    </section>
  )
}
