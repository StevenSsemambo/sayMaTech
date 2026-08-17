import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Code2, Sparkles, LifeBuoy } from 'lucide-react'
import Process from '../components/Process'

const services = [
  {
    icon: Code2,
    title: 'Custom software builds',
    desc: 'Web apps, mobile-friendly PWAs, and full systems built around what your users actually need to get done.',
  },
  {
    icon: Sparkles,
    title: 'AI integration',
    desc: 'AI features that solve a real problem in your product — assistants, advisors, smart search — never bolted on for show.',
  },
  {
    icon: LifeBuoy,
    title: 'Ongoing support & growth',
    desc: "Shipping is the start. We stay involved as your product and user base grow, not just for launch day.",
  },
]

export default function ServicesPage() {
  return (
    <>
      <section className="bg-ink text-ivory px-6 pt-36 pb-16">
        <div className="max-w-6xl mx-auto">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-xs font-mono uppercase tracking-widest text-gold"
          >
            For businesses
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="font-display font-bold text-4xl md:text-5xl mt-3 max-w-2xl"
          >
            A dev partner that ships what it promises.
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Link
              to="/contact"
              className="focus-ring mt-8 inline-flex items-center gap-2 bg-terracotta hover:bg-terracotta-soft text-ivory font-medium px-6 py-3.5 rounded-xl transition-colors"
            >
              Start a project <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="bg-ivory px-6 py-24">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
          {services.map((s, i) => {
            const Icon = s.icon
            return (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="rounded-2xl border border-ink/10 p-8"
              >
                <Icon className="text-terracotta mb-5" size={26} />
                <h3 className="font-display font-bold text-xl text-ink mb-2">{s.title}</h3>
                <p className="text-ink/60 text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            )
          })}
        </div>
      </section>

      <Process />
    </>
  )
}
