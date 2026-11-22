const statusMap = {
  'RECOVERED': { className: 'badge badge-green', label: 'Recovered' },
  'Recovered': { className: 'badge badge-green', label: 'Recovered' },
  'Verified': { className: 'badge badge-green', label: 'Verified' },
  'FAILED': { className: 'badge badge-red', label: 'Failed' },
  'Failed': { className: 'badge badge-red', label: 'Failed' },
  'REDELIVERY_REQUESTED': { className: 'badge badge-orange', label: 'Verifying' },
  'Verifying': { className: 'badge badge-orange', label: 'Verifying' },
  'REDELIVERY_FAILED': { className: 'badge badge-red', label: 'Unsuccessful' },
  'Unsuccessful': { className: 'badge badge-red', label: 'Unsuccessful' },
  'PENDING': { className: 'badge badge-gray', label: 'Not started' },
  'Not started': { className: 'badge badge-gray', label: 'Not started' },
  'Delivered': { className: 'badge badge-green', label: 'Delivered' },
  'OK': { className: 'badge badge-green', label: 'Delivered' },
  'Monitoring': { className: 'badge badge-green', label: 'Monitoring' },
  'Active': { className: 'badge badge-green', label: 'Active' },
  'Connected': { className: 'badge badge-green', label: 'Connected' },
}

export default function StatusBadge({ status }) {
  const mapping = statusMap[status] || { className: 'badge badge-gray', label: status || 'Unknown' }
  return <span className={mapping.className}>{mapping.label}</span>
}
