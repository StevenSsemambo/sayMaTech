import { useState, useEffect } from 'react'
import { Newspaper, Sparkles, Loader2, Eye, EyeOff, Trash2, Copy } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { logAudit } from '../../lib/audit'

function GenerateForm({ onGenerated }) {
  const [topic, setTopic] = useState('')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  async function handleGenerate(e) {
    e.preventDefault()
    setGenerating(true)
    setError('')
    try {
      const res = await fetch('/.netlify/functions/generate-blog-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      })
      const data = await res.json()
      if (data.post) {
        onGenerated(data.post)
        setTopic('')
      } else {
        setError(data.error || 'Failed to draft — try again.')
      }
    } catch {
      setError('Something went wrong.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <form onSubmit={handleGenerate} className="glass-panel-light rounded-xl p-4 space-y-3 mb-4">
      <textarea
        required
        rows={3}
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="Give the AI a topic or a few bullet points, e.g. 'why offline-first matters for African apps, mention connectivity gaps and our EliAi product'"
        className="focus-ring w-full rounded-lg border border-ink/15 px-3 py-2 text-sm resize-none"
      />
      {error && <p className="text-xs text-terracotta">{error}</p>}
      <button
        type="submit"
        disabled={generating}
        className="focus-ring flex items-center gap-1.5 text-sm bg-terracotta text-ivory px-3.5 py-2 rounded-lg disabled:opacity-50"
      >
        {generating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
        {generating ? 'Drafting…' : 'Draft with AI'}
      </button>
    </form>
  )
}

function EditDraft({ draft, onSaved, onCancel }) {
  const [post, setPost] = useState(draft)
  const [saving, setSaving] = useState(false)

  async function publish(status) {
    setSaving(true)
    const payload = {
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      category: post.category,
      content: post.content,
      social_share_text: post.social_share_text,
      status,
      published_at: status === 'published' ? new Date().toISOString() : null,
    }
    if (post.id) {
      await supabase.from('blog_posts').update(payload).eq('id', post.id)
    } else {
      await supabase.from('blog_posts').insert(payload)
    }
    logAudit(status === 'published' ? 'blog_post_published' : 'blog_post_saved_draft', 'blog_post', post.id || null, post.title)
    setSaving(false)
    onSaved()
  }

  return (
    <div className="glass-panel-light rounded-xl p-4 space-y-3 mb-4">
      <input
        value={post.title}
        onChange={(e) => setPost({ ...post, title: e.target.value })}
        className="focus-ring w-full rounded-lg border border-ink/15 px-3 py-2 text-sm font-medium"
        placeholder="Title"
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          value={post.slug}
          onChange={(e) => setPost({ ...post, slug: e.target.value })}
          className="focus-ring rounded-lg border border-ink/15 px-3 py-2 text-xs font-mono"
          placeholder="url-slug"
        />
        <input
          value={post.category}
          onChange={(e) => setPost({ ...post, category: e.target.value })}
          className="focus-ring rounded-lg border border-ink/15 px-3 py-2 text-xs"
          placeholder="Category"
        />
      </div>
      <input
        value={post.excerpt}
        onChange={(e) => setPost({ ...post, excerpt: e.target.value })}
        className="focus-ring w-full rounded-lg border border-ink/15 px-3 py-2 text-sm"
        placeholder="Excerpt"
      />
      <textarea
        value={post.content}
        onChange={(e) => setPost({ ...post, content: e.target.value })}
        rows={12}
        className="focus-ring w-full rounded-lg border border-ink/15 px-3 py-2 text-xs font-mono resize-y"
      />
      <div className="flex items-center gap-2">
        <input
          value={post.social_share_text}
          onChange={(e) => setPost({ ...post, social_share_text: e.target.value })}
          className="focus-ring flex-1 rounded-lg border border-ink/15 px-3 py-2 text-xs"
          placeholder="Social share blurb"
        />
        <button
          type="button"
          onClick={() => navigator.clipboard.writeText(post.social_share_text || '')}
          className="focus-ring text-ink/40 hover:text-terracotta p-2"
          aria-label="Copy social text"
        >
          <Copy size={14} />
        </button>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => publish('published')}
          disabled={saving}
          className="focus-ring text-sm bg-savanna text-ivory px-3.5 py-2 rounded-lg disabled:opacity-50"
        >
          Publish
        </button>
        <button
          onClick={() => publish('draft')}
          disabled={saving}
          className="focus-ring text-sm bg-ink text-ivory px-3.5 py-2 rounded-lg disabled:opacity-50"
        >
          Save draft
        </button>
        <button onClick={onCancel} className="focus-ring text-sm text-ink/50 px-3.5 py-2">
          Cancel
        </button>
      </div>
    </div>
  )
}

export default function BlogPanel() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false })
    setPosts(data || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function toggleStatus(post) {
    const status = post.status === 'published' ? 'draft' : 'published'
    await supabase
      .from('blog_posts')
      .update({ status, published_at: status === 'published' ? new Date().toISOString() : post.published_at })
      .eq('id', post.id)
    logAudit(status === 'published' ? 'blog_post_published' : 'blog_post_unpublished', 'blog_post', post.id, post.title)
    load()
  }

  async function remove(post) {
    await supabase.from('blog_posts').delete().eq('id', post.id)
    logAudit('blog_post_deleted', 'blog_post', post.id, post.title)
    setPosts((ps) => ps.filter((p) => p.id !== post.id))
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <Newspaper size={16} className="text-terracotta" />
        <h2 className="font-display font-bold text-lg text-ink">Blog</h2>
      </div>
      <p className="text-sm text-ink/50 mb-5">
        Give the AI a topic, review the draft, publish. Every post gets a ready-to-copy social blurb.
      </p>

      {editing ? (
        <EditDraft
          draft={editing}
          onSaved={() => {
            setEditing(null)
            load()
          }}
          onCancel={() => setEditing(null)}
        />
      ) : (
        <GenerateForm onGenerated={(post) => setEditing(post)} />
      )}

      {loading ? (
        <p className="text-ink/40 text-sm">Loading…</p>
      ) : posts.length === 0 ? (
        <p className="text-ink/40 text-sm">No posts yet — draft your first one above.</p>
      ) : (
        <div className="space-y-2">
          {posts.map((p) => (
            <div key={p.id} className="glass-panel-light rounded-xl p-4 flex items-center justify-between gap-3 flex-wrap">
              <div className="min-w-0 cursor-pointer" onClick={() => setEditing(p)}>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-ink truncate">{p.title}</p>
                  <span
                    className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full shrink-0 ${
                      p.status === 'published' ? 'bg-savanna/15 text-savanna' : 'bg-ink/10 text-ink/50'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
                <p className="text-xs text-ink/40 mt-0.5">{p.category} · {new Date(p.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => toggleStatus(p)} className="focus-ring text-ink/40 hover:text-terracotta p-1.5">
                  {p.status === 'published' ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button onClick={() => remove(p)} className="focus-ring text-ink/40 hover:text-terracotta p-1.5">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
