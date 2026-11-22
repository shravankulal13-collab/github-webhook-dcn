import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchFailures } from '../api/client'
import StatusBadge from '../components/StatusBadge'

function formatTime(ts) {
  if (!ts) return '—'
  return new Date(ts).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC', timeZoneName: 'short' })
}

function shortId(id) {
  if (!id) return '—'
  return String(id).slice(0, 8)
}

export default function Recoveries() {
  const [failures, setFailures] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    setLoading(true)
    fetchFailures()
      .then(res => {
        setFailures(res.failures || [])
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  const verified = failures.filter(f => f.recoveryStatus === 'RECOVERED')
  const verifying = failures.filter(f => f.recoveryStatus === 'REDELIVERY_REQUESTED')
  const unsuccessful = failures.filter(f => f.recoveryStatus === 'REDELIVERY_FAILED')

  const baseList = activeTab === 'all' ? failures
    : activeTab === 'verifying' ? verifying
    : unsuccessful

  const filtered = baseList.filter(f => {
    if (!search) return true
    const q = search.toLowerCase()
    return String(f.deliveryId).toLowerCase().includes(q) || (f.eventType || '').toLowerCase().includes(q)
  })

  function getVerificationLabel(f) {
    if (f.recoveryStatus === 'RECOVERED') {
      return <span className="text-green">{f.latestStatusCode || '200'} OK · verified</span>
    }
    if (f.recoveryStatus === 'REDELIVERY_REQUESTED') {
      return <span className="text-orange">Waiting · pending</span>
    }
    if (f.recoveryStatus === 'REDELIVERY_FAILED') {
      return <span className="text-red">{f.latestStatusCode || '5xx'} · failed</span>
    }
    return <span className="text-muted">Not attempted</span>
  }

  if (loading) return (
    <div className="page-loading">
      <div className="spinner"></div>
      <span>Loading recoveries…</span>
    </div>
  )

  if (error) return (
    <div className="page-error">
      <strong>Failed to load recoveries</strong>
      <p>{error}</p>
    </div>
  )

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Recoveries</h1>
          <p className="page-desc">Track redelivery attempts from request to verified response.</p>
        </div>
        <div className="page-header-actions">
          <select className="filter-select">
            <option>Last 24 hours</option>
            <option>Last 7 days</option>
            <option>Last 30 days</option>
          </select>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card-label">Redelivery attempts</div>
          <div className="stat-card-value">{failures.length}</div>
          <div className="stat-card-sub">Total failure records</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Verified</div>
          <div className="stat-card-value text-green">{verified.length}</div>
          <div className="stat-card-sub">Successful recoveries</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Awaiting verification</div>
          <div className="stat-card-value text-orange">{verifying.length}</div>
          <div className="stat-card-sub">Redelivery in progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Unsuccessful</div>
          <div className="stat-card-value text-red">{unsuccessful.length}</div>
          <div className="stat-card-sub">Redelivery failed</div>
        </div>
      </div>

      {verifying.length > 0 && (
        <div className="alert-banner alert-banner-green">
          <div className="alert-banner-title">ℹ {verifying.length} redeliveries are awaiting verification</div>
          <div className="alert-banner-text">GitHub has accepted the request. Verification checks the HTTP response from your endpoint. This may take a few minutes.</div>
        </div>
      )}

      <div className="tabs">
        <button className={`tab${activeTab === 'all' ? ' tab-active' : ''}`} onClick={() => setActiveTab('all')}>
          All attempts <span className="tab-count">{failures.length}</span>
        </button>
        <button className={`tab${activeTab === 'verifying' ? ' tab-active' : ''}`} onClick={() => setActiveTab('verifying')}>
          Verifying <span className="tab-count tab-count-orange">{verifying.length}</span>
        </button>
        <button className={`tab${activeTab === 'unsuccessful' ? ' tab-active' : ''}`} onClick={() => setActiveTab('unsuccessful')}>
          Unsuccessful <span className="tab-count tab-count-red">{unsuccessful.length}</span>
        </button>
      </div>

      <div className="filter-bar">
        <input
          className="filter-input"
          placeholder="Search delivery ID or event…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="filter-select"><option>All repositories</option></select>
        <select className="filter-select"><option>Triggered by: Anyone</option></select>
        <button className="btn btn-secondary btn-sm">Export audit log</button>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">✓</div>
          <div className="empty-state-title">No recovery attempts yet</div>
          <div className="empty-state-desc">Redeliveries you request will appear here.</div>
        </div>
      ) : (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>Original Delivery</th>
                <th>Repository</th>
                <th>Triggered by</th>
                <th>Result</th>
                <th>Verification</th>
                <th>Requested (UTC)</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(f => (
                <tr key={f.deliveryId}>
                  <td>
                    <div className="cell-event">{f.eventType || 'unknown'}</div>
                    <Link to={`/app/deliveries/${f.deliveryId}`} className="cell-mono text-blue">{shortId(f.deliveryId)}</Link>
                  </td>
                  <td><span className="text-blue">platform-api</span></td>
                  <td className="cell-muted">Morgan Chen</td>
                  <td><StatusBadge status={f.recoveryStatus} /></td>
                  <td>{getVerificationLabel(f)}</td>
                  <td className="cell-muted">{formatTime(f.lastRecoveryAttempt || f.detectedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="table-footer">
            Verification checks the HTTP response, not downstream application processing.
          </div>
        </>
      )}
    </div>
  )
}
