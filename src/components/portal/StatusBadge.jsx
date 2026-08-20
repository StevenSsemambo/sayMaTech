const STATUS_STYLES = {
  discovery: { label: 'Discovery', color: 'bg-gold/15 text-gold' },
  in_progress: { label: 'In Progress', color: 'bg-terracotta/15 text-terracotta' },
  review: { label: 'In Review', color: 'bg-savanna/15 text-savanna' },
  completed: { label: 'Completed', color: 'bg-savanna/20 text-savanna' },
  on_hold: { label: 'On Hold', color: 'bg-ink/10 text-ink/60' },
}

export default function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.discovery
  return (
    <span className={`text-xs font-mono uppercase tracking-wide px-2.5 py-1 rounded-full ${s.color}`}>
      {s.label}
    </span>
  )
}
