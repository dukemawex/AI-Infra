import type { RiskAssessment } from '../types'

interface Props {
  level: RiskAssessment['risk_level']
  score?: number
}

const CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  low:      { bg: 'bg-green-100',  text: 'text-green-800',  label: 'Low Risk' },
  medium:   { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Medium Risk' },
  high:     { bg: 'bg-orange-100', text: 'text-orange-800', label: 'High Risk' },
  critical: { bg: 'bg-red-100',    text: 'text-red-800',    label: 'Critical' },
}

export default function RiskBadge({ level, score }: Props) {
  const cfg = CONFIG[level] ?? CONFIG['medium']
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${cfg.bg} ${cfg.text}`}
    >
      {cfg.label}
      {score !== undefined && <span className="ml-1 opacity-75">({score.toFixed(0)})</span>}
    </span>
  )
}
