import { motion } from 'framer-motion'
import Products from '../components/Products'
import AppShowcase from '../components/AppShowcase'
import PromoBanner from '../components/PromoBanner'

export default function ProductsPage() {
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
            Our products
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="font-display font-bold text-4xl md:text-5xl mt-3 max-w-2xl"
          >
            Software we've built to solve real problems.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-4 text-ivory/60 max-w-xl"
          >
            Filter by category, or dig into how a few of these actually look and feel below.
          </motion.p>
        </div>
      </section>
      <PromoBanner />
      <Products showFilters title="Browse the full product line." />
      <AppShowcase />
    </>
  )
}
