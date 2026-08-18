import { useRef, useEffect } from 'react'

export default function CursorGlow() {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const parent = el.parentElement
    const handleMove = (e) => {
      const rect = parent.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      el.style.transform = `translate(${x - 200}px, ${y - 200}px)`
      el.style.opacity = '1'
    }
    const handleLeave = () => {
      el.style.opacity = '0'
    }
    parent.addEventListener('mousemove', handleMove)
    parent.addEventListener('mouseleave', handleLeave)
    return () => {
      parent.removeEventListener('mousemove', handleMove)
      parent.removeEventListener('mouseleave', handleLeave)
    }
  }, [])

  return (
    <div
      ref={ref}
      className="pointer-events-none absolute top-0 left-0 w-[400px] h-[400px] rounded-full opacity-0 transition-opacity duration-300"
      style={{
        background: 'radial-gradient(circle, rgba(232,98,44,0.18) 0%, rgba(232,98,44,0) 70%)',
        willChange: 'transform',
      }}
      aria-hidden="true"
    />
  )
}
