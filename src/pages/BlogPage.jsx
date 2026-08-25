import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Newspaper, ArrowRight } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function BlogPage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .then(({ data }) => {
        setPosts(data || [])
        setLoading(false)
      })
  }, [])

  return (
    <div className="pt-32 pb-24 px-6 bg-ivory min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-3">
          <Newspaper size={18} className="text-terracotta" />
          <span className="text-xs font-mono uppercase tracking-widest text-terracotta">Blog</span>
        </div>
        <h1 className="font-display font-bold text-4xl text-ink mb-3">Notes from the studio.</h1>
        <p className="text-ink/60 mb-10">Thoughts on building software that actually solves problems.</p>

        {loading ? (
          <p className="text-ink/40 text-sm">Loading…</p>
        ) : posts.length === 0 ? (
          <p className="text-ink/40 text-sm">Nothing published yet — check back soon.</p>
        ) : (
          <div className="space-y-4">
            {posts.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.35, delay: (i % 6) * 0.05 }}
              >
                <Link to={`/blog/${p.slug}`} className="focus-ring block glass-panel-light rounded-2xl p-6 hover:shadow-lg hover:shadow-terracotta/10 transition-shadow group">
                  <div className="flex items-center gap-2 mb-2">
                    {p.category && (
                      <span className="text-[10px] font-mono uppercase tracking-wide text-savanna">{p.category}</span>
                    )}
                    <span className="text-[10px] font-mono text-ink/30">
                      {p.published_at ? new Date(p.published_at).toLocaleDateString() : ''}
                    </span>
                  </div>
                  <h2 className="font-display font-bold text-xl text-ink flex items-center gap-1.5">
                    {p.title}
                    <ArrowRight size={16} className="text-terracotta opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h2>
                  {p.excerpt && <p className="text-sm text-ink/60 mt-2">{p.excerpt}</p>}
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
