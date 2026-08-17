import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'

const products = [
  { name: 'EliAi — Elimu Learn', tag: 'Education', desc: 'Offline-first learning companion for Ugandan S1–S6 students.' },
  { name: 'StudyFellow', tag: 'Education / AI', desc: 'AI video learning companion built for African classrooms.' },
  { name: 'YoSacco', tag: 'Finance', desc: 'Offline-first SACCO management for Emyooga, PDM and OWC groups.' },
  { name: 'ProfitMind AI', tag: 'Retail', desc: 'Offline POS, stock and finance with a rule-based AI advisor.' },
  { name: 'SayMyDoc', tag: 'Health', desc: 'Offline health companion built for low-connectivity Uganda.' },
  { name: 'GasWatch Pro', tag: 'IoT', desc: 'Real-time LPG monitoring to prevent gas leaks and outages.' },
  { name: 'Leafy', tag: 'Messaging', desc: 'A WhatsApp-style messaging PWA built for low-bandwidth use.' },
  { name: 'YoSpeech', tag: 'Wellness', desc: 'Speech coaching for stuttering and confident public speaking.' },
  { name: 'PipStart', tag: 'Finance / Education', desc: 'Forex education localised for African traders.' },
]

export default function Products() {
  return (
    <section id="products" className="bg-ivory-dim px-6 py-24">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="mb-14 max-w-2xl"
        >
          <span className="text-xs font-mono uppercase tracking-widest text-terracotta">Our product line</span>
          <h2 className="font-display font-bold text-3xl md:text-4xl mt-3 text-ink">
            Real products, already in people's hands.
          </h2>
          <p className="mt-4 text-ink/60 leading-relaxed">
            Every one of these ships as an offline-first PWA — proof of how we build, not just what we say.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: (i % 3) * 0.08 }}
              className="group bg-ivory rounded-xl p-6 border border-ink/8 hover:border-terracotta/40 hover:-translate-y-1 transition-all duration-300"
            >
              <span className="text-[11px] font-mono uppercase tracking-wide text-savanna">{p.tag}</span>
              <h3 className="font-display font-bold text-lg mt-2 text-ink flex items-center gap-1.5">
                {p.name}
                <ArrowUpRight size={15} className="text-terracotta opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="mt-2 text-sm text-ink/60 leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
