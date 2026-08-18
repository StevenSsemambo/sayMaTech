import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { products, categories } from '../data/products'
import TiltCard from './TiltCard'

export default function Products({ limit, showFilters = false, title = "Real products, already in people's hands." }) {
  const [filter, setFilter] = useState('All')

  const visible = useMemo(() => {
    const filtered = filter === 'All' ? products : products.filter((p) => p.category === filter)
    return limit ? filtered.slice(0, limit) : filtered
  }, [filter, limit])

  return (
    <section className="bg-ivory-dim px-6 py-24">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="mb-10 max-w-2xl"
        >
          <span className="text-xs font-mono uppercase tracking-widest text-terracotta">Our product line</span>
          <h2 className="font-display font-bold text-3xl md:text-4xl mt-3 text-ink">{title}</h2>
          <p className="mt-4 text-ink/60 leading-relaxed">
            Every one of these ships solving a real, everyday problem — proof of how we build, not just what we say.
          </p>
        </motion.div>

        {showFilters && (
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`focus-ring text-xs font-mono uppercase tracking-wide px-3.5 py-2 rounded-full border transition-colors ${
                  filter === c
                    ? 'bg-terracotta text-ivory border-terracotta'
                    : 'bg-transparent text-ink/60 border-ink/15 hover:border-terracotta/50'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {visible.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.35, delay: (i % 3) * 0.06 }}
            >
              <TiltCard className="glass-panel-light group rounded-xl p-6 hover:shadow-lg hover:shadow-terracotta/10 transition-shadow duration-300">
                <span className="text-[11px] font-mono uppercase tracking-wide text-savanna">{p.tag}</span>
                <h3 className="font-display font-bold text-lg mt-2 text-ink flex items-center gap-1.5">
                  {p.name}
                  <ArrowUpRight size={15} className="text-terracotta opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="mt-2 text-sm text-ink/60 leading-relaxed">{p.desc}</p>
              </TiltCard>
            </motion.div>
          ))}
        </div>

        {limit && products.length > limit && (
          <div className="mt-10 text-center">
            <Link
              to="/products"
              className="focus-ring inline-flex items-center gap-1 text-terracotta font-medium text-sm"
            >
              See all {products.length} products <ArrowUpRight size={15} />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
