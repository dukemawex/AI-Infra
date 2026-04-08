import { useState } from 'react'

const REGIONS = ['All Regions', 'East Africa', 'West Africa', 'Horn of Africa', 'Southern Africa']

interface Props {
  region: string
  onRegionChange: (region: string) => void
  systemStatus: 'online' | 'degraded' | 'offline'
  onUploadClick: () => void
}

export default function Topbar({ region, onRegionChange, systemStatus, onUploadClick }: Props) {
  const [regionOpen, setRegionOpen] = useState(false)

  const statusColor =
    systemStatus === 'online'   ? '#10B981' :
    systemStatus === 'degraded' ? '#F59E0B' : '#EF4444'

  const statusLabel =
    systemStatus === 'online'   ? 'Systems Online' :
    systemStatus === 'degraded' ? 'Degraded'        : 'Offline'

  return (
    <header
      className="flex h-14 shrink-0 items-center justify-between border-b px-5 z-10"
      style={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.08)' }}
    >
      {/* Left: App name */}
      <div className="flex items-center gap-2.5">
        <span className="text-sm font-semibold text-white tracking-wide">AI-IIL</span>
        <span className="hidden sm:block h-4 w-px" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }} />
        <span className="hidden sm:block text-xs" style={{ color: 'rgba(255,255,255,0.38)' }}>
          Infrastructure Intelligence Layer
        </span>
      </div>

      {/* Center: Region selector */}
      <div className="relative">
        <button
          onClick={() => setRegionOpen((v) => !v)}
          className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
          style={{
            backgroundColor: 'rgba(255,255,255,0.06)',
            color: 'rgba(255,255,255,0.75)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          {region}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        {regionOpen && (
          <div
            className="absolute left-1/2 top-full mt-1 w-48 -translate-x-1/2 rounded-lg py-1 shadow-xl z-50"
            style={{ backgroundColor: '#1a2233', border: '1px solid rgba(255,255,255,0.10)' }}
          >
            {REGIONS.map((r) => (
              <button
                key={r}
                onClick={() => { onRegionChange(r); setRegionOpen(false) }}
                className="w-full px-3 py-2 text-left text-xs transition-colors"
                style={{
                  color: r === region ? '#60a5fa' : 'rgba(255,255,255,0.65)',
                  backgroundColor: r === region ? 'rgba(59,130,246,0.10)' : 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (r !== region) (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.05)'
                }}
                onMouseLeave={(e) => {
                  if (r !== region) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
                }}
              >
                {r}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: Status + Upload + Avatar */}
      <div className="flex items-center gap-3">
        {/* System status */}
        <div className="hidden sm:flex items-center gap-1.5">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: statusColor, boxShadow: `0 0 6px ${statusColor}` }}
          />
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>{statusLabel}</span>
        </div>

        <span className="hidden sm:block h-4 w-px" style={{ backgroundColor: 'rgba(255,255,255,0.10)' }} />

        {/* Upload report */}
        <button
          onClick={onUploadClick}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
          style={{
            backgroundColor: 'rgba(59,130,246,0.15)',
            color: '#60a5fa',
            border: '1px solid rgba(59,130,246,0.25)',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(59,130,246,0.25)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(59,130,246,0.15)' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span className="hidden sm:inline">Ingest Report</span>
        </button>

        {/* Avatar */}
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
          style={{ backgroundColor: '#1e3a5f', color: '#93c5fd' }}
        >
          AI
        </div>
      </div>
    </header>
  )
}
