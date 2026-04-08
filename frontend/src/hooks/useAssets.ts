import { useEffect, useState } from 'react'
import type { Asset, GeoJSONCollection } from '../types'
import { fetchAssets, fetchMap } from '../api/assets'

export interface AssetsState {
  assets: Asset[]
  geoData: GeoJSONCollection | null
  loading: boolean
  error: string | null
}

export function useAssets(): AssetsState {
  const [assets, setAssets] = useState<Asset[]>([])
  const [geoData, setGeoData] = useState<GeoJSONCollection | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([fetchAssets({ limit: 1000 }), fetchMap()])
      .then(([a, g]) => {
        setAssets(a)
        setGeoData(g)
      })
      .catch(() => setError('Failed to load assets'))
      .finally(() => setLoading(false))
  }, [])

  return { assets, geoData, loading, error }
}
