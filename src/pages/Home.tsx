import { useNavigate } from 'react-router-dom';
import { Store, Users, Lock, Bike, Package } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type DashboardColor = 'blue' | 'green' | 'purple' | 'orange';

interface Dashboard {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  path: string;
  color: DashboardColor;
}

const Home = () => {
  const navigate = useNavigate();

 const dashboards: Dashboard[] = [
  {
    id: 'merchant',
    title: 'Merchant Dashboard',
    description: 'Manage parcels, track shipments, and monitor your account',
    icon: Store,
    path: '/merchant-dashboard',
    color: 'blue'
  },
  {
    id: 'hub-manager',
    title: 'Hub Manager Dashboard',
    description: 'Manage distribution hubs and coordinate deliveries',
    icon: Users,
    path: '/hub-manager',
    color: 'green'
  },
  {
    id: 'admin',
    title: 'Admin Dashboard',
    description: 'Administrative controls and system management',
    icon: Lock,
    path: '/admin-dashboard',
    color: 'purple'
  },
  {
    id: 'rider',
    title: 'Rider Dashboard',
    description: 'View assigned deliveries and manage routes',
    icon: Bike,
    path: '/rider-dashboard',
    color: 'orange'
  }
];


 const colorMap: Record<
  DashboardColor,
  { bg: string; text: string; border: string; hover: string }
> = {
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-200',
    hover: 'hover:shadow-lg hover:border-blue-300'
  },
  green: {
    bg: 'bg-green-50',
    text: 'text-green-600',
    border: 'border-green-200',
    hover: 'hover:shadow-lg hover:border-green-300'
  },
  purple: {
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    border: 'border-purple-200',
    hover: 'hover:shadow-lg hover:border-purple-300'
  },
  orange: {
    bg: 'bg-orange-50',
    text: 'text-orange-600',
    border: 'border-orange-200',
    hover: 'hover:shadow-lg hover:border-orange-300'
  }
};

const getColorClasses = (color: DashboardColor) => colorMap[color];


  return (
    <div className="min-h-screen bg-linear-to-b from-gray-900 to-gray-800 flex flex-col">
      {/* Header */}
      <div className="bg-linear-to-r from-green-600 to-green-700 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="flex items-center gap-3 mb-4">
            <Package size={40} />
            <h1 className="text-4xl font-bold">CourierPro</h1>
          </div>
          <p className="text-lg text-green-100">Complete Courier Management System</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-2">Select Your Dashboard</h2>
            <p className="text-gray-300">Choose your role to access the appropriate management dashboard</p>
          </div>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dashboards.map((dashboard) => {
              const Icon = dashboard.icon;
              const colorClasses = getColorClasses(dashboard.color);

              return (
                <button
                  key={dashboard.id}
                  onClick={() => navigate(dashboard.path)}
                  className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300 ${colorClasses.bg} ${colorClasses.border} ${colorClasses.hover} text-left`}
                >
                  {/* Background gradient effect */}
                  <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                  {/* Content */}
                  <div className="relative p-6 h-full flex flex-col">
                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-lg ${colorClasses.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className={`${colorClasses.text}`} size={32} />
                    </div>

                    {/* Title */}
                    <h3 className={`text-xl font-bold ${colorClasses.text} mb-2`}>
                      {dashboard.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 text-sm flex-1 mb-4">
                      {dashboard.description}
                    </p>

                    {/* Arrow */}
                    <div className={`flex items-center gap-2 ${colorClasses.text} group-hover:translate-x-2 transition-transform`}>
                      <span className="text-sm font-semibold">Access</span>
                      <span>→</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-800 text-gray-400 text-center py-6 border-t border-gray-700">
        <p>&copy; 2025 CourierPro. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Home;