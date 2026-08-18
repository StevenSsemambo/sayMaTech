export default function CompassS({ size = 64, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="csGrad" x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F2B705" />
          <stop offset="100%" stopColor="#E8622C" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="17" fill="#0B1F1A" />
      {/* S built from two opposing arcs, forming a compass needle */}
      <path
        d="M42 20 C 42 14 20 14 20 24 C 20 32 44 32 44 40 C 44 50 22 50 22 44"
        fill="none"
        stroke="url(#csGrad)"
        strokeWidth="6"
        strokeLinecap="round"
      />
      {/* needle point accents at each end */}
      <circle cx="42" cy="20" r="3.2" fill="#F2B705" />
      <circle cx="22" cy="44" r="3.2" fill="#1B6B4A" />
    </svg>
  )
}
