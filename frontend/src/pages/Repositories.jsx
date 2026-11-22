const repos = [
  { name: 'acme/platform-api', webhooks: 2, deliveries: '4,218', unresolved: 1, unresolvedType: 'red', monitoring: 'Active', sync: '< 1 min' },
  { name: 'acme/billing-service', webhooks: 2, deliveries: '2,846', unresolved: 1, unresolvedType: 'red', monitoring: 'Active', sync: '< 1 min' },
  { name: 'acme/deploy-hooks', webhooks: 2, deliveries: '1,954', unresolved: 1, unresolvedType: 'orange', monitoring: 'Active', sync: '< 1 min' },
  { name: 'acme/sdk-js', webhooks: 1, deliveries: '1,284', unresolved: 0, monitoring: 'Active', sync: '< 1 min' },
  { name: 'acme/web-console', webhooks: 2, deliveries: '1,048', unresolved: 0, monitoring: 'Active', sync: '< 1 min' },
  { name: 'acme/docs-site', webhooks: 1, deliveries: '690', unresolved: 0, monitoring: 'Active', sync: '< 1 min' },
  { name: 'acme/worker-jobs', webhooks: 1, deliveries: '512', unresolved: 0, monitoring: 'Active', sync: '< 1 min' },
  { name: 'acme/internal-tools', webhooks: 1, deliveries: '294', unresolved: 0, monitoring: 'Active', sync: '< 1 min' },
]

export default function Repositories() {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Repositories</h1>
          <p className="page-desc">Manage the repositories and webhooks connected to your workspace.</p>
        </div>
        <div className="page-header-actions">
          <a href="https://github.com" target="_blank" rel="noreferrer" className="btn btn-secondary">
            Manage GitHub access ↗
          </a>
          <button className="btn btn-primary">Add repository</button>
        </div>
      </div>

      <div className="connection-card">
        <div className="connection-card-left">
          <div className="connection-card-org">
            <span className="org-avatar">A</span>
            <span className="org-name">acme</span>
          </div>
          <span className="badge badge-green">Connected</span>
          <span className="connection-card-meta">GitHub App installation #482901 · Selected repositories only</span>
        </div>
        <div className="connection-card-right">
          <div className="connection-stat">
            <span className="connection-stat-value">8</span>
            <span className="connection-stat-label">monitored repositories</span>
          </div>
          <div className="connection-stat">
            <span className="connection-stat-value">12</span>
            <span className="connection-stat-label">active webhooks</span>
          </div>
          <span className="connection-sync">Synced just now</span>
        </div>
      </div>

      <div className="filter-bar">
        <input className="filter-input" placeholder="Search repositories…" />
        <select className="filter-select"><option>Monitoring: All</option></select>
        <select className="filter-select"><option>Health: All</option></select>
        <span className="filter-count">8 repositories</span>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Repository</th>
            <th>Webhooks</th>
            <th>Deliveries (24h)</th>
            <th>Unresolved</th>
            <th>Monitoring</th>
            <th>Last sync</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {repos.map(r => (
            <tr key={r.name}>
              <td><a href="#" className="text-blue">{r.name}</a></td>
              <td>{r.webhooks}</td>
              <td>{r.deliveries}</td>
              <td>
                {r.unresolved > 0
                  ? <span className={`badge badge-${r.unresolvedType}`}>{r.unresolved} unresolved</span>
                  : <span className="text-muted">None</span>
                }
              </td>
              <td><span className="badge badge-green">{r.monitoring}</span></td>
              <td className="cell-muted">{r.sync}</td>
              <td><button className="btn-icon">···</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="info-card">
        <div className="info-card-content">
          <div className="info-card-title">Missing a repository?</div>
          <div className="info-card-desc">If a repository isn't listed, it may not be included in your GitHub App installation.</div>
        </div>
        <button className="btn btn-secondary btn-sm">Sync repositories</button>
      </div>

      <div className="page-note">
        Monitoring is read-only until a workspace member explicitly requests redelivery.
      </div>
    </div>
  )
}
