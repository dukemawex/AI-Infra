export interface Asset {
  id: string
  type: string
  lat: number
  lon: number
  install_date: string
  last_maintenance: string
  status: string
  usage_level: string
  region: string
  depth_m?: number
  capacity_kw?: number
  age_years: number
  days_since_maintenance: number
}

export interface RiskAssessment {
  asset_id: string
  risk_score: number
  confidence: number
  risk_level: string
  recommendation: string
  estimated_cost_usd?: number
  data_source: string
  disclaimer: string
}

export interface GeoJSONFeature {
  type: 'Feature'
  geometry: {
    type: string
    coordinates: [number, number]
  }
  properties: Record<string, unknown>
}

export interface GeoJSONCollection {
  type: 'FeatureCollection'
  features: GeoJSONFeature[]
}

export interface IngestResponse {
  message: string
  extracted: {
    asset_type: string
    location: string
    status: string
    last_maintenance: string
    confidence: number
    method: string
  }
}
