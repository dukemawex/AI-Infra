import client from './client'
import type { Asset, GeoJSONCollection, IngestResponse, RiskAssessment } from '../types'

export async function fetchAssets(params?: {
  type?: string
  status?: string
  region?: string
  limit?: number
  offset?: number
}): Promise<Asset[]> {
  const { data } = await client.get<Asset[]>('/assets', { params })
  return data
}

export async function fetchAsset(id: string): Promise<Asset> {
  const { data } = await client.get<Asset>(`/assets/${id}`)
  return data
}

export async function fetchRisk(id: string): Promise<RiskAssessment> {
  const { data } = await client.get<RiskAssessment>(`/risk/${id}`)
  return data
}

export async function fetchMap(): Promise<GeoJSONCollection> {
  const { data } = await client.get<GeoJSONCollection>('/map')
  return data
}

export async function ingestReport(file: File): Promise<IngestResponse> {
  const form = new FormData()
  form.append('file', file)
  const { data } = await client.post<IngestResponse>('/ingest/report', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}
