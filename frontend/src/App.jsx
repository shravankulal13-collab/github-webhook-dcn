import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Overview from './pages/Overview'
import Deliveries from './pages/Deliveries'
import DeliveryDetail from './pages/DeliveryDetail'
import Recoveries from './pages/Recoveries'
import Repositories from './pages/Repositories'
import Settings from './pages/Settings'
import AppLayout from './components/AppLayout'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route element={<AppLayout />}>
        <Route path="/app" element={<Overview />} />
        <Route path="/app/deliveries" element={<Deliveries />} />
        <Route path="/app/deliveries/:id" element={<DeliveryDetail />} />
        <Route path="/app/recoveries" element={<Recoveries />} />
        <Route path="/app/repositories" element={<Repositories />} />
        <Route path="/app/settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}
