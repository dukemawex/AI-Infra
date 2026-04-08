import { useEffect, useState } from 'react'
import type { Asset } from '../types'
import { fetchAssets } from '../api/assets'
import MapView from '../components/MapView'
import AssetPanel from '../components/AssetPanel'
import StatsBar from '../components/StatsBar'
import ReportUpload from '../components/ReportUpload'

export default function Dashboard() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)

  useEffect(() => {
    fetchAssets({ limit: 1000 })
      .then(setAssets)
      .catch(console.error)
  }, [])

  return (
    <div className="flex h-screen flex-col bg-gray-50 font-sans">
      {/* Top header */}
      <header className="flex items-center justify-between bg-white px-6 py-3 shadow-sm border-b border-gray-100">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🛰️</span>
          <div>
            <h1 className="text-sm font-bold text-gray-900 leading-tight">
              AI Infrastructure Intelligence Layer
            </h1>
            <p className="text-[11px] text-gray-400">East Africa · Boreholes & Solar Systems</p>
          </div>
        </div>
        <ReportUpload />
      </header>

      {/* Stats bar */}
      <div className="px-6 pt-4 pb-2">
        <StatsBar assets={assets} />
      </div>

      {/* Main content: map + panel */}
      <div className="flex flex-1 gap-4 overflow-hidden px-6 pb-4">
        {/* Map – 2/3 width */}
        <div className="flex-[2] overflow-hidden rounded-xl shadow-sm">
          <MapView onAssetSelect={setSelectedAsset} selectedId={selectedAsset?.id} />
        </div>

        {/* Asset panel – 1/3 width */}
        <div className="flex-[1] overflow-hidden">
          <AssetPanel asset={selectedAsset} />
        </div>
      </div>
    </div>
  )
}
