export default function FingerprintCircuit({ size = 64, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="fpGrad" x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F2B705" />
          <stop offset="55%" stopColor="#E8622C" />
          <stop offset="100%" stopColor="#C94E1F" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="17" fill="url(#fpGrad)" />
      {/* fingerprint ridges as nested arcs */}
      <g fill="none" stroke="#FDF8F0" strokeWidth="2.1" strokeLinecap="round">
        <path d="M32 14 C 20 14 13 22 13 32 C 13 42 20 49 30 50" />
        <path d="M32 19 C 23 19 18 25 18 32 C 18 40 23 45 30 46" />
        <path d="M32 24 C 26 24 23 28 23 32 C 23 37 26 41 31 42" />
        <path d="M32 14 C 44 14 51 22 51 32 C 51 38 48 43 43 46" />
        <path d="M32 19 C 41 19 46 25 46 32 C 46 37 43 41 39 43" />
      </g>
      {/* circuit nodes breaking two ridge lines */}
      <rect x="10.5" y="30.5" width="3" height="3" fill="#0B1F1A" />
      <rect x="48.5" y="30.5" width="3" height="3" fill="#0B1F1A" />
      <circle cx="30" cy="50" r="1.8" fill="#0B1F1A" />
    </svg>
  )
}
