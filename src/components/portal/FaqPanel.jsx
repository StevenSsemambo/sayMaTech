import { useState, useEffect } from 'react'
import { HelpCircle, Plus, Trash2, Pencil } from 'lucide-react'
import { supabase } from '../../lib/supabase'

function FaqForm({ initial, onSave, onCancel }) {
  const [question, setQuestion] = useState(initial?.question || '')
  const [answer, setAnswer] = useState(initial?.answer || '')
  const [category, setCategory] = useState(initial?.category || '')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    await onSave({ question, answer, category: category || null })
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="glass-panel-light rounded-xl p-4 space-y-3">
      <input
        required
        placeholder="Question"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        className="focus-ring w-full rounded-lg border border-ink/15 px-3 py-2 text-sm"
      />
      <textarea
        required
        rows={3}
        placeholder="Answer"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        className="focus-ring w-full rounded-lg border border-ink/15 px-3 py-2 text-sm resize-none"
      />
      <input
        placeholder="Category (optional, e.g. Pricing, Process)"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="focus-ring w-full rounded-lg border border-ink/15 px-3 py-2 text-sm"
      />
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="focus-ring text-sm bg-ink text-ivory px-3.5 py-2 rounded-lg disabled:opacity-50">
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button type="button" onClick={onCancel} className="focus-ring text-sm text-ink/50 px-3.5 py-2">
          Cancel
        </button>
      </div>
    </form>
  )
}

export default function FaqPanel() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState(null)

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('faq_entries').select('*').order('created_at', { ascending: false })
    setEntries(data || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function handleAdd(values) {
    await supabase.from('faq_entries').insert(values)
    setAdding(false)
    load()
  }

  async function handleEdit(id, values) {
    await supabase.from('faq_entries').update(values).eq('id', id)
    setEditingId(null)
    load()
  }

  async function handleDelete(id) {
    await supabase.from('faq_entries').delete().eq('id', id)
    setEntries((es) => es.filter((e) => e.id !== id))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <HelpCircle size={16} className="text-terracotta" />
          <h2 className="font-display font-bold text-lg text-ink">Knowledge base / FAQ</h2>
        </div>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="focus-ring flex items-center gap-1.5 text-sm bg-terracotta text-ivory px-3.5 py-2 rounded-lg"
          >
            <Plus size={15} /> Add entry
          </button>
        )}
      </div>
      <p className="text-sm text-ink/50 mb-5">
        Public and grounds the AI assistant's answers — edit here anytime, no code changes needed.
      </p>

      {adding && (
        <div className="mb-4">
          <FaqForm onSave={handleAdd} onCancel={() => setAdding(false)} />
        </div>
      )}

      {loading ? (
        <p className="text-ink/40 text-sm">Loading…</p>
      ) : entries.length === 0 ? (
        <p className="text-ink/40 text-sm">No FAQ entries yet — add your first one above.</p>
      ) : (
        <div className="space-y-2">
          {entries.map((e) =>
            editingId === e.id ? (
              <FaqForm
                key={e.id}
                initial={e}
                onSave={(values) => handleEdit(e.id, values)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div key={e.id} className="glass-panel-light rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    {e.category && (
                      <span className="text-[10px] font-mono uppercase tracking-wide text-savanna">{e.category}</span>
                    )}
                    <p className="text-sm font-medium text-ink mt-0.5">{e.question}</p>
                    <p className="text-sm text-ink/60 mt-1">{e.answer}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => setEditingId(e.id)} className="focus-ring text-ink/40 hover:text-terracotta p-1.5">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(e.id)} className="focus-ring text-ink/40 hover:text-terracotta p-1.5">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  )
}
