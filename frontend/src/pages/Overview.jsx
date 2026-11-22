import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchDeliveries, fetchFailures } from '../api/client'
import StatusBadge from '../components/StatusBadge'

function formatTime(ts) {
  if (!ts) return '—'
  const d = new Date(ts)
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function shortId(id) {
  if (!id) return '—'
  return String(id).slice(0, 8)
}

export default function Overview() {
  const [deliveries, setDeliveries] = useState([])
  const [failures, setFailures] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastSynced, setLastSynced] = useState(null)

  useEffect(() => {
    setLoading(true)
    Promise.all([fetchDeliveries(), fetchFailures()])
      .then(([dRes, fRes]) => {
        setDeliveries(dRes.deliveries || [])
        setFailures(fRes.failures || [])
        setLastSynced(new Date())
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  const totalDeliveries = deliveries.length
  const failedCount = failures.length
  const recovered = failures.filter(f => f.recoveryStatus === 'RECOVERED').length
  const unresolved = failures.filter(f => f.recoveryStatus !== 'RECOVERED')
  const verifying = failures.filter(f => f.recoveryStatus === 'REDELIVERY_REQUESTED').length
  const recoveryRate = failedCount > 0 ? Math.round((recovered / failedCount) * 100) : 0

  // Build bar chart from deliveries (group by hour)
  const hourlyData = {}
  deliveries.forEach(d => {
    const h = d.delivered_at ? new Date(d.delivered_at).getHours() : 0
    if (!hourlyData[h]) hourlyData[h] = { ok: 0, failed: 0 }
    if (d.status === 'failed' || (d.status_code && d.status_code >= 400)) {
      hourlyData[h].failed++
    } else {
      hourlyData[h].ok++
    }
  })

  const hours = Array.from({ length: 12 }, (_, i) => i * 2)
  const maxBar = Math.max(...hours.map(h => (hourlyData[h]?.ok || 0) + (hourlyData[h]?.failed || 0)), 1)

  if (loading) return (
    <div className="page-loading">
      <div className="spinner"></div>
      <span>Loading overview…</span>
    </div>
  )

  if (error) return (
    <div className="page-error">
      <strong>Failed to load data</strong>
      <p>{error}</p>
      <p>Make sure the backend is running on port 5000.</p>
    </div>
  )

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Overview</h1>
          <p className="page-desc">Delivery health across your connected repositories.</p>
        </div>
        <div className="page-header-actions">
          <select className="filter-select">
            <option>All repositories</option>
          </select>
          <select className="filter-select">
            <option>Last 24 hours</option>
            <option>Last 7 days</option>
            <option>Last 30 days</option>
          </select>
        </div>
      </div>

      {unresolved.length > 0 && (
        <div className="alert-banner alert-banner-warning">
          <div className="alert-banner-title">⚠ {unresolved.length} {unresolved.length === 1 ? 'delivery is' : 'deliveries are'} not recovered</div>
          <div className="alert-banner-text">These events failed and have not been successfully redelivered. Review and redeliver when your endpoint is ready.</div>
          <Link to="/app/deliveries" className="alert-banner-link">Review failures →</Link>
        </div>
      )}

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-card-label">Total deliveries</div>
          <div className="stat-card-value">{totalDeliveries.toLocaleString()}</div>
          <div className="stat-card-sub">Across all repositories</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Failed deliveries</div>
          <div className="stat-card-value text-red">{failedCount}</div>
          <div className="stat-card-sub">{totalDeliveries > 0 ? Math.round((failedCount / totalDeliveries) * 100) : 0}% of all deliveries</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Verified recoveries</div>
          <div className="stat-card-value text-green">{recovered}</div>
          <div className="stat-card-sub">{recoveryRate}% recovery rate</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Unresolved</div>
          <div className="stat-card-value text-orange">{unresolved.length}</div>
          <div className="stat-card-sub">{unresolved.length - verifying} failed · {verifying} verifying</div>
        </div>
      </div>

      <div className="charts-row">
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <div className="chart-title">Delivery volume</div>
              <div className="chart-subtitle">All events · 2-hour intervals</div>
            </div>
            <div className="chart-legend">
              <span className="chart-legend-item"><span className="chart-legend-dot dot-green"></span> Delivered</span>
              <span className="chart-legend-item"><span className="chart-legend-dot dot-red"></span> Failed</span>
            </div>
          </div>
          <div className="chart-area">
            {hours.map(h => {
              const data = hourlyData[h] || { ok: 0, failed: 0 }
              const total = data.ok + data.failed
              const okH = total > 0 ? Math.round((data.ok / maxBar) * 80) : 0
              const failH = total > 0 ? Math.round((data.failed / maxBar) * 80) : 0
              return (
                <div key={h} className="chart-bar-group">
                  <div className="chart-bars">
                    {failH > 0 && <div className="chart-bar chart-bar-red" style={{ height: `${failH}px` }} title={`${data.failed} failed`}></div>}
                    {okH > 0 && <div className="chart-bar chart-bar-green" style={{ height: `${okH}px` }} title={`${data.ok} delivered`}></div>}
                    {total === 0 && <div className="chart-bar chart-bar-empty" style={{ height: '4px' }}></div>}
                  </div>
                  <div className="chart-bar-label">{String(h).padStart(2, '0')}:00</div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="recovery-status-card">
          <div className="chart-title">Recovery status</div>
          <div className="recovery-headline">{recovered} of {failedCount} failures recovered</div>
          <div className="progress-bar">
            <div className="progress-bar-fill progress-bar-fill-green" style={{ width: `${recoveryRate}%` }}></div>
          </div>
          <div className="recovery-legend">
            <div className="recovery-legend-item">
              <span className="chart-legend-dot dot-green"></span>
              <span>Verified</span>
              <span className="ml-auto">{recovered}</span>
            </div>
            <div className="recovery-legend-item">
              <span className="chart-legend-dot dot-orange"></span>
              <span>Awaiting verification</span>
              <span className="ml-auto">{verifying}</span>
            </div>
            <div className="recovery-legend-item">
              <span className="chart-legend-dot dot-red"></span>
              <span>Needs redelivery</span>
              <span className="ml-auto">{unresolved.length - verifying}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <div className="section-title">Unresolved deliveries</div>
          <Link to="/app/deliveries" className="section-link">View all deliveries →</Link>
        </div>
        {unresolved.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">✓</div>
            <div className="empty-state-title">All caught up</div>
            <div className="empty-state-desc">No unresolved deliveries at this time.</div>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Event / Delivery</th>
                <th>Repository</th>
                <th>Response</th>
                <th>Recovery</th>
                <th>Received</th>
              </tr>
            </thead>
            <tbody>
              {unresolved.slice(0, 5).map(f => (
                <tr key={f.deliveryId}>
                  <td>
                    <div className="cell-event">{f.eventType || 'unknown'}</div>
                    <Link to={`/app/deliveries/${f.deliveryId}`} className="cell-mono text-blue">{shortId(f.deliveryId)}</Link>
                  </td>
                  <td><span className="text-blue">platform-api</span></td>
                  <td><span className="cell-mono text-red">{f.githubStatus || f.statusCode || '—'}</span></td>
                  <td><StatusBadge status={f.recoveryStatus} /></td>
                  <td className="cell-muted">{formatTime(f.deliveredAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="table-footer">
          Last synced {lastSynced ? lastSynced.toLocaleTimeString() : '—'} · Updates every 60 seconds
        </div>
      </div>
    </div>
  )
}
