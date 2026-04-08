import { useState } from 'react'
import { useAssets } from '../hooks/useAssets'
import type { Asset } from '../types'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import MapView from '../components/MapView'
import AssetPanel from '../components/AssetPanel'
import ReportUpload from '../components/ReportUpload'

export default function Dashboard() {
  const [navActive, setNavActive]         = useState('map')
  const [region, setRegion]               = useState('All Regions')
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [panelOpen, setPanelOpen]         = useState(true)
  const [uploadOpen, setUploadOpen]       = useState(false)

  const { geoData, assets, loading } = useAssets()

  // Derive system status from loaded data
  const systemStatus =
    loading ? 'online' :
    assets.some((a) => a.status === 'critical' || a.status === 'offline') ? 'degraded' :
    'online'

  function handleAssetSelect(asset: Asset) {
    setSelectedAsset(asset)
    setPanelOpen(true)
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden" style={{ backgroundColor: '#0B0F14' }}>
      {/* Top Bar */}
      <Topbar
        region={region}
        onRegionChange={setRegion}
        systemStatus={systemStatus as 'online' | 'degraded' | 'offline'}
        onUploadClick={() => setUploadOpen(true)}
      />

      {/* Body: sidebar + main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar active={navActive} onNavigate={setNavActive} />

        {/* Map canvas */}
        <main className="relative flex-1 overflow-hidden">
          {loading && (
            <div
              className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3"
              style={{ backgroundColor: '#0B0F14' }}
            >
              <div className="skeleton h-64 w-64 rounded-full opacity-20" />
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Loading asset map…</p>
            </div>
          )}
          <MapView
            geoData={geoData}
            onAssetSelect={handleAssetSelect}
            selectedId={selectedAsset?.id}
          />

          {/* Legend overlay */}
          <div
            className="absolute bottom-4 left-4 rounded-lg px-3 py-2.5 flex items-center gap-4 z-[400]"
            style={{
              backgroundColor: 'rgba(17,24,39,0.92)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(8px)',
            }}
          >
            {[
              { color: '#10B981', label: 'Operational' },
              { color: '#F59E0B', label: 'Degraded'    },
              { color: '#EF4444', label: 'Critical'    },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Asset count badge */}
          <div
            className="absolute top-3 left-3 rounded-lg px-3 py-1.5 z-[400]"
            style={{
              backgroundColor: 'rgba(17,24,39,0.92)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.65)' }}>
              {assets.length > 0 ? `${assets.length} assets` : '—'}
            </span>
          </div>

          {/* Panel toggle */}
          {selectedAsset && (
            <button
              onClick={() => setPanelOpen((v) => !v)}
              className="absolute top-3 right-3 z-[400] flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
              style={{
                backgroundColor: 'rgba(17,24,39,0.92)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.5)',
              }}
              title={panelOpen ? 'Hide panel' : 'Show panel'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {panelOpen
                  ? <polyline points="15 18 9 12 15 6" />
                  : <polyline points="9 18 15 12 9 6" />}
              </svg>
            </button>
          )}
        </main>

        {/* Right Decision Panel */}
        <div
          className="flex-shrink-0 overflow-hidden transition-all duration-300"
          style={{ width: panelOpen || !selectedAsset ? (selectedAsset ? '380px' : '0px') : '0px' }}
        >
          {selectedAsset && (
            <AssetPanel asset={selectedAsset} />
          )}
        </div>
      </div>

      {/* Report upload modal */}
      {uploadOpen && <ReportUpload onClose={() => setUploadOpen(false)} />}
    </div>
  )
}
