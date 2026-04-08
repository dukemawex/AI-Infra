import type { Asset } from '../types'

interface Props {
  assets: Asset[]
}

export default function StatsBar({ assets }: Props) {
  const total = assets.length
  const operational = assets.filter((a) => a.status === 'operational').length
  const critical = assets.filter((a) => a.status === 'critical').length
  const offline = assets.filter((a) => a.status === 'offline').length
  const operationalPct = total > 0 ? ((operational / total) * 100).toFixed(1) : '0'

  const stats = [
    { label: 'Total Assets', value: total, color: 'text-blue-600' },
    { label: 'Operational', value: `${operationalPct}%`, color: 'text-green-600' },
    { label: 'Critical', value: critical, color: 'text-orange-600' },
    { label: 'Offline', value: offline, color: 'text-red-600' },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-xl bg-white p-4 shadow-sm border border-gray-100 flex flex-col items-center"
        >
          <span className={`text-2xl font-bold ${s.color}`}>{s.value}</span>
          <span className="mt-1 text-xs text-gray-500">{s.label}</span>
        </div>
      ))}
    </div>
  )
}
