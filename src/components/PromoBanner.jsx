import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useSearchParams } from 'react-router-dom'
import { Sparkles, TrendingUp, ArrowRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { products } from '../data/products'
import Magnetic from './Magnetic'

// Maps the site's plain-language interest keys to actual product categories
const INTEREST_TO_CATEGORY = {
  study: 'Education',
  money: 'Finance',
  health: 'Health',
  communication: 'Communication',
  work: 'Business',
}

export default function PromoBanner() {
  const [searchParams] = useSearchParams()
  const interest = searchParams.get('interest')
  const [trending, setTrending] = useState(null)
  const [loading, setLoading] = useState(!interest)

  useEffect(() => {
    if (interest) return
    supabase
      .rpc('get_trending_category')
      .then(({ data }) => {
        if (data && data.length > 0) setTrending(data[0])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [interest])

  // Tier 1: interest-driven product spotlight (instant, no network call)
  if (interest && INTEREST_TO_CATEGORY[interest]) {
    const category = INTEREST_TO_CATEGORY[interest]
    const product = products.find((p) => p.category === category)
    if (product) {
      return (
        <section className="bg-ivory px-6 py-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4 }}
            className="max-w-6xl mx-auto glass-panel-light rounded-2xl px-6 py-5 flex items-center justify-between gap-4 flex-wrap border border-terracotta/20"
          >
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-lg bg-terracotta/15 flex items-center justify-center shrink-0">
                <Sparkles size={16} className="text-terracotta" />
              </span>
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-terracotta">Recommended for you</p>
                <p className="text-sm text-ink/80 mt-0.5">
                  <strong className="text-ink">{product.name}</strong> — {product.desc}
                </p>
              </div>
            </div>
            <Magnetic>
              <Link
                to="/products"
                className="focus-ring shrink-0 flex items-center gap-1 text-sm font-medium bg-terracotta text-ivory px-4 py-2 rounded-lg"
              >
                See it <ArrowRight size={14} />
              </Link>
            </Magnetic>
          </motion.div>
        </section>
      )
    }
  }

  // Tier 2: real trending data from recent leads
  if (!loading && trending) {
    return (
      <section className="bg-ivory px-6 py-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.4 }}
          className="max-w-6xl mx-auto glass-panel-light rounded-2xl px-6 py-5 flex items-center justify-between gap-4 flex-wrap border border-gold/25"
        >
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-lg bg-gold/15 flex items-center justify-center shrink-0">
              <TrendingUp size={16} className="text-gold" />
            </span>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-gold">Trending this month</p>
              <p className="text-sm text-ink/80 mt-0.5">
                {trending.lead_count} recent {trending.lead_count === 1 ? 'inquiry' : 'inquiries'} about{' '}
                <strong className="text-ink">{trending.category}</strong> — thinking something similar?
              </p>
            </div>
          </div>
          <Magnetic>
            <Link
              to="/contact"
              className="focus-ring shrink-0 flex items-center gap-1 text-sm font-medium bg-ink text-ivory px-4 py-2 rounded-lg"
            >
              Let's talk <ArrowRight size={14} />
            </Link>
          </Magnetic>
        </motion.div>
      </section>
    )
  }

  // Tier 3: evergreen fallback (no data yet, no interest param)
  if (!loading) {
    return (
      <section className="bg-ivory px-6 py-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.4 }}
          className="max-w-6xl mx-auto glass-panel-light rounded-2xl px-6 py-5 flex items-center justify-between gap-4 flex-wrap border border-ink/10"
        >
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-lg bg-ink/8 flex items-center justify-center shrink-0">
              <Sparkles size={16} className="text-ink/50" />
            </span>
            <p className="text-sm text-ink/70">
              Every SayMyTech product ships solving one real, specific problem — see the full line.
            </p>
          </div>
          <Magnetic>
            <Link
              to="/products"
              className="focus-ring shrink-0 flex items-center gap-1 text-sm font-medium bg-ink text-ivory px-4 py-2 rounded-lg"
            >
              Browse products <ArrowRight size={14} />
            </Link>
          </Magnetic>
        </motion.div>
      </section>
    )
  }

  return null
}
