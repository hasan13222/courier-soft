import { createBrowserRouter } from 'react-router-dom'
import MerchantDashboard from '../pages/MerchantDashboard'
import HubManagerDashboard from '../pages/HubManagerDashboard'
import Home from '../pages/Home'

const router = createBrowserRouter([
  {
    path: '/',
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: 'merchant-manager',
        element: <MerchantDashboard />
      },
      {
        path: 'hub-manager',
        element: <HubManagerDashboard />
      }
    ]
  }
])

export default router
