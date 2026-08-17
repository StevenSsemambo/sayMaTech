import { motion } from 'framer-motion'
import { ArrowRight, Wifi, WifiOff } from 'lucide-react'

export default function Hero() {
  return (
    <section id="top" className="relative bg-ink text-ivory pt-36 pb-28 px-6 overflow-hidden">
      {/* Ambient gold glow */}
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gold/10 blur-3xl" />
      <div className="absolute top-1/2 -left-32 w-80 h-80 rounded-full bg-terracotta/10 blur-3xl" />

      <div className="relative max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-gold border border-gold/30 rounded-full px-4 py-1.5 mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
          Kampala, Uganda — building for Africa
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-display font-bold text-5xl md:text-7xl leading-[1.05] max-w-4xl"
        >
          Software that works
          <span className="block text-terracotta">even when the network doesn't.</span>
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
          SayMyTech Developers designs and builds offline-first, AI-integrated products
          for African realities — patchy data, shared devices, low bandwidth — without
          cutting a single corner on design or engineering.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-10 flex flex-wrap gap-4"
        >
          <a
            href="#contact"
            className="focus-ring inline-flex items-center gap-2 bg-terracotta hover:bg-terracotta-soft text-ivory font-medium px-6 py-3.5 rounded-xl transition-colors"
          >
            Start a project <ArrowRight size={18} />
          </a>
          <a
            href="#products"
            className="focus-ring inline-flex items-center gap-2 border border-ivory/25 hover:border-ivory/50 text-ivory font-medium px-6 py-3.5 rounded-xl transition-colors"
          >
            See what we've built
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 flex items-center gap-6 text-sm text-ivory/50 font-mono"
        >
          <span className="flex items-center gap-2"><WifiOff size={16} /> Offline-first by default</span>
          <span className="w-px h-4 bg-ivory/20" />
          <span className="flex items-center gap-2"><Wifi size={16} /> Syncs when you're back</span>
        </motion.div>
      </div>
    </section>
  )
}
