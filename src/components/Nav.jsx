import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import LogoMark from './Logo'

const links = [
  { href: '/services', label: 'For Businesses' },
  { href: '/products', label: 'Our Products' },
  { href: '/about', label: 'About' },
  { href: '/faq', label: 'FAQ' },
]

export default function Nav() {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-ivory/95 backdrop-blur-sm shadow-sm border-b border-ink/5">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
        <Link to="/" className="focus-ring flex items-center gap-2.5">
          <LogoMark size={38} />
          <span className="flex flex-col leading-none">
            <span className="font-display font-bold text-xl tracking-tight text-ink">
              SayMy<span className="text-terracotta">Tech</span>
            </span>
            <span className="text-[10px] font-mono text-ink/40 tracking-wide">It's Your Tech</span>
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
            to="/portal"
            className="focus-ring text-sm font-medium text-ink/60 hover:text-terracotta transition-colors"
          >
            Client Portal
          </Link>
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
          <Link to="/portal" onClick={() => setOpen(false)} className="text-sm font-medium text-ink/60">
            Client Portal
          </Link>
          <Link to="/contact" onClick={() => setOpen(false)} className="text-sm font-medium text-terracotta">
            Start a Project
          </Link>
        </div>
      )}
    </header>
  )
}
