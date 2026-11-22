import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Check, AlertCircle, RotateCcw, Circle } from 'lucide-react'
import { fetchFailures, fetchRecoveryStatus, recoverDelivery } from '../api/client'

export default function DeliveryDetail() {
  const { id } = useParams()
  const [delivery, setDelivery] = useState(null)
  const [recoveryInfo, setRecoveryInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [recovering, setRecovering] = useState(false)
  const [error, setError] = useState(null)
  const [recoverMsg, setRecoverMsg] = useState(null)
  const [activeTab, setActiveTab] = useState('Response')

  useEffect(() => {
    loadData()
  }, [id])

  async function loadData() {
    setLoading(true)
    setError(null)
    try {
      const failuresData = await fetchFailures()
      const found = (failuresData.failures || []).find(
        f => String(f.deliveryId) === String(id)
      )
      if (found) {
        setDelivery(found)
        // Try to get recovery status
        try {
          const status = await fetchRecoveryStatus(found.deliveryId)
          setRecoveryInfo(status)
        } catch {
          // Not recovered yet, that's ok
        }
      } else {
        setError('Delivery not found in failure records.')
      }
    } catch (err) {
      setError(err.message || 'Failed to load delivery data.')
    } finally {
      setLoading(false)
    }
  }

  async function handleRedeliver() {
    if (!delivery) return
    setRecovering(true)
    setRecoverMsg(null)
    try {
      const result = await recoverDelivery(delivery.deliveryId)
      setRecoverMsg({ type: 'success', text: result.message || 'Redelivery requested.' })
      await loadData()
    } catch (err) {
      setRecoverMsg({ type: 'error', text: err.message || 'Recovery failed.' })
    } finally {
      setRecovering(false)
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    }) + ' · ' + d.toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZoneName: 'short'
    })
  }

  function formatTime(dateStr) {
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZoneName: 'short'
    })
  }

  function truncateId(idStr) {
    if (!idStr) return ''
    const s = String(idStr)
    return s.length > 8 ? s.slice(0, 8) : s
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <span>Loading delivery details...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon"><AlertCircle size={32} /></div>
        <div className="empty-state-title">{error}</div>
        <Link to="/app/deliveries" className="btn btn-secondary" style={{ marginTop: '16px' }}>
          Back to Deliveries
        </Link>
      </div>
    )
  }

  if (!delivery) return null

  const isRecovered = delivery.recoveryStatus === 'RECOVERED'
  const isFailed = delivery.recoveryStatus === 'PENDING' || delivery.recoveryStatus === 'REDELIVERY_FAILED'
  const isVerifying = delivery.recoveryStatus === 'REDELIVERY_REQUESTED'

  const statusBadgeClass = isRecovered ? 'badge badge-green'
    : isFailed ? 'badge badge-red'
    : isVerifying ? 'badge badge-orange'
    : 'badge badge-gray'

  const statusLabel = isRecovered ? 'Recovered'
    : delivery.recoveryStatus === 'REDELIVERY_FAILED' ? 'Unsuccessful'
    : isVerifying ? 'Verifying'
    : 'Failed'

  // Alert banner
  const alertClass = isRecovered ? 'alert-banner alert-banner-success'
    : 'alert-banner alert-banner-error'
  const alertTitle = isRecovered
    ? `Recovery verified · ${delivery.latestStatusCode || 200} OK`
    : `Delivery failed · ${delivery.statusCode} ${delivery.githubStatus?.replace(/\d+\s*/, '') || 'Bad Gateway'}`
  const alertText = isRecovered
    ? `GitHub redelivery ${delivery.latestRedeliveryId || ''} received a successful response at ${formatTime(delivery.verifiedAt)}.`
    : 'The endpoint returned a server error. Review the response before requesting redelivery.'

  return (
    <div>
      {/* Back link */}
      <Link to="/app/deliveries" className="detail-back-link">
        <ArrowLeft size={14} />
        Deliveries
      </Link>

      {/* Header */}
      <div className="detail-header">
        <div className="detail-title">
          <h1>{delivery.eventType || 'push'}</h1>
          <span className={statusBadgeClass}>{statusLabel}</span>
        </div>
        <div className="page-actions">
          <a href="#" className="btn btn-secondary btn-sm">
            View in GitHub <ExternalLink size={12} />
          </a>
          <button
            className={isRecovered ? 'btn btn-secondary btn-sm' : 'btn btn-primary btn-sm'}
            onClick={handleRedeliver}
            disabled={recovering || isRecovered}
          >
            {recovering ? 'Redelivering...' : isRecovered ? 'Redeliver again' : 'Redeliver'}
          </button>
        </div>
      </div>

      {/* GUID */}
      <div className="detail-guid">
        {delivery.guid || `${truncateId(delivery.deliveryId)}-xxxx-xxxx-xxxx-xxxxxxxxxxxx`}
      </div>

      {/* Alert */}
      <div className={alertClass} style={{ marginBottom: '24px' }}>
        <div>
          <div className="alert-banner-title">{alertTitle}</div>
          <div className="alert-banner-text">{alertText}</div>
        </div>
      </div>

      {recoverMsg && (
        <div className={`alert-banner ${recoverMsg.type === 'success' ? 'alert-banner-success' : 'alert-banner-error'}`} style={{ marginBottom: '24px' }}>
          <div className="alert-banner-title">{recoverMsg.text}</div>
        </div>
      )}

      {/* Meta grid */}
      <div className="detail-meta-grid">
        <div className="detail-meta-item">
          <label>Repository</label>
          <span><a href="#">acme / platform-api</a></span>
        </div>
        <div className="detail-meta-item">
          <label>Event</label>
          <span>{delivery.eventType} · main</span>
        </div>
        <div className="detail-meta-item">
          <label>Received</label>
          <span>{formatDate(delivery.deliveredAt)}</span>
        </div>
        <div className="detail-meta-item">
          <label>Endpoint</label>
          <span style={{ fontSize: '12px' }}>https://api.acme.dev/hooks/github</span>
        </div>
        <div className="detail-meta-item">
          <label>Duration</label>
          <span>1,203 ms</span>
        </div>
        <div className="detail-meta-item">
          <label>GitHub delivery ID</label>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{delivery.deliveryId}</span>
        </div>
      </div>

      {/* Body: Response + Timeline */}
      <div className="detail-body">
        {/* Response Section */}
        <div className="detail-response-section">
          <div className="detail-tabs">
            {['Request', 'Response', 'Recovery history'].map(tab => (
              <button
                key={tab}
                className={`detail-tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'Response' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600 }}>Original response</h3>
                <span className="badge badge-red">{delivery.statusCode} {delivery.githubStatus?.replace(/\d+\s*/, '') || 'Bad Gateway'}</span>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div className="uppercase" style={{ marginBottom: '8px' }}>HEADERS</div>
                <div className="code-block">
{`content-type    application/json
server          nginx/1.24.0
x-request-id    req_01jd8fk2a9`}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div className="uppercase">BODY</div>
                  <button className="btn btn-secondary btn-sm" onClick={() => navigator.clipboard.writeText('{\n  "error": "upstream connection refused"\n}')}>
                    Copy
                  </button>
                </div>
                <div className="code-block">
                  <span className="line-number">1</span>{'{'}{'\n'}
                  <span className="line-number">2</span>{'  "error": "upstream connection refused"'}{'\n'}
                  <span className="line-number">3</span>{'}'}
                </div>
              </div>

              <p className="text-xs text-muted" style={{ marginTop: '16px' }}>
                Response from the original delivery. Recovery responses are kept separately.
              </p>
            </div>
          )}

          {activeTab === 'Request' && (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <div className="uppercase" style={{ marginBottom: '8px' }}>HEADERS</div>
                <div className="code-block">
{`x-github-event       ${delivery.eventType || 'push'}
x-github-delivery    ${delivery.guid || delivery.deliveryId}
content-type         application/json`}
                </div>
              </div>
              <div>
                <div className="uppercase" style={{ marginBottom: '8px' }}>PAYLOAD</div>
                <div className="code-block">
{`{
  "ref": "refs/heads/main",
  "repository": {
    "full_name": "acme/platform-api"
  }
}`}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Recovery history' && (
            <div>
              {delivery.retryCount > 0 ? (
                <div>
                  <p className="text-sm" style={{ marginBottom: '12px' }}>
                    <span className="font-medium">{delivery.retryCount}</span> recovery attempt{delivery.retryCount !== 1 ? 's' : ''} recorded.
                  </p>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Attempt</th>
                        <th>Status</th>
                        <th>Response</th>
                        <th>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>#{delivery.retryCount}</td>
                        <td>
                          <span className={isRecovered ? 'badge badge-green' : 'badge badge-red'}>
                            {isRecovered ? 'Verified' : 'Pending'}
                          </span>
                        </td>
                        <td className="cell-mono">{isRecovered ? `${delivery.latestStatusCode} OK` : '—'}</td>
                        <td className="cell-secondary">{formatTime(delivery.lastRecoveryAttempt || delivery.verifiedAt)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-title">No recovery attempts yet</div>
                  <p className="text-sm text-secondary">Use the Redeliver button to request a recovery.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Recovery Timeline */}
        <div className="recovery-timeline">
          <div className="timeline-title">Recovery timeline</div>
          <div className="timeline-subtitle">Every attempt stays linked to this delivery.</div>

          <div className="timeline-items">
            {/* Newest first */}
            {isRecovered && (
              <div className="timeline-item">
                <div className="timeline-icon timeline-icon-green">
                  <Check size={12} />
                </div>
                <div className="timeline-content">
                  <div className="timeline-content-title">Redelivery verified</div>
                  <div className="timeline-content-text">
                    {formatTime(delivery.verifiedAt)} · {delivery.latestStatusCode || 200} OK · 184 ms
                  </div>
                  {delivery.latestRedeliveryId && (
                    <a href="#" className="timeline-content-link">
                      GitHub delivery #{String(delivery.latestRedeliveryId).slice(0, 7)} ↗
                    </a>
                  )}
                </div>
              </div>
            )}

            {(isRecovered || isVerifying) && delivery.retryCount > 0 && (
              <div className="timeline-item">
                <div className="timeline-icon timeline-icon-blue">
                  <RotateCcw size={12} />
                </div>
                <div className="timeline-content">
                  <div className="timeline-content-title">Redelivery requested</div>
                  <div className="timeline-content-text">
                    {formatTime(delivery.lastRecoveryAttempt)} · Morgan Chen
                  </div>
                </div>
              </div>
            )}

            {/* Original failure — always shown */}
            <div className="timeline-item">
              <div className="timeline-icon timeline-icon-red">
                <AlertCircle size={12} />
              </div>
              <div className="timeline-content">
                <div className="timeline-content-title">Original delivery failed</div>
                <div className="timeline-content-text">
                  {formatTime(delivery.deliveredAt)} · {delivery.statusCode} {delivery.githubStatus?.replace(/\d+\s*/, '') || 'Bad Gateway'}
                </div>
              </div>
            </div>

            {/* No recovery attempts */}
            {!isRecovered && !isVerifying && delivery.retryCount === 0 && (
              <div className="timeline-item">
                <div className="timeline-icon timeline-icon-gray">
                  <Circle size={12} />
                </div>
                <div className="timeline-content">
                  <div className="timeline-content-title">No recovery attempts yet</div>
                  <div className="timeline-content-text">
                    Redeliver when your endpoint is ready.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Info box */}
          <div className="timeline-info-box">
            <div className="timeline-info-title">
              {isRecovered ? 'Verified recovery' : 'Before you retry'}
            </div>
            <div className="timeline-info-text">
              {isRecovered
                ? 'A successful 2xx response was received. Application-side processing is not verified.'
                : 'Redelivery may trigger the same side effects. Make sure your endpoint handles duplicates.'
              }
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted" style={{ marginTop: '24px' }}>
        Payloads may contain sensitive data. Share delivery IDs, not secrets.
      </p>
    </div>
  )
}
