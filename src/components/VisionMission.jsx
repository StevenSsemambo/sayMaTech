import { motion } from 'framer-motion'
import { Compass, Target } from 'lucide-react'

export default function VisionMission() {
  return (
    <section className="bg-ivory px-6 py-24">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-ink/10 p-10"
        >
          <Compass className="text-terracotta mb-6" size={26} />
          <span className="text-xs font-mono uppercase tracking-widest text-terracotta">Vision</span>
          <p className="mt-3 font-display font-bold text-2xl md:text-3xl text-ink leading-snug">
            To build software that transforms the world.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-2xl border border-ink/10 p-10"
        >
          <Target className="text-savanna mb-6" size={26} />
          <span className="text-xs font-mono uppercase tracking-widest text-savanna">Mission</span>
          <p className="mt-3 font-display font-semibold text-xl md:text-2xl text-ink leading-snug">
            To design and build AI-integrated software that solves real, everyday problems —
            for study, money, health, communication, and work — for anyone, anywhere.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
