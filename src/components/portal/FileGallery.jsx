import { useState, useEffect } from 'react'
import { Image as ImageIcon } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function FileGallery({ projectId }) {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('messages')
        .select('id, image_url, created_at')
        .eq('project_id', projectId)
        .not('image_url', 'is', null)
        .order('created_at', { ascending: false })
      setImages(data || [])
      setLoading(false)
    }
    load()
  }, [projectId])

  if (loading) return null
  if (images.length === 0) return null

  return (
    <div className="mt-3">
      <p className="text-xs font-mono uppercase tracking-wide text-ink/40 mb-2 flex items-center gap-1.5">
        <ImageIcon size={12} /> Files ({images.length})
      </p>
      <div className="grid grid-cols-4 gap-1.5">
        {images.slice(0, 8).map((img) => (
          <a key={img.id} href={img.image_url} target="_blank" rel="noreferrer" className="focus-ring block">
            <img src={img.image_url} alt="" className="w-full h-14 object-cover rounded-md hover:opacity-80 transition-opacity" />
          </a>
        ))}
      </div>
    </div>
  )
}
