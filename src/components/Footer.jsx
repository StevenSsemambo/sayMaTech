import LogoMark from './Logo'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-ink text-ivory/60 px-6 py-10">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
        <span className="flex items-center gap-2">
          <LogoMark size={26} />
          <span className="font-display font-semibold text-ivory">
            SayMy<span className="text-terracotta">Tech</span> Developers
          </span>
        </span>
        <span className="font-mono text-xs tracking-wide">It's Your Tech</span>
        <span>Software for everyday problems, everywhere</span>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/StevenSsemambo/"
            target="_blank"
            rel="noreferrer"
            className="focus-ring hover:text-terracotta transition-colors"
          >
            GitHub
          </a>
          <Link to="/portal" className="focus-ring text-ivory/30 hover:text-ivory/60 text-xs transition-colors">
            Portal
          </Link>
        </div>
      </div>
    </footer>
  )
}
