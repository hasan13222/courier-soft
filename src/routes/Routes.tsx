import { createBrowserRouter } from 'react-router-dom'
import MerchantDashboard from '../pages/MerchantDashboard'
import HubManagerDashboard from '../pages/HubManagerDashboard'
import Home from '../pages/Home'
import RiderDashboard from '../pages/RiderDashboard'
import AdminDashboard from '../pages/AdminDashboard'

const router = createBrowserRouter([
  {
    path: '/',
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: 'merchant-dashboard',
        element: <MerchantDashboard />
      },
      {
        path: 'admin-dashboard',
        element: <AdminDashboard />
      },
      {
        path: 'rider-dashboard',
        element: <RiderDashboard />
      },
      {
        path: 'hub-manager',
        element: <HubManagerDashboard />
      }
    ]
  }
])

export default router
