import { products } from '../data/products'

const names = products.map((p) => p.name)
const doubled = [...names, ...names]

export default function Marquee() {
  return (
    <div className="bg-ink py-4 overflow-hidden border-y border-ivory/10">
      <div className="flex gap-8 animate-marquee whitespace-nowrap">
        {doubled.map((name, i) => (
          <span key={i} className="text-ivory/40 font-mono text-sm tracking-wide flex items-center gap-8">
            {name}
            <span className="text-terracotta">•</span>
          </span>
        ))}
      </div>
    </div>
  )
}
