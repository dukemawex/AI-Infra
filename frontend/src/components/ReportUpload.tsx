import { useRef, useState } from 'react'
import { ingestReport } from '../api/assets'
import type { IngestResponse } from '../types'

interface Props {
  onClose: () => void
}

export default function ReportUpload({ onClose }: Props) {
  const [result, setResult]   = useState<IngestResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const fileRef               = useRef<HTMLInputElement>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const file = fileRef.current?.files?.[0]
    if (!file) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await ingestReport(file)
      setResult(res)
    } catch {
      setError('Upload failed. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-md rounded-xl p-6 shadow-2xl"
        style={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.10)' }}
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">Ingest Field Report</h2>
            <p className="mt-0.5 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Upload an NGO .txt report for AI extraction
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors"
            style={{ color: 'rgba(255,255,255,0.4)', backgroundColor: 'rgba(255,255,255,0.06)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div
            className="rounded-lg p-4"
            style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(255,255,255,0.14)' }}
          >
            <label className="block text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Select .txt report file
            </label>
            <input
              ref={fileRef}
              type="file"
              accept=".txt,text/plain"
              required
              className="block w-full text-xs file:mr-3 file:rounded-md file:border-0 file:px-3 file:py-1.5 file:text-xs file:font-semibold cursor-pointer"
              style={{
                color: 'rgba(255,255,255,0.5)',
              }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-50"
            style={{ backgroundColor: '#2563eb' }}
          >
            {loading ? 'Processing…' : 'Upload & Extract'}
          </button>
        </form>

        {error && (
          <div
            className="mt-4 rounded-lg p-3 text-xs"
            style={{ backgroundColor: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            {error}
          </div>
        )}

        {result && (
          <div
            className="mt-4 rounded-lg p-4 space-y-3"
            style={{ backgroundColor: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}
          >
            <p className="text-xs font-semibold" style={{ color: '#34d399' }}>{result.message}</p>
            <div className="grid grid-cols-2 gap-1.5">
              {Object.entries(result.extracted).map(([k, v]) => (
                <div
                  key={k}
                  className="rounded-md p-2"
                  style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div className="text-[10px] capitalize mb-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    {k.replace(/_/g, ' ')}
                  </div>
                  <div className="text-xs font-medium text-white">{String(v)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
