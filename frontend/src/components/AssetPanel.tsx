import { useEffect, useState } from 'react'
import type { Asset, RiskAssessment } from '../types'
import { fetchRisk } from '../api/assets'
import RiskBadge from './RiskBadge'

interface Props {
  asset: Asset | null
}

const STATUS_COLORS: Record<string, string> = {
  operational: 'text-green-600 bg-green-50',
  degraded:    'text-yellow-700 bg-yellow-50',
  critical:    'text-orange-700 bg-orange-50',
  offline:     'text-red-700 bg-red-50',
}

export default function AssetPanel({ asset }: Props) {
  const [risk, setRisk] = useState<RiskAssessment | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!asset) { setRisk(null); return }
    setLoading(true)
    fetchRisk(asset.id)
      .then(setRisk)
      .catch(() => setRisk(null))
      .finally(() => setLoading(false))
  }, [asset?.id])

  if (!asset) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-xl bg-white p-6 shadow-sm border border-gray-100 text-center">
        <div className="mb-3 text-4xl">🗺️</div>
        <p className="font-medium text-gray-600">Select an asset on the map</p>
        <p className="mt-1 text-xs text-gray-400">Click any marker to view details and risk assessment</p>
      </div>
    )
  }

  const statusCls = STATUS_COLORS[asset.status] ?? 'text-gray-700 bg-gray-50'

  return (
    <div className="flex h-full flex-col overflow-y-auto rounded-xl bg-white p-5 shadow-sm border border-gray-100 gap-4">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h2 className="text-base font-bold text-gray-800">{asset.id}</h2>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusCls}`}>
            {asset.status}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-gray-500 capitalize">
          {asset.type.replace('_', ' ')} · {asset.region}
        </p>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {[
          ['Latitude', asset.lat.toFixed(4)],
          ['Longitude', asset.lon.toFixed(4)],
          ['Install Date', asset.install_date],
          ['Last Maintenance', asset.last_maintenance],
          ['Age', `${asset.age_years.toFixed(1)} yrs`],
          ['Days Since Maint.', asset.days_since_maintenance],
          ['Usage Level', asset.usage_level],
          ...(asset.depth_m != null ? [['Depth', `${asset.depth_m} m`]] : []),
          ...(asset.capacity_kw != null ? [['Capacity', `${asset.capacity_kw} kW`]] : []),
        ].map(([label, value]) => (
          <div key={label as string} className="rounded-lg bg-gray-50 p-2">
            <div className="text-gray-400">{label}</div>
            <div className="font-semibold text-gray-700">{value}</div>
          </div>
        ))}
      </div>

      {/* Risk section */}
      <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
          Risk Assessment
        </h3>
        {loading && <p className="text-xs text-gray-400">Loading…</p>}
        {!loading && risk && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <RiskBadge level={risk.risk_level} score={risk.risk_score} />
              <span className="text-xs text-gray-400">
                Confidence: {(risk.confidence * 100).toFixed(0)}%
              </span>
            </div>

            {/* Score bar */}
            <div>
              <div className="mb-1 flex justify-between text-xs text-gray-400">
                <span>Risk Score</span>
                <span>{risk.risk_score.toFixed(1)} / 100</span>
              </div>
              <div className="h-2 rounded-full bg-gray-200">
                <div
                  className={`h-2 rounded-full transition-all ${
                    risk.risk_score < 30
                      ? 'bg-green-500'
                      : risk.risk_score < 65
                      ? 'bg-yellow-400'
                      : risk.risk_score < 85
                      ? 'bg-orange-500'
                      : 'bg-red-600'
                  }`}
                  style={{ width: `${risk.risk_score}%` }}
                />
              </div>
            </div>

            <p className="text-xs text-gray-600">{risk.recommendation}</p>

            {risk.estimated_cost_usd != null && (
              <div className="rounded-lg bg-white p-2 text-xs border border-gray-100">
                <span className="text-gray-400">Estimated cost: </span>
                <span className="font-semibold text-gray-700">
                  ${risk.estimated_cost_usd.toLocaleString()} USD
                </span>
              </div>
            )}

            <p className="text-[10px] leading-relaxed text-gray-400 italic">{risk.disclaimer}</p>
          </div>
        )}
        {!loading && !risk && (
          <p className="text-xs text-red-400">Unable to load risk data.</p>
        )}
      </div>
    </div>
  )
}
