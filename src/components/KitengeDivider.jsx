export default function KitengeDivider({ flip = false, color = '#0B1F1A', bg = '#FDF8F0' }) {
  return (
    <div className="kitenge-divider" style={{ backgroundColor: bg }} aria-hidden="true">
      <svg
        viewBox="0 0 1200 40"
        preserveAspectRatio="none"
        style={{ transform: flip ? 'scaleY(-1)' : 'none' }}
      >
        <polygon
          points="0,40 60,0 120,40 180,0 240,40 300,0 360,40 420,0 480,40 540,0 600,40 660,0 720,40 780,0 840,40 900,0 960,40 1020,0 1080,40 1140,0 1200,40 1200,40 0,40"
          fill={color}
        />
      </svg>
    </div>
  )
}
