import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

const links = [
  { href: '/services', label: 'For Businesses' },
  { href: '/products', label: 'Our Products' },
  { href: '/about', label: 'About' },
]

export default function Nav() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${
        scrolled ? 'bg-ivory/90 backdrop-blur-sm shadow-sm' : 'bg-transparent'
      }`}
    >
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <Link to="/" className="focus-ring flex items-baseline gap-2">
          <span className="font-display font-bold text-lg tracking-tight text-ink">
            SayMy<span className="text-terracotta">Tech</span>
          </span>
          <span className="hidden sm:inline text-xs font-mono text-ink/40 tracking-wide">
            It's Your Tech
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <NavLink
              key={l.href}
              to={l.href}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors focus-ring ${
                  isActive ? 'text-terracotta' : 'text-ink/80 hover:text-terracotta'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <Link
            to="/contact"
            className="focus-ring text-sm font-medium bg-ink text-ivory px-4 py-2 rounded-lg hover:bg-ink-soft transition-colors"
          >
            Start a Project
          </Link>
        </div>
        <button
          className="md:hidden text-ink focus-ring"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>
      {open && (
        <div className="md:hidden bg-ivory border-t border-ink/10 px-6 py-4 flex flex-col gap-4">
          {links.map((l) => (
            <NavLink
              key={l.href}
              to={l.href}
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-ink/80"
            >
              {l.label}
            </NavLink>
          ))}
          <Link to="/contact" onClick={() => setOpen(false)} className="text-sm font-medium text-terracotta">
            Start a Project
          </Link>
        </div>
      )}
    </header>
  )
}
