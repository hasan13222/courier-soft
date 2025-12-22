import { Routes, Route } from 'react-router-dom'
import HubManagerDashboard from './pages/HubManagerDashboard'
import MerchantDashboard from './pages/MerchantDashboard'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MerchantDashboard />} />
      <Route path="/hub-manager" element={<HubManagerDashboard />} />
    </Routes>
  )
}
