import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function CtaBanner() {
  return (
    <section className="bg-terracotta px-6 py-20 relative overflow-hidden">
      <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-gold/20 blur-3xl" />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto text-center relative"
      >
        <h2 className="font-display font-bold text-3xl md:text-4xl text-ivory">
          Have something worth building?
        </h2>
        <p className="mt-4 text-ivory/85 text-lg">
          Tell us what you're trying to build. We'll reply with real next steps.
        </p>
        <Link
          to="/contact"
          className="focus-ring mt-8 inline-flex items-center gap-2 bg-ink hover:bg-ink-soft text-ivory font-medium px-6 py-3.5 rounded-xl transition-colors"
        >
          Start a project <ArrowRight size={18} />
        </Link>
      </motion.div>
    </section>
  )
}
