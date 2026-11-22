import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchDeliveries, fetchFailures } from '../api/client'
import StatusBadge from '../components/StatusBadge'

function formatTime(ts) {
  if (!ts) return '—'
  return new Date(ts).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC', timeZoneName: 'short' })
}

function shortId(id) {
  if (!id) return '—'
  return String(id).slice(0, 8)
}

const PAGE_SIZE = 10

export default function Deliveries() {
  const [deliveries, setDeliveries] = useState([])
  const [failures, setFailures] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    setLoading(true)
    Promise.all([fetchDeliveries(), fetchFailures()])
      .then(([dRes, fRes]) => {
        setDeliveries(dRes.deliveries || [])
        setFailures(fRes.failures || [])
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  // Build enriched list: deliveries with recovery status merged from failures
  const failureMap = {}
  failures.forEach(f => { failureMap[f.deliveryId] = f })

  const enriched = deliveries.map(d => ({
    ...d,
    failure: failureMap[d.id] || null,
    isFailed: d.status === 'failed' || (d.status_code && d.status_code >= 400),
    isRecovered: failureMap[d.id]?.recoveryStatus === 'RECOVERED',
  }))

  const failedList = enriched.filter(d => d.isFailed)
  const recoveredList = enriched.filter(d => d.isRecovered)

  const baseList = activeTab === 'all' ? enriched
    : activeTab === 'failed' ? failedList
    : recoveredList

  const filtered = baseList.filter(d => {
    if (!search) return true
    const q = search.toLowerCase()
    return String(d.id).toLowerCase().includes(q) || (d.event || '').toLowerCase().includes(q)
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const failedUnresolved = failures.filter(f => f.recoveryStatus !== 'RECOVERED').length
  const verifying = failures.filter(f => f.recoveryStatus === 'REDELIVERY_REQUESTED').length
  const recovered = failures.filter(f => f.recoveryStatus === 'RECOVERED').length

  if (loading) return (
    <div className="page-loading">
      <div className="spinner"></div>
      <span>Loading deliveries…</span>
    </div>
  )

  if (error) return (
    <div className="page-error">
      <strong>Failed to load deliveries</strong>
      <p>{error}</p>
    </div>
  )

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Deliveries</h1>
          <p className="page-desc">Inspect GitHub webhook events and recover failed deliveries.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary">Export CSV</button>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab${activeTab === 'all' ? ' tab-active' : ''}`} onClick={() => { setActiveTab('all'); setPage(1) }}>
          All deliveries <span className="tab-count">{enriched.length}</span>
        </button>
        <button className={`tab${activeTab === 'failed' ? ' tab-active' : ''}`} onClick={() => { setActiveTab('failed'); setPage(1) }}>
          Failed <span className="tab-count tab-count-red">{failedList.length}</span>
        </button>
        <button className={`tab${activeTab === 'recovered' ? ' tab-active' : ''}`} onClick={() => { setActiveTab('recovered'); setPage(1) }}>
          Recovered <span className="tab-count tab-count-green">{recoveredList.length}</span>
        </button>
      </div>

      <div className="filter-bar">
        <input
          className="filter-input"
          placeholder="Search delivery ID or event…"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
        />
        <select className="filter-select"><option>Repository: All</option></select>
        <select className="filter-select"><option>Event: All</option></select>
        <select className="filter-select"><option>Last 24 hours</option><option>Last 7 days</option></select>
        <button className="btn btn-secondary btn-sm">More filters</button>
        {search && <button className="btn-link text-red" onClick={() => setSearch('')}>Reset</button>}
      </div>

      <div className="summary-bar">
        <span>{failedList.length} original deliveries failed</span>
        <span className="summary-sep">·</span>
        <span className="text-green">{recovered} recovered</span>
        <span className="summary-sep">·</span>
        <span className="text-orange">{verifying} verifying</span>
        <span className="summary-sep">·</span>
        <span className="text-red">{failedUnresolved - verifying} needs redelivery</span>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <div className="empty-state-title">No deliveries found</div>
          <div className="empty-state-desc">Try adjusting your filters or search term.</div>
        </div>
      ) : (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Event / Delivery ID</th>
                <th>Repository</th>
                <th>HTTP Response</th>
                <th>Recovery</th>
                <th>Received (UTC)</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(d => {
                const statusCode = d.status_code
                const isErr = statusCode >= 400
                const recoveryStatus = d.failure?.recoveryStatus || (d.isFailed ? 'FAILED' : 'Delivered')
                return (
                  <tr key={d.id}>
                    <td>
                      <div className="cell-event">{d.event || 'unknown'}</div>
                      <Link to={`/app/deliveries/${d.id}`} className="cell-mono text-blue">{shortId(d.id)}</Link>
                    </td>
                    <td><span className="text-blue">platform-api</span></td>
                    <td>
                      <span className={`cell-mono ${isErr ? 'text-red' : 'text-green'}`}>
                        {statusCode} {d.status || ''}
                      </span>
                    </td>
                    <td><StatusBadge status={recoveryStatus} /></td>
                    <td className="cell-muted">{formatTime(d.delivered_at)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          <div className="pagination">
            <span className="pagination-info">
              Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} deliveries
            </span>
            <div className="pagination-controls">
              <button
                className="btn btn-secondary btn-sm"
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
              >Previous</button>
              <span className="pagination-page">{page} / {totalPages}</span>
              <button
                className="btn btn-secondary btn-sm"
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
              >Next</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
