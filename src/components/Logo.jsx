export default function LogoMark({ size = 44, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="stmGrad" x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F2B705" />
          <stop offset="55%" stopColor="#E8622C" />
          <stop offset="100%" stopColor="#C94E1F" />
        </linearGradient>
      </defs>

      {/* Badge */}
      <rect x="2" y="2" width="60" height="60" rx="17" fill="url(#stmGrad)" />

      {/* Speech bubble — "Say" */}
      <rect x="13" y="17" width="25" height="19" rx="7" fill="#FDF8F0" />
      <path d="M19 33 L14 43 L25 34.5 Z" fill="#FDF8F0" />

      {/* Code slash — "Tech" */}
      <rect
        x="30.5"
        y="14"
        width="6"
        height="34"
        rx="3"
        fill="#0B1F1A"
        transform="rotate(20 33.5 31)"
      />

      {/* Signal pulse dot — AI layer */}
      <circle cx="48" cy="17" r="4" fill="#0B1F1A" />
      <circle cx="48" cy="17" r="4" fill="none" stroke="#FDF8F0" strokeWidth="1.5" />
    </svg>
  )
}
