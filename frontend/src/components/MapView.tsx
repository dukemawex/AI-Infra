import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Asset, GeoJSONCollection } from '../types'

interface Props {
  geoData: GeoJSONCollection | null
  onAssetSelect: (asset: Asset) => void
  selectedId?: string
}

const MARKER_COLORS: Record<string, string> = {
  operational: '#10B981',
  degraded:    '#F59E0B',
  critical:    '#EF4444',
  offline:     '#EF4444',
}

function featureToAsset(f: GeoJSONCollection['features'][number]): Asset {
  const p = f.properties as Record<string, unknown>
  return {
    id:                     String(p.id),
    type:                   String(p.type),
    lat:                    f.geometry.coordinates[1],
    lon:                    f.geometry.coordinates[0],
    install_date:           String(p.install_date),
    last_maintenance:       String(p.last_maintenance),
    status:                 String(p.status),
    usage_level:            String(p.usage_level),
    region:                 String(p.region),
    depth_m:                p.depth_m != null ? Number(p.depth_m) : undefined,
    capacity_kw:            p.capacity_kw != null ? Number(p.capacity_kw) : undefined,
    age_years:              Number(p.age_years),
    days_since_maintenance: Number(p.days_since_maintenance),
  }
}

export default function MapView({ geoData, onAssetSelect, selectedId }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef       = useRef<L.Map | null>(null)
  const layerRef     = useRef<L.LayerGroup | null>(null)

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      center:         [5, 35],
      zoom:           5,
      zoomControl:    false,
      attributionControl: false,
    })

    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      { subdomains: 'abcd', maxZoom: 19 }
    ).addTo(map)

    L.control.zoom({ position: 'bottomright' }).addTo(map)

    layerRef.current = L.layerGroup().addTo(map)
    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
      layerRef.current = null
    }
  }, [])

  // Update markers when geoData or selectedId changes
  useEffect(() => {
    const layer = layerRef.current
    if (!layer) return

    layer.clearLayers()

    if (!geoData) return

    geoData.features.forEach((feature) => {
      const asset      = featureToAsset(feature)
      const isSelected = asset.id === selectedId
      const color      = MARKER_COLORS[asset.status] ?? '#6b7280'

      const circle = L.circleMarker([asset.lat, asset.lon], {
        radius:      isSelected ? 11 : 7,
        color:       isSelected ? '#ffffff' : color,
        fillColor:   color,
        fillOpacity: 0.9,
        weight:      isSelected ? 2.5 : 1.5,
      })

      circle.bindTooltip(
        `<strong>${asset.id}</strong><br/>${asset.type.replace(/_/g, ' ')} · ${asset.region}<br/>Status: <strong>${asset.status}</strong>`,
        { direction: 'top', offset: [0, -6] }
      )

      circle.on('click', () => onAssetSelect(asset))
      circle.addTo(layer)
    })
  }, [geoData, selectedId, onAssetSelect])

  return <div ref={containerRef} style={{ height: '100%', width: '100%' }} />
}
