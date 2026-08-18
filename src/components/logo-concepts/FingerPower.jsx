export default function FingerPower({ size = 64, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="fpwGrad" x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F2B705" />
          <stop offset="55%" stopColor="#E8622C" />
          <stop offset="100%" stopColor="#C94E1F" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="17" fill="url(#fpwGrad)" />

      {/* click ripple, behind everything */}
      <circle cx="32" cy="31" r="9" fill="none" stroke="#FDF8F0" strokeWidth="1" opacity="0.25" />
      <circle cx="32" cy="31" r="5.5" fill="none" stroke="#FDF8F0" strokeWidth="1" opacity="0.35" />

      {/* power ring — open at top where the finger presses in */}
      <path
        d="M38.5 30.5 A 10.8 10.8 0 1 1 25.5 30.5"
        fill="none"
        stroke="#FDF8F0"
        strokeWidth="4.4"
        strokeLinecap="round"
      />

      {/* finger reaching down from the top edge into the gap */}
      <rect x="26.5" y="6" width="11" height="27" rx="5.5" fill="#FDF8F0" />

      {/* fingerprint ridges on the fingertip */}
      <g fill="none" stroke="#E8622C" strokeWidth="1.4" strokeLinecap="round" opacity="0.85">
        <path d="M29 13 Q32 11 35 13" />
        <path d="M28.5 17 Q32 14.5 35.5 17" />
        <path d="M28.3 21 Q32 18 35.7 21" />
      </g>

      {/* contact / activation point */}
      <circle cx="32" cy="30.5" r="2.6" fill="#0B1F1A" />
      <circle cx="32" cy="30.5" r="2.6" fill="none" stroke="#F2B705" strokeWidth="1" />
    </svg>
  )
}
