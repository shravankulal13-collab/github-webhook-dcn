import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ArrowLeftRight, RotateCcw, FolderGit2, Settings, ExternalLink, ChevronDown } from 'lucide-react'

export default function AppSidebar({ failedCount = 0 }) {
  return (
    <aside className="app-sidebar">
      <div className="app-sidebar-header">
        <div className="app-sidebar-logo">WEBHOOK<br />RECOVERY</div>
        <button className="app-sidebar-org">
          acme <ChevronDown size={14} />
        </button>
      </div>

      <nav className="app-sidebar-nav">
        <div className="app-sidebar-section">
          <div className="app-sidebar-section-title">Workspace</div>
          <NavLink to="/app" end className={({ isActive }) => `app-sidebar-link ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={16} className="sidebar-link-icon" />
            Overview
          </NavLink>
          <NavLink to="/app/deliveries" className={({ isActive }) => `app-sidebar-link ${isActive ? 'active' : ''}`}>
            <ArrowLeftRight size={16} className="sidebar-link-icon" />
            Deliveries
            {failedCount > 0 && <span className="sidebar-badge">{failedCount}</span>}
          </NavLink>
          <NavLink to="/app/recoveries" className={({ isActive }) => `app-sidebar-link ${isActive ? 'active' : ''}`}>
            <RotateCcw size={16} className="sidebar-link-icon" />
            Recoveries
          </NavLink>
          <NavLink to="/app/repositories" className={({ isActive }) => `app-sidebar-link ${isActive ? 'active' : ''}`}>
            <FolderGit2 size={16} className="sidebar-link-icon" />
            Repositories
          </NavLink>
          <NavLink to="/app/settings" className={({ isActive }) => `app-sidebar-link ${isActive ? 'active' : ''}`}>
            <Settings size={16} className="sidebar-link-icon" />
            Settings
          </NavLink>
        </div>

        <div className="app-sidebar-section">
          <div className="app-sidebar-section-title">Resources</div>
          <a href="#" className="app-sidebar-link">
            Documentation <ExternalLink size={12} />
          </a>
          <a href="#" className="app-sidebar-link">Changelog</a>
        </div>
      </nav>

      <div className="app-sidebar-footer">
        <div className="sidebar-plan-card">
          <div className="sidebar-plan-title">
            <span className="sidebar-plan-name">Team plan</span>
            <a href="#" className="sidebar-plan-link">Manage ↗</a>
          </div>
          <div className="sidebar-plan-usage">12,846 / 50,000 deliveries</div>
          <div className="sidebar-plan-bar">
            <div className="sidebar-plan-bar-fill" style={{ width: '25%' }}></div>
          </div>
          <div className="sidebar-plan-reset">Resets Dec 1</div>
        </div>

        <div className="sidebar-user">
          <div className="sidebar-user-avatar">MC</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">Morgan Chen</div>
            <div className="sidebar-user-role">Workspace admin</div>
          </div>
          <ChevronDown size={14} style={{ color: 'var(--color-text-muted)' }} />
        </div>
      </div>
    </aside>
  )
}
