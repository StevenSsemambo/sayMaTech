import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GitCommit, Loader2 } from 'lucide-react'

const REPO = 'StevenSsemambo/sayMaTech'

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

export default function ShippedFeed() {
  const [commits, setCommits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true
    fetch(`https://api.github.com/repos/${REPO}/commits?per_page=6`)
      .then((res) => {
        if (!res.ok) throw new Error('failed')
        return res.json()
      })
      .then((data) => {
        if (active) {
          setCommits(data)
          setLoading(false)
        }
      })
      .catch(() => {
        if (active) {
          setError(true)
          setLoading(false)
        }
      })
    return () => {
      active = false
    }
  }, [])

  if (error || (!loading && commits.length === 0)) return null

  return (
    <section className="bg-ivory px-6 py-20 border-t border-ink/8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <span className="text-xs font-mono uppercase tracking-widest text-terracotta">Live from our repo</span>
          <h2 className="font-display font-bold text-2xl md:text-3xl mt-2 text-ink">Recently shipped.</h2>
          <p className="text-sm text-ink/50 mt-1">
            Pulled automatically from our GitHub activity — no one updates this by hand.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-ink/40 text-sm">
            <Loader2 size={16} className="animate-spin" /> Loading recent activity…
          </div>
        ) : (
          <div className="space-y-2">
            {commits.map((c, i) => (
              <motion.a
                key={c.sha}
                href={c.html_url}
                target="_blank"
                rel="noreferrer"
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-ivory-dim transition-colors group"
              >
                <GitCommit size={15} className="text-terracotta shrink-0" />
                <span className="text-sm text-ink/80 truncate flex-1 group-hover:text-ink">
                  {c.commit.message.split('\n')[0]}
                </span>
                <span className="text-xs font-mono text-ink/35 shrink-0">
                  {timeAgo(c.commit.author.date)}
                </span>
              </motion.a>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
