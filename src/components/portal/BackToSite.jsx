import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import LogoMark from '../Logo'

export default function BackToSite({ dark = false }) {
  return (
    <div className="fixed top-0 inset-x-0 z-40 px-6 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link to="/" className={`focus-ring flex items-center gap-2 ${dark ? 'text-ivory' : 'text-ink'}`}>
          <LogoMark size={28} />
        </Link>
        <Link
          to="/"
          className={`focus-ring flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
            dark ? 'text-ivory/70 hover:text-ivory bg-ivory/10' : 'text-ink/60 hover:text-terracotta bg-ink/5'
          }`}
        >
          <ArrowLeft size={13} /> Back to site
        </Link>
      </div>
    </div>
  )
}
