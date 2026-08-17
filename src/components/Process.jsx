import { motion } from 'framer-motion'

const steps = [
  { title: 'Understand the real problem', desc: 'We start with how your users actually live and work, not a generic spec sheet.' },
  { title: 'Design around it', desc: 'Architecture and interface decisions made for the real problem upfront, not patched on later.' },
  { title: 'Build and integrate AI where it earns its place', desc: 'AI features that solve a real problem for your users, not a badge on the homepage.' },
  { title: 'Ship, then keep it running', desc: 'Deployed, monitored, and supported — with room to grow as your users do.' },
]

export default function Process() {
  return (
    <section className="bg-ink text-ivory px-6 py-24">
      <div className="max-w-6xl mx-auto">
        <div className="mb-14 max-w-2xl">
          <span className="text-xs font-mono uppercase tracking-widest text-gold">How we work</span>
          <h2 className="font-display font-bold text-3xl md:text-4xl mt-3">From idea to something people rely on.</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-x-10 gap-y-10">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="flex gap-5"
            >
              <span className="font-mono text-terracotta text-sm pt-1">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h3 className="font-display font-semibold text-xl">{s.title}</h3>
                <p className="mt-2 text-ivory/60 leading-relaxed">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
