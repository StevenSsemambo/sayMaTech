import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Sparkles, Send, Loader2, ArrowUpRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { products } from '../data/products'

function RelatedProduct({ category }) {
  if (!category) return null
  const match = products.find((p) => p.category.toLowerCase() === category.toLowerCase())
  if (!match) return null

  return (
    <div className="glass-panel-light rounded-xl p-5 mt-8">
      <p className="text-[10px] font-mono uppercase tracking-widest text-terracotta mb-2">Related product</p>
      <p className="font-display font-bold text-ink">{match.name}</p>
      <p className="text-sm text-ink/60 mt-1">{match.desc}</p>
      <Link to="/products" className="focus-ring inline-flex items-center gap-1 text-xs text-terracotta font-medium mt-3">
        See it <ArrowUpRight size={13} />
      </Link>
    </div>
  )
}

function PostChat({ post }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function ask(e) {
    e.preventDefault()
    if (!input.trim() || loading) return
    const question = input
    setMessages((m) => [...m, { role: 'user', content: question }])
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/.netlify/functions/blog-post-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postTitle: post.title, postContent: post.content, question }),
      })
      const data = await res.json()
      setMessages((m) => [...m, { role: 'assistant', content: data.reply }])
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: "Couldn't answer that — try again." }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass-panel-light rounded-2xl p-5 mt-10">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={14} className="text-gold" />
        <p className="text-sm font-medium text-ink">Ask about this post</p>
      </div>

      {messages.length > 0 && (
        <div className="space-y-2 mb-3 max-h-56 overflow-y-auto">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed ${
                m.role === 'user' ? 'bg-terracotta text-ivory ml-auto rounded-br-sm' : 'bg-ivory-dim text-ink rounded-bl-sm'
              }`}
            >
              {m.content}
            </div>
          ))}
          {loading && <div className="bg-ivory-dim text-ink/50 rounded-lg px-3 py-2 text-xs w-fit">Thinking…</div>}
          <div ref={endRef} />
        </div>
      )}

      <form onSubmit={ask} className="flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about this article…"
          className="focus-ring flex-1 bg-ivory-dim rounded-lg px-3 py-2 text-xs"
        />
        <button type="submit" disabled={loading} className="focus-ring bg-terracotta text-ivory rounded-lg p-2 disabled:opacity-50">
          <Send size={14} />
        </button>
      </form>
    </div>
  )
}

export default function BlogPostPage() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle()
      .then(({ data }) => {
        setPost(data)
        setLoading(false)
      })
  }, [slug])

  if (loading) {
    return <div className="pt-32 pb-24 px-6 bg-ivory min-h-screen text-ink/40 text-sm text-center">Loading…</div>
  }

  if (!post) {
    return (
      <div className="pt-32 pb-24 px-6 bg-ivory min-h-screen text-center">
        <p className="text-ink/60">Post not found.</p>
        <Link to="/blog" className="focus-ring text-terracotta text-sm mt-2 inline-block">Back to blog</Link>
      </div>
    )
  }

  return (
    <div className="pt-32 pb-24 px-6 bg-ivory min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        <Link to="/blog" className="focus-ring inline-flex items-center gap-1.5 text-xs text-ink/50 hover:text-terracotta mb-6">
          <ArrowLeft size={13} /> All posts
        </Link>

        <div className="flex items-center gap-2 mb-3">
          {post.category && <span className="text-[10px] font-mono uppercase tracking-wide text-savanna">{post.category}</span>}
          <span className="text-[10px] font-mono text-ink/30">
            {post.published_at ? new Date(post.published_at).toLocaleDateString() : ''}
          </span>
        </div>
        <h1 className="font-display font-bold text-3xl md:text-4xl text-ink mb-6">{post.title}</h1>

        <div className="text-ink/70 leading-relaxed whitespace-pre-wrap text-sm md:text-base">{post.content}</div>

        <RelatedProduct category={post.category} />
        <PostChat post={post} />
      </motion.div>
    </div>
  )
}
