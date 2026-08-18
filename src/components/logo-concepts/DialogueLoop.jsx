export default function DialogueLoop({ size = 64, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="dlGrad" x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F2B705" />
          <stop offset="55%" stopColor="#E8622C" />
          <stop offset="100%" stopColor="#C94E1F" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="17" fill="url(#dlGrad)" />
      {/* two interlocking speech bubbles forming a loop */}
      <path
        d="M16 24 a10 9 0 1 1 6 16.5 l-4 5 v-6 a10 9 0 0 1 -2 -15.5 Z"
        fill="#FDF8F0"
        opacity="0.95"
      />
      <path
        d="M48 40 a10 9 0 1 0 -6 -16.5 l4 -5 v6 a10 9 0 0 0 2 15.5 Z"
        fill="#0B1F1A"
      />
    </svg>
  )
}
