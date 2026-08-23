import { motion } from 'framer-motion'
import { FlaskConical, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { concepts } from '../data/concepts'
import Magnetic from './Magnetic'

export default function ConceptLab() {
  return (
    <section className="bg-[#12291F] px-6 py-24 relative overflow-hidden">
      {/* Subtle blueprint grid texture to signal "not yet built" */}
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(253,248,240,1) 1px, transparent 1px), linear-gradient(90deg, rgba(253,248,240,1) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="mb-12 max-w-2xl"
        >
          <div className="flex items-center gap-2 mb-3">
            <FlaskConical size={16} className="text-gold" />
            <span className="text-xs font-mono uppercase tracking-widest text-gold">The Concept Lab</span>
          </div>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-ivory">
            What's next on the roadmap.
          </h2>
          <p className="mt-3 text-ivory/50 leading-relaxed">
            These aren't shipped products yet — they're where our thinking is headed. If one of
            these sounds like the problem you're facing, that's a conversation worth starting now.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-5">
          {concepts.map((c, i) => (
            <motion.div
              key={c.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="relative rounded-xl p-6 border border-dashed border-ivory/25 bg-ivory/[0.03]"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono uppercase tracking-widest text-ivory/40 border border-ivory/20 rounded-full px-2.5 py-1">
                  Concept · Coming soon
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-gold">{c.category}</span>
              </div>
              <h3 className="font-display font-bold text-lg text-ivory">{c.name}</h3>
              <p className="text-sm text-ivory/50 mt-1">{c.tagline}</p>
              <p className="text-sm text-ivory/40 mt-2 leading-relaxed">{c.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-10 text-center"
        >
          <Magnetic>
            <Link
              to="/contact"
              className="focus-ring inline-flex items-center gap-1.5 text-sm text-gold font-medium"
            >
              Have an idea like this? Let's talk <ArrowUpRight size={15} />
            </Link>
          </Magnetic>
        </motion.div>
      </div>
    </section>
  )
}
