import { Outlet, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import AppSidebar from './AppSidebar'
import { fetchHealth, fetchFailures } from '../api/client'
import { ExternalLink } from 'lucide-react'

export default function AppLayout() {
  const [health, setHealth] = useState(null)
  const [failedCount, setFailedCount] = useState(0)
  const location = useLocation()

  useEffect(() => {
    fetchHealth().then(d => setHealth(d)).catch(() => {})
    fetchFailures().then(d => {
      const unresolved = (d.failures || []).filter(f => f.recoveryStatus !== 'RECOVERED').length
      setFailedCount(unresolved)
    }).catch(() => {})
  }, [])

  const pathSegments = location.pathname.split('/').filter(Boolean)
  const pageName = pathSegments.length > 1 ? pathSegments[pathSegments.length - 1] : 'Overview'
  const pageTitle = pageName.charAt(0).toUpperCase() + pageName.slice(1)

  return (
    <div className="app-layout">
      <AppSidebar failedCount={failedCount} />
      <div className="app-main">
        <div className="app-topbar">
          <div className="app-topbar-breadcrumb">
            acme <span>›</span> {pageTitle}
          </div>
          <div className="app-topbar-right">
            {health && (
              <div className="app-topbar-status">
                <span className="app-topbar-status-dot"></span>
                All systems operational
              </div>
            )}
            <a href="#" className="btn btn-secondary btn-sm">
              Help <ExternalLink size={12} />
            </a>
          </div>
        </div>
        <div className="app-content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
