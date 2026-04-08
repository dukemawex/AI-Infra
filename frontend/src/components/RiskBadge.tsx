import type { RiskAssessment } from '../types'

interface Props {
  level: RiskAssessment['risk_level']
  score?: number
}

const CONFIG: Record<string, { bg: string; color: string; label: string }> = {
  low:      { bg: 'rgba(16,185,129,0.15)',  color: '#10B981', label: 'Low Risk'  },
  medium:   { bg: 'rgba(245,158,11,0.15)',  color: '#F59E0B', label: 'Medium'    },
  high:     { bg: 'rgba(239,68,68,0.15)',   color: '#EF4444', label: 'High Risk' },
  critical: { bg: 'rgba(239,68,68,0.20)',   color: '#EF4444', label: 'Critical'  },
}

export default function RiskBadge({ level, score }: Props) {
  const cfg = CONFIG[level] ?? CONFIG['medium']
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: cfg.color }} />
      {cfg.label}
      {score !== undefined && (
        <span className="opacity-60 tabular-nums">({score.toFixed(0)})</span>
      )}
    </span>
  )
}
