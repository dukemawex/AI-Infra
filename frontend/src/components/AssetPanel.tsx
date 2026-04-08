import { useEffect, useState } from 'react'
import type { Asset, RiskAssessment } from '../types'
import { fetchRisk } from '../api/assets'
import RiskBadge from './RiskBadge'

interface Props {
  asset: Asset | null
}

function Skeleton({ h = 'h-4', w = 'w-full' }: { h?: string; w?: string }) {
  return <div className={`skeleton ${h} ${w} rounded`} />
}

const STATUS_COLORS: Record<string, { dot: string; text: string; bg: string }> = {
  operational: { dot: '#10B981', text: '#10B981', bg: 'rgba(16,185,129,0.12)' },
  degraded:    { dot: '#F59E0B', text: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  critical:    { dot: '#EF4444', text: '#EF4444', bg: 'rgba(239,68,68,0.12)'  },
  offline:     { dot: '#EF4444', text: '#EF4444', bg: 'rgba(239,68,68,0.12)'  },
}

export default function AssetPanel({ asset }: Props) {
  const [risk, setRisk]       = useState<RiskAssessment | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!asset) { setRisk(null); return }
    setLoading(true)
    fetchRisk(asset.id)
      .then(setRisk)
      .catch(() => setRisk(null))
      .finally(() => setLoading(false))
  }, [asset?.id])

  /* Empty state */
  if (!asset) {
    return (
      <div
        className="flex h-full flex-col items-center justify-center p-8 text-center"
        style={{ backgroundColor: '#111827', borderLeft: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div
          className="mb-4 flex h-12 w-12 items-center justify-center rounded-full"
          style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
            <line x1="9" y1="3" x2="9" y2="18" />
            <line x1="15" y1="6" x2="15" y2="21" />
          </svg>
        </div>
        <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Select an asset
        </p>
        <p className="mt-1 text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
          Click any marker on the map to view decision intelligence
        </p>
      </div>
    )
  }

  const statusCfg = STATUS_COLORS[asset.status] ?? STATUS_COLORS.offline

  return (
    <div
      className="flex h-full flex-col overflow-y-auto"
      style={{ backgroundColor: '#111827', borderLeft: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* ── Section 1: Header ── */}
      <div className="px-5 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-start justify-between gap-2 mb-1">
          <div>
            <h2 className="text-base font-bold text-white leading-tight">{asset.id}</h2>
            <p className="mt-0.5 text-xs capitalize" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {asset.type.replace(/_/g, ' ')} · {asset.region}
            </p>
          </div>
          {/* Status badge */}
          <span
            className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize shrink-0"
            style={{ backgroundColor: statusCfg.bg, color: statusCfg.text }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: statusCfg.dot }}
            />
            {asset.status}
          </span>
        </div>

        {/* Risk score — large typography, primary decision number */}
        {loading ? (
          <div className="mt-4 space-y-2">
            <Skeleton h="h-10" w="w-24" />
            <Skeleton h="h-3" w="w-32" />
          </div>
        ) : risk ? (
          <div className="mt-4">
            <div className="flex items-end gap-2">
              <span
                className="text-5xl font-black tabular-nums leading-none"
                style={{
                  color:
                    risk.risk_score < 30 ? '#10B981' :
                    risk.risk_score < 65 ? '#F59E0B' : '#EF4444',
                }}
              >
                {risk.risk_score.toFixed(0)}
              </span>
              <span className="mb-1 text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>/100 risk</span>
            </div>
            <RiskBadge level={risk.risk_level} />
          </div>
        ) : null}
      </div>

      {/* ── Section 2: Timeline ── */}
      <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Timeline
        </p>
        <div className="space-y-3">
          <TimelineRow
            label="Installed"
            value={asset.install_date}
            note={`${asset.age_years.toFixed(1)} yrs ago`}
          />
          <TimelineRow
            label="Last Maintenance"
            value={asset.last_maintenance}
            note={`${asset.days_since_maintenance}d ago`}
            highlight={asset.days_since_maintenance > 180}
          />
          {asset.usage_level && (
            <TimelineRow label="Usage Level" value={asset.usage_level} />
          )}
        </div>
      </div>

      {/* ── Section 3: AI Insight ── */}
      <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
          AI Insight
        </p>
        {loading ? (
          <div className="space-y-2">
            <Skeleton h="h-3" />
            <Skeleton h="h-3" w="w-4/5" />
            <Skeleton h="h-3" w="w-3/5" />
          </div>
        ) : risk ? (
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
            {risk.disclaimer}
          </p>
        ) : (
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Insight unavailable.
          </p>
        )}
      </div>

      {/* ── Section 4: Recommendation ── */}
      <div className="px-5 py-4">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Recommendation
        </p>
        {loading ? (
          <div className="space-y-2">
            <Skeleton h="h-16" />
          </div>
        ) : risk ? (
          <div
            className="rounded-lg p-4 space-y-3"
            style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            {/* Action */}
            <div className="flex items-start gap-2">
              <span
                className="mt-0.5 h-4 w-4 shrink-0 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(59,130,246,0.2)' }}
              >
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
                {risk.recommendation}
              </p>
            </div>

            {/* Cost */}
            {risk.estimated_cost_usd != null && (
              <div
                className="flex items-center justify-between rounded-md px-3 py-2"
                style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Estimated cost</span>
                <span className="text-sm font-bold text-white">
                  ${risk.estimated_cost_usd.toLocaleString()}
                </span>
              </div>
            )}

            {/* Confidence */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
                <div
                  className="h-1.5 rounded-full transition-all"
                  style={{ width: `${(risk.confidence * 100).toFixed(0)}%`, backgroundColor: '#60a5fa' }}
                />
              </div>
              <span className="text-[10px] tabular-nums" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {(risk.confidence * 100).toFixed(0)}% confidence
              </span>
            </div>
          </div>
        ) : (
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Risk data unavailable.
          </p>
        )}
      </div>
    </div>
  )
}

function TimelineRow({
  label,
  value,
  note,
  highlight = false,
}: {
  label: string
  value: string
  note?: string
  highlight?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.38)' }}>{label}</span>
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-white">{value}</span>
        {note && (
          <span
            className="rounded px-1 py-0.5 text-[10px] font-medium"
            style={{
              backgroundColor: highlight ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.06)',
              color:           highlight ? '#EF4444'               : 'rgba(255,255,255,0.35)',
            }}
          >
            {note}
          </span>
        )}
      </div>
    </div>
  )
}
