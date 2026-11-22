import { useState, useEffect } from 'react'
import { getStoredAdminKey, setAdminKey } from '../api/client'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

const TABS = ['General', 'Recovery', 'Notifications', 'Members', 'Billing', 'Security']

export default function Settings() {
  const [adminKey, setAdminKeyState] = useState('')
  const [backendUrl, setBackendUrl] = useState(BACKEND_URL)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState('Recovery')

  // Recovery policy state
  const [recoveryMode, setRecoveryMode] = useState('Manual redelivery only')
  const [maxAttempts, setMaxAttempts] = useState('3 attempts')
  const [verificationTimeout, setVerificationTimeout] = useState('120 seconds')
  const [requireConfirmation, setRequireConfirmation] = useState(true)
  const [restrictToAdmins, setRestrictToAdmins] = useState(false)

  useEffect(() => {
    setAdminKeyState(getStoredAdminKey())
  }, [])

  function handleSave() {
    setAdminKey(adminKey)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-desc">Workspace configuration for acme.</p>
        </div>
      </div>

      <div className="tabs">
        {TABS.map(tab => (
          <button
            key={tab}
            className={`tab${activeTab === tab ? ' tab-active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'General' && (
        <div className="settings-layout">
          <div className="card settings-card">
            <div className="settings-section-title">API Configuration</div>
            <div className="form-group">
              <label className="form-label">Admin Key</label>
              <input
                className="form-input"
                type="password"
                value={adminKey}
                onChange={e => setAdminKeyState(e.target.value)}
                placeholder="Enter your admin key…"
              />
              <div className="form-hint">Required for recovery operations. Stored locally in your browser.</div>
            </div>
            <div className="form-group">
              <label className="form-label">Backend URL</label>
              <input
                className="form-input"
                type="text"
                value={backendUrl}
                onChange={e => setBackendUrl(e.target.value)}
              />
              <div className="form-hint">The URL of your webhook recovery server.</div>
            </div>
            <div className="form-actions">
              {saved && <span className="success-msg">✓ Saved successfully</span>}
              <button className="btn btn-primary" onClick={handleSave}>Save changes</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Recovery' && (
        <div className="settings-layout settings-layout-two-col">
          <div className="card settings-card">
            <div className="settings-card-header">
              <div className="settings-card-title">Recovery policy</div>
              <div className="settings-card-desc">Defaults apply to all repositories in this workspace.</div>
            </div>

            <div className="form-group">
              <label className="form-label">Recovery mode</label>
              <select className="form-input form-select" value={recoveryMode} onChange={e => setRecoveryMode(e.target.value)}>
                <option>Manual redelivery only</option>
                <option>Automatic redelivery</option>
              </select>
              <div className="form-hint">Nothing is retried automatically. A member must request each recovery.</div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Maximum attempts per delivery</label>
                <select className="form-input form-select" value={maxAttempts} onChange={e => setMaxAttempts(e.target.value)}>
                  <option>1 attempt</option>
                  <option>3 attempts</option>
                  <option>5 attempts</option>
                  <option>10 attempts</option>
                </select>
                <div className="form-hint">Additional retries require a new request.</div>
              </div>
              <div className="form-group">
                <label className="form-label">Verification timeout</label>
                <select className="form-input form-select" value={verificationTimeout} onChange={e => setVerificationTimeout(e.target.value)}>
                  <option>30 seconds</option>
                  <option>60 seconds</option>
                  <option>120 seconds</option>
                  <option>300 seconds</option>
                </select>
                <div className="form-hint">Mark as unverified if no response arrives.</div>
              </div>
            </div>

            <div className="toggle-row">
              <div className="toggle-info">
                <div className="toggle-label">Require confirmation before redelivery</div>
                <div className="form-hint">Show the destination and duplicate-event warning.</div>
              </div>
              <label className="toggle">
                <input type="checkbox" checked={requireConfirmation} onChange={e => setRequireConfirmation(e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="toggle-row">
              <div className="toggle-info">
                <div className="toggle-label">Restrict redelivery to workspace admins</div>
                <div className="form-hint">Members can inspect deliveries but cannot request recovery.</div>
              </div>
              <label className="toggle">
                <input type="checkbox" checked={restrictToAdmins} onChange={e => setRestrictToAdmins(e.target.checked)} />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="settings-card-footer">
              <div className="form-hint">Changes are recorded in the audit log. Last updated Nov 20, 2026 by Morgan Chen</div>
              <button className="btn btn-primary" onClick={handleSave}>Save changes</button>
            </div>
            {saved && <div className="success-msg">✓ Saved successfully</div>}
          </div>

          <div className="settings-side">
            <div className="card info-panel">
              <div className="info-panel-title">Safe by default</div>
              <ol className="info-panel-list">
                <li>No automatic retries</li>
                <li>Explicit confirmation</li>
                <li>Response-based verification</li>
                <li>Every attempt is recorded</li>
              </ol>
              <div className="form-hint" style={{ marginTop: '12px' }}>
                A successful HTTP response does not guarantee that downstream processing completed.
              </div>
            </div>

            <div className="card info-panel">
              <div className="info-panel-title">Delivery retention</div>
              <div className="info-panel-big">30 days</div>
              <div className="form-hint">Included in your Team plan.</div>
              <a href="#" className="text-blue" style={{ display: 'block', marginTop: '8px', fontSize: '13px' }}>
                Manage plan and retention →
              </a>
            </div>
          </div>
        </div>
      )}

      {!['General', 'Recovery'].includes(activeTab) && (
        <div className="card settings-card">
          <div className="empty-state">
            <div className="empty-state-title">{activeTab} settings</div>
            <div className="empty-state-desc">Configuration for {activeTab.toLowerCase()} will appear here.</div>
          </div>
        </div>
      )}
    </div>
  )
}
