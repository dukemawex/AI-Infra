import { useRef, useState } from 'react'
import { ingestReport } from '../api/assets'
import type { IngestResponse } from '../types'

export default function ReportUpload() {
  const [open, setOpen] = useState(false)
  const [result, setResult] = useState<IngestResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

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
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 transition-colors"
      >
        📄 Upload Report
      </button>

      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-800">Ingest NGO Field Report</h2>
              <button
                onClick={() => { setOpen(false); setResult(null); setError(null) }}
                className="text-gray-400 hover:text-gray-600 text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Select .txt report file
                </label>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".txt,text/plain"
                  required
                  className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-600 hover:file:bg-blue-100"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Processing…' : 'Upload & Extract'}
              </button>
            </form>

            {error && (
              <div className="mt-4 rounded-lg bg-red-50 p-3 text-xs text-red-700">{error}</div>
            )}

            {result && (
              <div className="mt-4 rounded-lg bg-green-50 p-4 text-xs space-y-2">
                <p className="font-semibold text-green-700">{result.message}</p>
                <div className="grid grid-cols-2 gap-1">
                  {Object.entries(result.extracted).map(([k, v]) => (
                    <div key={k} className="rounded bg-white p-1.5 border border-green-100">
                      <div className="text-gray-400 capitalize">{k.replace(/_/g, ' ')}</div>
                      <div className="font-semibold text-gray-700">{String(v)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
