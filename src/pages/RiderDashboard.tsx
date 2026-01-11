import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bike,
  Package,
  Menu,
  X,
  TrendingUp,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Phone,
  DollarSign,
  Settings,
  LogOut,
  Search,
  Home
} from 'lucide-react';

const RiderDashboard = () => {
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [deliveries, setDeliveries] = useState<Array<any>>([
  {
    id: 'DEL001',
    type: 'delivery',
    recipient: 'John Doe',
    address: 'House 12, Gulshan',
    phone: '01712345678',
    status: 'Pending',
    distance: 2.3,
    amount: 45,
    courierCharge: 50,
    paymentStatus: 'DUE'
  },
  {
    id: 'DEL002',
    type: 'delivery',
    recipient: 'Jane Smith',
    address: 'Apartment 5B, Banani',
    phone: '01812345678',
    status: 'In Progress',
    distance: 1.5,
    amount: 45,
    courierCharge: 75,
    paymentStatus: 'PAID'
  },
  {
    id: 'DEL003',
    type: 'delivery',
    recipient: 'Mike Johnson',
    address: 'Office 201, Dhanmondi',
    phone: '01912345678',
    status: 'Completed',
    distance: 0,

amount: 45,    courierCharge: 60,
    paymentStatus: 'PAID'
  },
  {
    id: 'DEL004',
    type: 'pickup',
    sender: 'Sarah Ahmed',
    address: 'House 45, Mirpur',
    phone: '01612345678',
    status: 'Pending',
    distance: 3.1,
    amount: 45,
    courierCharge: 80,
    paymentStatus: 'DUE'
  },
  {
    id: 'DEL005',
    type: 'delivery',
    recipient: 'Rahim Khan',
    address: 'Shop 3, Motijheel',
    phone: '01512345678',
    status: 'In Progress',
    distance: 0.8,
    amount: 45,
    courierCharge: 55,
    paymentStatus: 'DUE'
  },
  {
    id: 'PIC001',
    type: 'pickup',
    sender: 'Ahmed Store',
    address: 'Shop 10, Kawran Bazar',
    phone: '01234567890',
    status: 'Pending',
    distance: 2.5,
    amount: 45,
    courierCharge: 45,
    paymentStatus: 'PAID'
  }
]);

  const [earnings,] = useState<{ today: number; weekly: number; monthly: number; balance: number }>({
    today: 650,
    weekly: 3500,
    monthly: 15000,
    balance: 5200
  });

  const [selectedDelivery, setSelectedDelivery] = useState<any | null>(null);
  const [otpForId, setOtpForId] = useState<string | null>(null);
  const [otpValue, setOtpValue] = useState<string>('');
  const [failForId, setFailForId] = useState<string | null>(null);
  const [failReason, setFailReason] = useState<string>('');

  const handleViewDelivery = (delivery: any): void => {
    setSelectedDelivery(delivery);
    setOtpForId(null);
    setOtpValue('');
  };
  const [deliveryHistory, setDeliveryHistory] = useState<Array<any>>([
    { id: 'DEL-DEC-001', type: 'delivery', recipient: 'Karim Hassan', address: 'Dhaka', status: 'Completed', date: '2025-12-22', amount: '৳50' },
    { id: 'DEL-DEC-002', type: 'delivery', recipient: 'Farhana Rani', address: 'Chattogram', status: 'Completed', date: '2025-12-21', amount: '৳75' },
    { id: 'DEL-DEC-003', type: 'delivery', recipient: 'Akram Hussain', address: 'Dhaka', status: 'Completed', date: '2025-12-20', amount: '৳60' },
    { id: 'PIC-DEC-001', type: 'pickup', sender: 'Rahman Warehouse', address: 'Gazipur', status: 'Completed', date: '2025-12-21', amount: '৳45' },
    { id: 'PIC-DEC-002', type: 'pickup', sender: 'Rana Store', address: 'Dhaka', status: 'Completed', date: '2025-12-19', amount: '৳55' }
  ]);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'active-orders', label: 'Active Orders', icon: Bike },
    { id: 'delivery-history', label: 'Order History', icon: CheckCircle },
    { id: 'failed-history', label: 'Failed History', icon: AlertCircle },
    { id: 'earnings', label: 'Earnings', icon: DollarSign },
    { id: 'route-map', label: 'Route Map', icon: MapPin },
    { id: 'support', label: 'Support', icon: Phone },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const DashboardModule = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Today Deliveries</p>
              <p className="text-3xl font-bold text-gray-800">5</p>
            </div>
            <Bike className="text-orange-500" size={40} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Completed</p>
              <p className="text-3xl font-bold text-gray-800">3</p>
            </div>
            <CheckCircle className="text-green-500" size={40} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending</p>
              <p className="text-3xl font-bold text-gray-800">2</p>
            </div>
            <Clock className="text-blue-500" size={40} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Today Earnings</p>
              <p className="text-3xl font-bold text-gray-800">৳{earnings.today}</p>
            </div>
            <DollarSign className="text-purple-500" size={40} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Active Orders</h3>
          <div className="space-y-3">
            {deliveries.filter(d => d.status !== 'Completed' && d.status !== 'Failed').slice(0, 4).map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-orange-50 transition-colors cursor-pointer" onClick={() => handleViewDelivery(item)}>
                <div className="flex items-center space-x-3 flex-1">
                  {item.type === 'delivery' ? (
                    <Bike className="text-orange-500" size={20} />
                  ) : (
                    <Package className="text-purple-500" size={20} />
                  )}
                  <div>
                    <p className="font-medium text-gray-800">{item.id}</p>
                    <p className="text-sm text-gray-500">{item.type === 'delivery' ? item.recipient : item.sender}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 text-nowrap rounded-full text-xs font-medium ${item.type === 'delivery' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                    }`}>
                    {item.type === 'delivery' ? '🚚 Delivery' : '📦 Pickup'}
                  </span>
                  <p className="text-sm font-semibold text-gray-800 mt-1">{item.amount}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Quick Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <p className="text-sm text-gray-600 mb-2">Weekly Earnings</p>
              <p className="text-2xl font-bold text-orange-600">৳{earnings.weekly}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-gray-600 mb-2">Monthly Earnings</p>
              <p className="text-2xl font-bold text-green-600">৳{earnings.monthly}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600 mb-2">Total Balance</p>
              <p className="text-2xl font-bold text-blue-600">৳{earnings.balance}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <p className="text-sm text-gray-600 mb-2">Completion Rate</p>
              <p className="text-2xl font-bold text-purple-600">96%</p>
            </div>
          </div>
        </div>
      </div>


    </div>
  );

  const ActiveDeliveriesModule = () => {
    const [filter, setFilter] = useState('all');

    const handleStartDelivery = (deliveryId: string): void => {
      setDeliveries(prev => prev.map(d =>
        d.id === deliveryId ? { ...d, status: 'In Progress' } : d
      ));
    };
    const handlePaidParcel = (deliveryId: string): void => {
      setDeliveries(prev => prev.map(d =>
        d.id === deliveryId ? { ...d, paymentStatus: 'PAID' } : d
      ));
    };

    const getDisplayName = (item: any) => {
      return item.type === 'delivery' ? item.recipient : item.sender;
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Active Pickups & Deliveries</h2>
          <div className="flex gap-2">
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
              <option value="all">All Active</option>
              <option value="delivery">Deliveries</option>
              <option value="pickup">Pickups</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Type</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Contact Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Address</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Distance</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Courier Charge</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Payment Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Rider Amount</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {deliveries.filter(d => {
                if (d.status === 'Completed' || d.status === 'Failed') return false;
                if (filter === 'all') return true;
                if (filter === 'delivery') return d.type === 'delivery';
                if (filter === 'pickup') return d.type === 'pickup';
                if (filter === 'pending') return d.status === 'Pending';
                if (filter === 'in-progress') return d.status === 'In Progress';
                return true;
              }).map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm font-medium text-gray-800">{item.id}</td>
                  <td className="px-6 py-3">
                    <span className={`px-3 py-1 text-nowrap rounded-full text-xs font-medium ${item.type === 'delivery' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                      {item.type === 'delivery' ? '🚚 Delivery' : '📦 Pickup'}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-700">{getDisplayName(item)}</td>
                  <td className="px-6 py-3 text-sm text-gray-700">{item.address}</td>
                  <td className="px-6 py-3">
                    <span className={`px-3 py-1 text-nowrap rounded-full text-xs font-medium ${item.status === 'Completed' ? 'bg-green-100 text-green-700' :
                        item.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'
                      }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-700">{item.distance}</td>
                  <td className="px-6 py-3 text-sm text-gray-700">{item.courierCharge}</td><td className="px-6 py-3 text-sm text-gray-700">{item.paymentStatus}</td>
                  <td className="px-6 py-3 text-sm font-semibold text-orange-600">{item.amount}</td>
                  <td className="px-6 py-3 text-sm">
                    {item.status === 'Pending' ? (
                      <button
                        onClick={() => handleStartDelivery(item.id)}
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors font-medium"
                      >
                        Start
                      </button>
                    ) : (
                      <div className="flex items-center gap-3">
                        <button onClick={() => handleViewDelivery(item)} className="text-blue-600 hover:text-blue-800 font-medium">View</button>
                        {item.paymentStatus === 'DUE' && <button
                        onClick={() => handlePaidParcel(item.id)}
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-nowrap transition-colors font-medium"
                      >
                        Make Paid
                      </button>}
                        
                        <button onClick={() => { setOtpForId(item.id); setOtpValue(''); }} className="text-green-600 hover:text-green-800 font-medium">Complete</button>
                        <button onClick={() => { setFailForId(item.id); setFailReason(''); }} className="text-red-600 hover:text-red-800 font-medium">Fail</button>
                      </div>
                    )}


                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const DeliveryHistoryModule = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');

    const getDisplayName = (item: any) => {
      return item.type === 'delivery' ? item.recipient : item.sender;
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Pickup & Delivery History</h2>
          <div className="flex gap-2">
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
              <option value="all">All</option>
              <option value="delivery">Deliveries</option>
              <option value="pickup">Pickups</option>
            </select>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search history..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Type</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Contact Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Location</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Amount</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Reason</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {deliveryHistory.filter(item => {
                const matchesSearch = item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  getDisplayName(item).toLowerCase().includes(searchTerm.toLowerCase());
                const matchesType = filterType === 'all' || item.type === filterType;
                return matchesSearch && matchesType;
              }).map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm font-medium text-gray-800">{item.id}</td>
                  <td className="px-6 py-3">
                    <span className={`px-3 py-1 text-nowrap rounded-full text-xs font-medium ${item.type === 'delivery' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                      {item.type === 'delivery' ? '🚚 Delivery' : '📦 Pickup'}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-700">{getDisplayName(item)}</td>
                  <td className="px-6 py-3 text-sm text-gray-700">{item.address}</td>
                  <td className="px-6 py-3 text-sm text-gray-700">{item.date}</td>
                  <td className="px-6 py-3 text-sm font-semibold text-orange-600">{item.amount}</td>
                  <td className="px-6 py-3 text-sm text-gray-700">{item.reason ?? '-'}</td>
                  <td className="px-6 py-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${item.status === "Failed" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"} `}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const FailedHistoryModule = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const getDisplayName = (item: any) => {
      return item.type === 'delivery' ? item.recipient : item.sender;
    };

    const failedItems = deliveryHistory.filter(item => item.status === 'Failed');

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Failed Orders</h2>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search failed orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Type</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Contact Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Location</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Amount</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Reason</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {failedItems.filter(item => {
                const matchesSearch = item.id.toLowerCase().includes(searchTerm.toLowerCase()) || getDisplayName(item).toLowerCase().includes(searchTerm.toLowerCase());
                return matchesSearch;
              }).map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm font-medium text-gray-800">{item.id}</td>
                  <td className="px-6 py-3">
                    <span className={`px-3 py-1 text-nowrap rounded-full text-xs font-medium ${item.type === 'delivery' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                      {item.type === 'delivery' ? '🚚 Delivery' : '📦 Pickup'}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-700">{getDisplayName(item)}</td>
                  <td className="px-6 py-3 text-sm text-gray-700">{item.address}</td>
                  <td className="px-6 py-3 text-sm text-gray-700">{item.date}</td>
                  <td className="px-6 py-3 text-sm font-semibold text-orange-600">{item.amount}</td>
                  <td className="px-6 py-3 text-sm text-gray-700">{item.reason ?? '-'}</td>
                  <td className="px-6 py-3">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const EarningsModule = () => {

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Earnings & Revenue</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
            <p className="text-gray-500 text-sm mb-2">Today Earnings</p>
            <p className="text-3xl font-bold text-gray-800">৳{earnings.today}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <p className="text-gray-500 text-sm mb-2">Weekly Earnings</p>
            <p className="text-3xl font-bold text-gray-800">৳{earnings.weekly}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
            <p className="text-gray-500 text-sm mb-2">Monthly Earnings</p>
            <p className="text-3xl font-bold text-gray-800">৳{earnings.monthly}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
            <p className="text-gray-500 text-sm mb-2">Available Balance</p>
            <p className="text-3xl font-bold text-gray-800">৳{earnings.balance}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Earnings Breakdown</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Base Payment</span>
                <span className="font-semibold text-gray-800">৳12,000</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Bonus (Performance)</span>
                <span className="font-semibold text-green-600">+ ৳2,000</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Tips</span>
                <span className="font-semibold text-orange-600">+ ৳1,000</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                <span className="font-semibold text-gray-800">Total This Month</span>
                <span className="font-bold text-orange-600 text-lg">৳15,000</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Withdrawal & Payments</h3>
            <div className="space-y-3">
              <button className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium">
                Request Withdrawal
              </button>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900 mb-2"><strong>Next Payment Date:</strong></p>
                <p className="text-lg font-semibold text-blue-600">December 30, 2025</p>
              </div>
              <div className="text-sm text-gray-600">
                <p><strong>Recent Withdrawals:</strong></p>
                <ul className="mt-2 space-y-1">
                  <li>• Dec 15: ৳5,000 (Completed)</li>
                  <li>• Dec 8: ৳3,000 (Completed)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const RouteMapModule = () => {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Route Map & Navigation</h2>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center mb-6 border-2 border-dashed border-gray-300">
            <div className="text-center">
              <MapPin className="mx-auto text-gray-400 mb-3" size={48} />
              <p className="text-gray-600 font-semibold">Interactive Map Integration</p>
              <p className="text-sm text-gray-500 mt-1">Google Maps / Mapbox Integration Coming Soon</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3">Today's Route</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2 bg-white rounded border border-gray-200">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-sm">1</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Gulshan, Dhaka</p>
                    <p className="text-xs text-gray-500">Start Point - 9:00 AM</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 bg-white rounded border border-gray-200">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">2</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Banani, Dhaka</p>
                    <p className="text-xs text-gray-500">Stop 1 - 9:45 AM</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 bg-white rounded border border-gray-200">
                  <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm">3</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Dhanmondi, Dhaka</p>
                    <p className="text-xs text-gray-500">Stop 2 - 10:30 AM</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3">Route Statistics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white rounded border border-gray-200">
                  <span className="text-gray-700">Total Distance</span>
                  <span className="font-semibold text-gray-800">12.5 km</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded border border-gray-200">
                  <span className="text-gray-700">Estimated Time</span>
                  <span className="font-semibold text-gray-800">2 hrs 30 min</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded border border-gray-200">
                  <span className="text-gray-700">Deliveries on Route</span>
                  <span className="font-semibold text-gray-800">5</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded border border-gray-200">
                  <span className="text-gray-700">Current Status</span>
                  <span className="font-semibold text-blue-600">In Progress</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SupportModule = () => {
    const [supportTickets,] = useState([
      { id: 'TKT001', subject: 'Payment Issue', status: 'Open', date: '2025-12-22' },
      { id: 'TKT002', subject: 'Delivery Route Error', status: 'Resolved', date: '2025-12-20' },
      { id: 'TKT003', subject: 'App Bug Report', status: 'In Progress', date: '2025-12-21' },
    ]);

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Support & Help</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Phone className="text-blue-600 mb-3" size={32} />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Call Support</h3>
            <p className="text-gray-600 mb-3">Speak with our support team</p>
            <p className="text-2xl font-bold text-blue-600">+880 2 XXXX XXXX</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <AlertCircle className="text-orange-600 mb-3" size={32} />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Report Issue</h3>
            <p className="text-gray-600 mb-3">Create a support ticket</p>
            <button className="w-full bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
              Create Ticket
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <Package className="text-green-600 mb-3" size={32} />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">FAQ & Guides</h3>
            <p className="text-gray-600 mb-3">View help documentation</p>
            <button className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              View FAQs
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Support Tickets</h3>
          <div className="space-y-3">
            {supportTickets.map(ticket => (
              <div key={ticket.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <p className="font-medium text-gray-800">{ticket.subject}</p>
                  <p className="text-sm text-gray-500">Ticket #{ticket.id} - {ticket.date}</p>
                </div>
                <span className={`px-3 py-1 text-nowrap rounded-full text-xs font-medium ${ticket.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                    ticket.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                  }`}>
                  {ticket.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const SettingsModule = () => {
    const [notificationSettings, setNotificationSettings] = useState({
      newDelivery: true,
      paymentNotification: true,
      weeklyReport: true,
      promotionalEmail: false
    });

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Settings</h2>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Profile Information</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                AB
              </div>
              <div>
                <p className="font-semibold text-gray-800">Abdul Bayazid</p>
                <p className="text-sm text-gray-600">abdul.bayazid@email.com</p>
                <p className="text-sm text-gray-600">+880 1234567890</p>
              </div>
            </div>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Edit Profile
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Notification Settings</h3>
          <div className="space-y-4">
            {Object.entries(notificationSettings).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={() => setNotificationSettings({ ...notificationSettings, [key]: !value })}
                    className="w-5 h-5 text-orange-600 rounded"
                  />
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Bank & Payment Details</h3>
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Bank Name</p>
              <p className="font-semibold text-gray-800">Dutch-Bangla Bank</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Account Number</p>
              <p className="font-semibold text-gray-800">XXXX XXXX XXXX 5678</p>
            </div>
            <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Update Payment Details
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Actions</h3>
          <div className="space-y-3">
            <button className="w-full bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center gap-2">
              <Settings size={18} /> Change Password
            </button>
            <button className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard': return <DashboardModule />;
      case 'active-orders': return <ActiveDeliveriesModule />;
      case 'delivery-history': return <DeliveryHistoryModule />;
      case 'failed-history': return <FailedHistoryModule />;
      case 'earnings': return <EarningsModule />;
      case 'route-map': return <RouteMapModule />;
      case 'support': return <SupportModule />;
      case 'settings': return <SettingsModule />;
      default: return <DashboardModule />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-linear-to-b from-green-600 to-green-700 text-white transition-all duration-300 flex flex-col`}>
        <div className="p-4 flex items-center justify-between border-b border-green-500">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/')} className="p-2 hover:bg-green-500 rounded-lg transition-colors" title="Back to Home">
              <Home size={20} />
            </button>
            {sidebarOpen && <h1 className="text-xl font-bold">CourierPro</h1>}
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-green-500 rounded-lg transition-colors">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveModule(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeModule === item.id ? 'bg-green-800' : 'hover:bg-green-500'
                  }`}
              >
                <Icon size={20} />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-green-500">
          <div className="flex items-center space-x-3 px-4">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
              AB
            </div>
            {sidebarOpen && (
              <div>
                <p className="font-medium">Abdul Bayazid</p>
                <p className="text-xs text-orange-200">Rider ID: R001</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        {selectedDelivery && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedDelivery(null)}>
            <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {selectedDelivery.type === 'delivery' ? 'Delivery' : 'Pickup'} Details
                </h3>
                <button onClick={() => setSelectedDelivery(null)} className="text-gray-500 hover:text-gray-800">
                  <X size={20} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">ID</p>
                  <p className="text-lg font-semibold text-gray-800">{selectedDelivery.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {selectedDelivery.type === 'delivery' ? '🚚 Delivery' : '📦 Pickup'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    {selectedDelivery.type === 'delivery' ? 'Recipient' : 'Sender'}
                  </p>
                  <p className="text-lg font-semibold text-gray-800">
                    {selectedDelivery.type === 'delivery' ? selectedDelivery.recipient : selectedDelivery.sender}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="text-lg font-semibold text-gray-800">{selectedDelivery.address}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="text-lg font-semibold text-gray-800">{selectedDelivery.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Distance</p>
                  <p className="text-lg font-semibold text-gray-800">{selectedDelivery.distance}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Amount</p>
                  <p className="text-lg font-semibold text-orange-600">{selectedDelivery.amount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="text-lg font-semibold text-gray-800">{selectedDelivery.status}</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-500">Actions available from the Active Pickups & Deliveries list.</p>
              </div>
            </div>
          </div>
        )}
        {otpForId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setOtpForId(null)}>
            <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Enter OTP</h3>
                <button onClick={() => setOtpForId(null)} className="text-gray-500 hover:text-gray-800"><X size={20} /></button>
              </div>
              <p className="text-sm text-gray-600 mb-3">Enter OTP provided by customer to complete delivery (demo accepts any OTP).</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={otpValue}
                  onChange={(e) => setOtpValue(e.target.value)}
                  placeholder="OTP"
                  className="px-3 py-2 border border-gray-300 rounded-lg flex-1"
                />
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700" onClick={() => {
                  const id = otpForId;
                  if (!id) return;
                  const completedItem = deliveries.find(d => d.id === id);
                  setDeliveries(prev => prev.map(d => d.id === id ? { ...d, status: 'Completed' } : d));
                  if (completedItem) {
                    setDeliveryHistory(prev => [{
                      id: completedItem.id,
                      type: completedItem.type,
                      ...(completedItem.type === 'delivery'
                        ? { recipient: completedItem.recipient }
                        : { sender: completedItem.sender }
                      ),
                      address: completedItem.address,
                      status: 'Completed',
                      date: new Date().toLocaleDateString(),
                      amount: completedItem.amount
                    }, ...prev]);
                  }
                  setOtpForId(null);
                  setOtpValue('');
                  if (selectedDelivery?.id === id) setSelectedDelivery(null);
                }}>Confirm</button>
                <button className="bg-gray-200 px-4 py-2 rounded-lg" onClick={() => { setOtpForId(null); setOtpValue(''); }}>Cancel</button>
              </div>
            </div>
          </div>
        )}
        {failForId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setFailForId(null)}>
            <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Fail Order</h3>
                <button onClick={() => setFailForId(null)} className="text-gray-500 hover:text-gray-800"><X size={20} /></button>
              </div>
              <p className="text-sm text-gray-600 mb-3">Provide a short reason why the pickup/delivery failed.</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={failReason}
                  onChange={(e) => setFailReason(e.target.value)}
                  placeholder="Reason for failure"
                  className="px-3 py-2 border border-gray-300 rounded-lg flex-1"
                />
                <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700" onClick={() => {
                  const id = failForId;
                  if (!id) return;
                  const failedItem = deliveries.find(d => d.id === id);
                  setDeliveries(prev => prev.map(d => d.id === id ? { ...d, status: 'Failed' } : d));
                  if (failedItem) {
                    setDeliveryHistory(prev => [{
                      id: failedItem.id,
                      type: failedItem.type,
                      ...(failedItem.type === 'delivery'
                        ? { recipient: failedItem.recipient }
                        : { sender: failedItem.sender }
                      ),
                      address: failedItem.address,
                      status: 'Failed',
                      reason: failReason || 'No reason provided',
                      date: new Date().toLocaleDateString(),
                      amount: failedItem.amount
                    }, ...prev]);
                  }
                  setFailForId(null);
                  setFailReason('');
                  if (selectedDelivery?.id === id) setSelectedDelivery(null);
                }}>Confirm</button>
                <button className="bg-gray-200 px-4 py-2 rounded-lg" onClick={() => { setFailForId(null); setFailReason(''); }}>Cancel</button>
              </div>
            </div>
          </div>
        )}
        {renderModule()}
      </div>
    </div>
  );
};

export default RiderDashboard;
