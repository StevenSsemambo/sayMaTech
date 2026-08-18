import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { products, categories } from '../data/products'

function Counter({ to, suffix = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!inView) return
    let frame
    const duration = 900
    const start = performance.now()
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1)
      setValue(Math.floor(progress * to))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [inView, to])

  return (
    <span ref={ref}>
      {value}
      {suffix}
    </span>
  )
}

const stats = [
  { value: products.length, suffix: '+', label: 'Products shipped' },
  { value: categories.length - 1, suffix: '', label: 'Problem categories covered' },
  { value: 1, suffix: '', label: 'AI assistant, live on this site' },
]

export default function StatsStrip() {
  return (
    <section className="bg-ivory px-6 py-14 border-y border-ink/8">
      <div className="max-w-6xl mx-auto grid grid-cols-3 gap-6">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="text-center"
          >
            <p className="font-display font-bold text-3xl md:text-4xl text-terracotta">
              <Counter to={s.value} suffix={s.suffix} />
            </p>
            <p className="mt-1.5 text-xs md:text-sm text-ink/60">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
