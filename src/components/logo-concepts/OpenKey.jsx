export default function OpenKey({ size = 64, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="okGrad" x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F2B705" />
          <stop offset="55%" stopColor="#E8622C" />
          <stop offset="100%" stopColor="#C94E1F" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="17" fill="url(#okGrad)" />
      {/* key head (ring) */}
      <circle cx="24" cy="24" r="9" fill="none" stroke="#FDF8F0" strokeWidth="5" />
      {/* key shaft */}
      <rect x="29" y="29" width="21" height="5" rx="1" fill="#FDF8F0" transform="rotate(45 29 31.5)" />
      {/* circuit-notch teeth */}
      <rect x="38" y="38" width="4" height="4" fill="#0B1F1A" transform="rotate(45 40 40)" />
      <rect x="43" y="43" width="5" height="5" fill="#0B1F1A" transform="rotate(45 45.5 45.5)" />
      <rect x="47" y="34" width="3" height="3" fill="#0B1F1A" transform="rotate(45 48.5 35.5)" />
    </svg>
  )
}
