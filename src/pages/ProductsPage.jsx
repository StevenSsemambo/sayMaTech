import { motion } from 'framer-motion'
import Products from '../components/Products'
import AppShowcase from '../components/AppShowcase'
import PromoBanner from '../components/PromoBanner'
import FeaturedSpotlight from '../components/FeaturedSpotlight'
import ConceptLab from '../components/ConceptLab'
import Marquee from '../components/Marquee'
import StatsStrip from '../components/StatsStrip'
import CtaBanner from '../components/CtaBanner'
import SignalField from '../components/SignalField'
import CursorGlow from '../components/CursorGlow'

export default function ProductsPage() {
  return (
    <>
      <section className="relative bg-ink text-ivory px-6 pt-36 pb-20 overflow-hidden">
        <SignalField density={0.00007} />
        <CursorGlow />
        <div className="relative max-w-6xl mx-auto">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-panel glow-border inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-gold rounded-full px-4 py-1.5 mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
            The full catalog
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="font-display font-bold text-5xl md:text-6xl max-w-3xl leading-[1.05]"
          >
            Software we've built —
            <span className="block text-terracotta">and where we're headed next.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-5 text-ivory/60 max-w-xl text-lg"
          >
            Real products, real interfaces, and a look at what's on the roadmap.
          </motion.p>
        </div>
      </section>

      <Marquee />
      <FeaturedSpotlight />
      <StatsStrip />
      <PromoBanner />
      <Products showFilters title="Browse the full product line." />
      <AppShowcase />
      <ConceptLab />
      <CtaBanner />
    </>
  )
}
