export default function LogoMark({ size = 44, className = '' }) {
  // `size` is treated as height — width scales naturally to the logo's real
  // (wide) aspect ratio instead of being squeezed into a square badge.
  return (
    <img
      src="/images/logo-icon.png"
      alt="SayMyTech Developers"
      style={{ height: size, width: 'auto' }}
      className={className}
    />
  )
}
