import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet'
import type { Asset, GeoJSONCollection } from '../types'
import { fetchMap } from '../api/assets'

interface Props {
  onAssetSelect: (asset: Asset) => void
  selectedId?: string
}

const STATUS_COLORS: Record<string, string> = {
  operational: '#22c55e',
  degraded:    '#eab308',
  critical:    '#f97316',
  offline:     '#ef4444',
}

function featureToAsset(f: GeoJSONCollection['features'][number]): Asset {
  const p = f.properties as Record<string, unknown>
  return {
    id:                    String(p.id),
    type:                  String(p.type),
    lat:                   f.geometry.coordinates[1],
    lon:                   f.geometry.coordinates[0],
    install_date:          String(p.install_date),
    last_maintenance:      String(p.last_maintenance),
    status:                String(p.status),
    usage_level:           String(p.usage_level),
    region:                String(p.region),
    depth_m:               p.depth_m != null ? Number(p.depth_m) : undefined,
    capacity_kw:           p.capacity_kw != null ? Number(p.capacity_kw) : undefined,
    age_years:             Number(p.age_years),
    days_since_maintenance: Number(p.days_since_maintenance),
  }
}

export default function MapView({ onAssetSelect, selectedId }: Props) {
  const [geoData, setGeoData] = useState<GeoJSONCollection | null>(null)

  useEffect(() => {
    fetchMap().then(setGeoData).catch(console.error)
  }, [])

  return (
    <MapContainer
      center={[5, 35]}
      zoom={5}
      style={{ height: '100%', width: '100%', borderRadius: '0.75rem' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {geoData?.features.map((feature) => {
        const asset = featureToAsset(feature)
        const color = STATUS_COLORS[asset.status] ?? '#6b7280'
        const isSelected = asset.id === selectedId
        return (
          <CircleMarker
            key={asset.id}
            center={[asset.lat, asset.lon]}
            radius={isSelected ? 10 : 6}
            pathOptions={{
              color: isSelected ? '#1d4ed8' : color,
              fillColor: color,
              fillOpacity: 0.85,
              weight: isSelected ? 3 : 1.5,
            }}
            eventHandlers={{ click: () => onAssetSelect(asset) }}
          >
            <Tooltip>
              <strong>{asset.id}</strong>
              <br />
              {asset.type.replace('_', ' ')} · {asset.region}
              <br />
              Status: <strong>{asset.status}</strong>
            </Tooltip>
          </CircleMarker>
        )
      })}
    </MapContainer>
  )
}
