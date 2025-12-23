import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Plus, List, Menu, X, TrendingUp, Clock, CheckCircle, DollarSign, Calculator, MapPin, Navigation, Home } from 'lucide-react';

type Parcel = {
  id: string;
  customer: string;
  destination: string;
  status: 'In Transit' | 'Delivered' | 'Pickup Pending' | string;
  date: string;
  phone?: string;
};

type MenuItem = { id: string; label: string; icon: React.ComponentType<any> };

type AddParcelFormData = {
  customerName: string;
  phone: string;
  address: string;
  district: string;
  area: string;
  weight: string;
  category: string;
  cod: string;
  instructions: string;
};

type PriceMatrix = Record<string, { basePrice: number; perKg: number }>;

type TrackingStep = { step: string; completed: boolean };

// Interfaces
// interface Parcel {
//   id: string;
//   customer: string;
//   destination: string;
//   status: 'In Transit' | 'Delivered' | 'Pickup Pending';
//   date: string;
//   phone: string;
// }

// interface MenuItem {
//   id: string;
//   label: string;
//   icon: React.ComponentType<{ size?: number }>;
// }

// interface AddParcelFormData {
//   customerName: string;
//   phone: string;
//   address: string;
//   district: string;
//   area: string;
//   weight: string;
//   category: string;
//   cod: string;
//   instructions: string;
// }

// interface PriceMatrixEntry {
//   basePrice: number;
//   perKg: number;
// }

// interface PriceMatrix {
//   [key: string]: PriceMatrixEntry;
// }

// interface TrackingStep {
//   step: string;
//   completed: boolean;
// }

// interface CoverageArea {
//   district: string;
//   coverage: string;
//   areas: string;
// }

const MerchantDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [parcels, ] = useState<Parcel[]>([
    { id: 'PCL001', customer: 'John Doe', destination: 'Dhaka', status: 'In Transit', date: '2025-12-20', phone: '01712345678' },
    { id: 'PCL002', customer: 'Jane Smith', destination: 'Chattogram', status: 'Delivered', date: '2025-12-19', phone: '01812345678' },
    { id: 'PCL003', customer: 'Mike Johnson', destination: 'Sylhet', status: 'Pickup Pending', date: '2025-12-22', phone: '01912345678' },
    { id: 'PCL004', customer: 'Sarah Ahmed', destination: 'Khulna', status: 'In Transit', date: '2025-12-21', phone: '01612345678' },
    { id: 'PCL005', customer: 'Rahim Khan', destination: 'Rajshahi', status: 'Delivered', date: '2025-12-18', phone: '01512345678' }
  ]);
  const [parcelModal, setParcelModal] = useState<Parcel | null>(null);

  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'add-parcel', label: 'Add Parcel', icon: Plus },
    { id: 'consignments', label: 'Consignments', icon: List },
    { id: 'add-money', label: 'Add Money', icon: DollarSign },
    { id: 'pricing-calculator', label: 'Pricing Calculator', icon: Calculator },
    { id: 'track-parcel', label: 'Track Parcel', icon: Navigation },
    { id: 'coverage-map', label: 'Coverage Area', icon: MapPin }
  ];

  const DashboardModule = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Parcels</p>
              <p className="text-3xl font-bold text-gray-800">247</p>
            </div>
            <Package className="text-blue-500" size={40} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Delivered</p>
              <p className="text-3xl font-bold text-gray-800">189</p>
            </div>
            <CheckCircle className="text-green-500" size={40} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">In Transit</p>
              <p className="text-3xl font-bold text-gray-800">42</p>
            </div>
            <Clock className="text-yellow-500" size={40} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Balance</p>
              <p className="text-3xl font-bold text-gray-800">৳12,450</p>
            </div>
            <div className="text-purple-500 text-2xl font-bold">৳</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Recent Parcels</h3>
          <div className="space-y-3">
            {parcels.slice(0, 5).map(parcel => (
              <div key={parcel.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Package className="text-gray-400" size={20} />
                  <div>
                    <p className="font-medium text-gray-800">{parcel.id}</p>
                    <p className="text-sm text-gray-500">{parcel.customer}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    parcel.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                    parcel.status === 'In Transit' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {parcel.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setActiveModule('add-parcel')} className="p-6 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              <Plus className="text-blue-600 mb-2 mx-auto" size={32} />
              <p className="text-sm font-medium text-gray-700">Add New Parcel</p>
            </button>
            <button onClick={() => setActiveModule('consignments')} className="p-6 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
              <List className="text-green-600 mb-2 mx-auto" size={32} />
              <p className="text-sm font-medium text-gray-700">View Consignments</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const AddParcelModule: React.FC = () => {
    const [formData, setFormData] = useState<AddParcelFormData>({
      customerName: '',
      phone: '',
      address: '',
      district: '',
      area: '',
      weight: '',
      category: '',
      cod: '',
      instructions: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      console.log('Form submitted:', formData);
      alert('Parcel request submitted successfully!');
    };

    const handleReset = () => {
      setFormData({
        customerName: '',
        phone: '',
        address: '',
        district: '',
        area: '',
        weight: '',
        category: '',
        cod: '',
        instructions: ''
      });
    };

    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Parcel</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name *</label>
              <input 
                type="text" 
                required
                value={formData.customerName}
                onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                placeholder="Enter customer name" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
              <input 
                type="tel" 
                required
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                placeholder="01XXXXXXXXX" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Address *</label>
            <textarea 
              required
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              rows={3} 
              placeholder="Enter full delivery address"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">District *</label>
              <select 
                required
                value={formData.district}
                onChange={(e) => setFormData({...formData, district: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select District</option>
                <option value="Dhaka">Dhaka</option>
                <option value="Chattogram">Chattogram</option>
                <option value="Sylhet">Sylhet</option>
                <option value="Rajshahi">Rajshahi</option>
                <option value="Khulna">Khulna</option>
                <option value="Barishal">Barishal</option>
                <option value="Rangpur">Rangpur</option>
                <option value="Mymensingh">Mymensingh</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Area/Hub *</label>
              <select 
                required
                value={formData.area}
                onChange={(e) => setFormData({...formData, area: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Area</option>
                <option value="Gulshan">Gulshan</option>
                <option value="Dhanmondi">Dhanmondi</option>
                <option value="Mirpur">Mirpur</option>
                <option value="Uttara">Uttara</option>
                <option value="Banani">Banani</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg) *</label>
              <input 
                type="number" 
                required
                value={formData.weight}
                onChange={(e) => setFormData({...formData, weight: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                placeholder="0.5" 
                step="0.1" 
                min="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <select 
                required
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Category</option>
                <option value="Document">Document</option>
                <option value="Electronics">Electronics</option>
                <option value="Clothing">Clothing</option>
                <option value="Food">Food</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">COD Amount (৳)</label>
              <input 
                type="number" 
                value={formData.cod}
                onChange={(e) => setFormData({...formData, cod: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                placeholder="0" 
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Special Instructions</label>
            <textarea 
              value={formData.instructions}
              onChange={(e) => setFormData({...formData, instructions: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              rows={2} 
              placeholder="Any special handling instructions"
            ></textarea>
          </div>

          <div className="flex space-x-4">
            <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Submit Parcel Request
            </button>
            <button type="button" onClick={handleReset} className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              Reset
            </button>
          </div>
        </form>
      </div>
    );
  };

  const ConsignmentsModule: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('');

    const filteredParcels = parcels.filter((parcel) => {
      const matchesSearch = parcel.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           parcel.customer.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || parcel.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-800">All Consignments</h2>
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID or customer" 
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-64" 
            />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="Pickup Pending">Pickup Pending</option>
              <option value="In Transit">In Transit</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parcel ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredParcels.map(parcel => (
                <tr key={parcel.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{parcel.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{parcel.customer}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{parcel.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{parcel.destination}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{parcel.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      parcel.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                      parcel.status === 'In Transit' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {parcel.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button onClick={() => setParcelModal(parcel)} className="text-blue-600 hover:text-blue-900 font-medium">View Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredParcels.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No parcels found matching your criteria
            </div>
          )}
        </div>
      </div>
    );
  };

  const AddMoneyModule: React.FC = () => {
    const [amount, setAmount] = useState<string>('');
    const [paymentMethod, setPaymentMethod] = useState<string>('');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      console.log('Payment submitted:', { amount, paymentMethod });
      alert(`Payment of ৳${amount} via ${paymentMethod} submitted successfully!`);
      setAmount('');
      setPaymentMethod('');
    };

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Add Money to Account</h2>
          
          <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-200">
            <p className="text-sm text-blue-800">Current Balance: <span className="font-bold text-lg">৳12,450</span></p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount (৳) *</label>
              <input 
                type="number" 
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                placeholder="Enter amount" 
                min="100"
                step="100"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum amount: ৳100</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method *</label>
              <select 
                required
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Payment Method</option>
                <option value="bKash">bKash</option>
                <option value="Nagad">Nagad</option>
                <option value="Rocket">Rocket</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Credit Card">Credit Card</option>
              </select>
            </div>

            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Proceed to Payment
            </button>
          </form>
        </div>

        {/* Info Cards */}
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
            <h3 className="font-semibold text-gray-800 mb-2">Quick Top-up</h3>
            <div className="space-y-2">
              <button className="w-full py-2 px-4 bg-green-50 text-green-700 rounded hover:bg-green-100 text-sm font-medium">
                ৳500
              </button>
              <button className="w-full py-2 px-4 bg-green-50 text-green-700 rounded hover:bg-green-100 text-sm font-medium">
                ৳1,000
              </button>
              <button className="w-full py-2 px-4 bg-green-50 text-green-700 rounded hover:bg-green-100 text-sm font-medium">
                ৳5,000
              </button>
              <button className="w-full py-2 px-4 bg-green-50 text-green-700 rounded hover:bg-green-100 text-sm font-medium">
                ৳10,000
              </button>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="font-semibold text-gray-800 mb-3">Recent Transactions</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Top-up</span>
                <span className="text-green-600 font-medium">+৳5,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Parcel Charges</span>
                <span className="text-red-600 font-medium">-৳1,250</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Withdrawal</span>
                <span className="text-red-600 font-medium">-৳3,500</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const PricingCalculatorModule: React.FC = () => {
    const [weight, setWeight] = useState<string>('');
    const [district, setDistrict] = useState<string>('');
    const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);

    const priceMatrix: PriceMatrix = {
      'Dhaka': { basePrice: 60, perKg: 10 },
      'Chattogram': { basePrice: 80, perKg: 12 },
      'Sylhet': { basePrice: 100, perKg: 15 },
      'Rajshahi': { basePrice: 90, perKg: 14 },
      'Khulna': { basePrice: 95, perKg: 13 },
      'Barishal': { basePrice: 120, perKg: 16 },
      'Rangpur': { basePrice: 110, perKg: 15 },
      'Mymensingh': { basePrice: 85, perKg: 12 }
    };

    const calculatePrice = (w: string, d: string) => {
      if (w && d && priceMatrix[d]) {
        const { basePrice, perKg } = priceMatrix[d];
        const totalPrice = basePrice + (parseFloat(w) * perKg);
        setCalculatedPrice(totalPrice);
      }
    };

    const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const w = e.target.value;
      setWeight(w);
      calculatePrice(w, district);
    };

    const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const d = e.target.value;
      setDistrict(d);
      calculatePrice(weight, d);
    };

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calculator */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Pricing Calculator</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg) *</label>
              <input 
                type="number" 
                value={weight}
                onChange={handleWeightChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                placeholder="Enter weight" 
                step="0.1"
                min="0.1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Destination District *</label>
              <select 
                value={district}
                onChange={handleDistrictChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select District</option>
                <option value="Dhaka">Dhaka</option>
                <option value="Chattogram">Chattogram</option>
                <option value="Sylhet">Sylhet</option>
                <option value="Rajshahi">Rajshahi</option>
                <option value="Khulna">Khulna</option>
                <option value="Barishal">Barishal</option>
                <option value="Rangpur">Rangpur</option>
                <option value="Mymensingh">Mymensingh</option>
              </select>
            </div>

            {calculatedPrice !== null && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-gray-600 text-sm mb-1">Estimated Delivery Charge:</p>
                <p className="text-3xl font-bold text-green-600">৳{calculatedPrice.toFixed(2)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Price Table */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Price Matrix</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">District</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Base Price</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Per kg</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {Object.entries(priceMatrix).map(([dist, prices]) => (
                  <tr key={dist} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-700">{dist}</td>
                    <td className="px-4 py-2 text-gray-600">৳{prices.basePrice}</td>
                    <td className="px-4 py-2 text-gray-600">৳{prices.perKg}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const TrackParcelModule: React.FC = () => {
    const [trackingId, setTrackingId] = useState<string>('');
    const [trackedParcel, setTrackedParcel] = useState<Parcel | null>(null);

    const handleTrack = (e: React.FormEvent) => {
      e.preventDefault();
      const found = parcels.find((p) => p.id.toLowerCase() === trackingId.toLowerCase());
      setTrackedParcel(found || null);
    };

    const trackingSteps: Record<string, TrackingStep[]> = {
      'Pickup Pending': [
        { step: 'Order Placed', completed: true },
        { step: 'Pickup Scheduled', completed: false },
        { step: 'In Transit', completed: false },
        { step: 'Delivered', completed: false }
      ],
      'In Transit': [
        { step: 'Order Placed', completed: true },
        { step: 'Picked Up', completed: true },
        { step: 'In Transit', completed: true },
        { step: 'Delivered', completed: false }
      ],
      'Delivered': [
        { step: 'Order Placed', completed: true },
        { step: 'Picked Up', completed: true },
        { step: 'In Transit', completed: true },
        { step: 'Delivered', completed: true }
      ]
    };

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Track Your Parcel</h2>
          
          <form onSubmit={handleTrack} className="flex gap-2 mb-6">
            <input 
              type="text" 
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value)}
              placeholder="Enter Parcel ID (e.g., PCL001)" 
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            />
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              Track
            </button>
          </form>

          {trackedParcel ? (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Parcel ID</p>
                    <p className="font-bold text-gray-800">{trackedParcel.id}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Customer</p>
                    <p className="font-bold text-gray-800">{trackedParcel.customer}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Destination</p>
                    <p className="font-bold text-gray-800">{trackedParcel.destination}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Date</p>
                    <p className="font-bold text-gray-800">{trackedParcel.date}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Delivery Progress</h3>
                <div className="space-y-4">
                  {trackingSteps[trackedParcel.status]?.map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        item.completed ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                      }`}>
                        {item.completed ? '✓' : index + 1}
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${item.completed ? 'text-green-600' : 'text-gray-600'}`}>
                          {item.step}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : trackingId ? (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-center">
              <p className="text-red-700 font-medium">Parcel not found. Please check the ID and try again.</p>
            </div>
          ) : null}
        </div>

        {/* Sample Parcels */}
        {!trackedParcel && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Sample Parcel IDs to Track</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {parcels.map(parcel => (
                <button
                  key={parcel.id}
                  onClick={() => {
                    setTrackingId(parcel.id);
                    setTrackedParcel(parcel);
                  }}
                  className="p-3 bg-gray-50 hover:bg-blue-50 rounded border border-gray-200 text-sm font-medium text-gray-700 transition-colors"
                >
                  {parcel.id}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const CoverageAreaModule: React.FC = () => {
    const coverageAreas: { district: string; coverage: string; areas: string }[] = [
      { district: 'Dhaka', coverage: '95%', areas: 'Gulshan, Dhanmondi, Mirpur, Uttara, Banani, Kallyanpur, Motijheel' },
      { district: 'Chattogram', coverage: '88%', areas: 'Halishahar, Nasirabad, GEC, Agrabad, Bayazid' },
      { district: 'Sylhet', coverage: '75%', areas: 'Zindabazar, Ambarkhana, Chouhatta, Kazipur' },
      { district: 'Rajshahi', coverage: '70%', areas: 'Motihar, Paharpur, New Market, Laxmipur' },
      { district: 'Khulna', coverage: '72%', areas: 'Khulna City, Daulatapur, Fulbari' },
      { district: 'Barishal', coverage: '65%', areas: 'Barishal City, Gournadi, Bakerganj' },
      { district: 'Rangpur', coverage: '68%', areas: 'Rangpur City, Cantonment, Motihar' },
      { district: 'Mymensingh', coverage: '70%', areas: 'Mymensingh City, Fulbaria, Shambhunath' }
    ];

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Coverage Area Map</h2>
          <p className="text-gray-600 mb-6">We provide delivery services across major cities in Bangladesh</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {coverageAreas.map((area, index) => (
              <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800">{area.district}</h3>
                  <span className="text-sm font-bold text-white bg-green-500 px-3 py-1 rounded-full">
                    {area.coverage}
                  </span>
                </div>
                
                <div className="mb-3">
                  <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-green-500 h-full transition-all"
                      style={{ width: area.coverage }}
                    ></div>
                  </div>
                </div>

                <p className="text-sm text-gray-600">
                  <span className="font-medium">Coverage Areas:</span> {area.areas}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Expanding Regions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="font-semibold text-yellow-900 mb-2">Coming Soon:</p>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Cox's Bazar</li>
                <li>• Nuwakhali</li>
                <li>• Feni</li>
              </ul>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="font-semibold text-blue-900 mb-2">International Routes:</p>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Dubai (UAE)</li>
                <li>• New York (USA)</li>
                <li>• London (UK)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderModule = () => {
    switch(activeModule) {
      case 'dashboard': return <DashboardModule />;
      case 'add-parcel': return <AddParcelModule />;
      case 'consignments': return <ConsignmentsModule />;
      case 'add-money': return <AddMoneyModule />;
      case 'pricing-calculator': return <PricingCalculatorModule />;
      case 'track-parcel': return <TrackParcelModule />;
      case 'coverage-map': return <CoverageAreaModule />;
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
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeModule === item.id ? 'bg-green-800' : 'hover:bg-green-500'
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
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <span className="font-bold">M</span>
            </div>
            {sidebarOpen && (
              <div>
                <p className="font-medium">Merchant Name</p>
                <p className="text-xs text-green-200">merchant@email.com</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        {renderModule()}

        {/* Parcel Details Modal */}
        {parcelModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setParcelModal(null)}>
            <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Parcel Details — {parcelModal.id}</h3>
                <button onClick={() => setParcelModal(null)} className="text-gray-500 hover:text-gray-800"><X size={20} /></button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Parcel ID</p>
                  <p className="text-lg font-semibold text-gray-800">{parcelModal.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Customer</p>
                  <p className="text-lg font-semibold text-gray-800">{parcelModal.customer}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Destination</p>
                  <p className="text-lg font-semibold text-gray-800">{parcelModal.destination}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="text-lg font-semibold text-gray-800">{parcelModal.phone ?? '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="text-lg font-semibold text-gray-800">{parcelModal.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="text-lg font-semibold text-gray-800">{parcelModal.date}</p>
                </div>
              </div>

              <div className="mt-4">
                <button onClick={() => setParcelModal(null)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MerchantDashboard;