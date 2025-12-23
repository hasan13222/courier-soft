import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  ShieldCheck,
  Settings,
  FileText,
  Home,
  Menu,
  X,
  TrendingUp,
  Search,
  Activity,
  ArrowUpDown,
  Download,
  Trash2,
  Plus,
} from "lucide-react";

type User = { id: string; name: string; email: string; role: string; status: string; lastLogin?: string };
type Role = { id: string; name: string; permissions: string[] };
type LogEntry = { at: string; level: "info" | "warn" | "error"; message: string };
type Report = { id: string; name: string; date: string; summary: string };

const now = () => new Date().toLocaleString();

// Local entities
type HubManager = { id: string; name: string; hub: string; phone?: string; status: string };
type Rider = { id: string; name: string; area: string; phone?: string; status: string };
type Merchant = { id: string; name: string; shopName: string; phone?: string; status: string };
type Hub = { id: string; name: string; location: string; capacity: number };

const StatCard: React.FC<{ title: string; value: string | number; delta?: string; icon?: React.ReactNode }> = ({ title, value, delta, icon }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between">
    <div>
      <div className="text-xs text-gray-500">{title}</div>
      <div className="text-2xl font-semibold text-gray-800">{value}</div>
      {delta && <div className="text-xs text-green-600 mt-1">{delta}</div>}
    </div>
    <div className="text-green-600 w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">{icon}</div>
  </div>
);

const Sparkline: React.FC<{ points: number[] }> = ({ points }) => {
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const width = 100;
  const height = 28;
  const step = width / Math.max(points.length - 1, 1);
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"} ${i * step} ${height - ((p - min) / (max - min || 1)) * height}`).join(" ");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="opacity-80">
      <path d={d} fill="none" stroke="#10b981" strokeWidth={2} strokeOpacity={0.9} />
    </svg>
  );
};

const ConfirmModal: React.FC<{ open: boolean; title?: string; message?: string; onConfirm: () => void; onClose: () => void }> = ({ open, title = "Confirm", message, onConfirm, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-gray-600 mt-2">{message}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X size={18} /></button>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 rounded border">Cancel</button>
          <button onClick={() => { onConfirm(); onClose(); }} className="px-3 py-2 rounded bg-red-600 text-white flex items-center gap-2">
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [activeModule, setActiveModule] = useState<string>("overview");

  // Mock data
  const [users] = useState<User[]>([
    { id: "U001", name: "Alice Khan", email: "alice@example.com", role: "Admin", status: "Active", lastLogin: now() },
    { id: "U002", name: "Bilal Ahmed", email: "bilal@example.com", role: "Manager", status: "Active", lastLogin: now() },
    { id: "U003", name: "Clara Roy", email: "clara@example.com", role: "Support", status: "Suspended", lastLogin: now() },
  ]);

  const [roles] = useState<Role[]>([
    { id: "R1", name: "Admin", permissions: ["all"] },
    { id: "R2", name: "Manager", permissions: ["view", "edit"] },
    { id: "R3", name: "Support", permissions: ["view"] },
  ]);

  const [logs] = useState<LogEntry[]>([
    { at: now(), level: "info", message: "System started" },
    { at: now(), level: "warn", message: "Disk usage 78%" },
    { at: now(), level: "error", message: "Failed job: invoice-generator" },
  ]);

  const [reports] = useState<Report[]>([
    { id: "REP1", name: "Daily Summary", date: new Date().toLocaleDateString(), summary: "Orders: 120, Revenue: ৳15,000" },
  ]);

  // Entities: hub-managers, riders, merchants, hubs
  const [hubManagers, setHubManagers] = useState<HubManager[]>([
    { id: 'HM001', name: 'Rafiq Ahmed', hub: 'Dhaka Central', phone: '01711111111', status: 'Active' },
    { id: 'HM002', name: 'Nazma Begum', hub: 'Mirpur Hub', phone: '01722222222', status: 'Active' },
    { id: 'HM003', name: 'Sadia', hub: 'Uttara Hub', phone: '01733333333', status: 'Active' },
  ]);

  const [ridersList, setRidersList] = useState<Rider[]>([
    { id: 'RD001', name: 'Kamal', area: 'Gulshan', phone: '01811111111', status: 'Available' },
    { id: 'RD002', name: 'Siam', area: 'Banani', phone: '01822222222', status: 'On Delivery' },
    { id: 'RD003', name: 'Jamil', area: 'Dhanmondi', phone: '01833333333', status: 'Available' },
  ]);

  const [merchants, setMerchants] = useState<Merchant[]>([
    { id: 'M001', name: 'ABC Stores', shopName: 'ABC', phone: '01911111111', status: 'Verified' },
    { id: 'M002', name: 'FreshMart', shopName: 'FreshMart', phone: '01922222222', status: 'Pending' },
  ]);

  const [hubs, setHubs] = useState<Hub[]>([
    { id: 'H001', name: 'Dhaka Central', location: 'Dhaka', capacity: 5000 },
    { id: 'H002', name: 'Mirpur Hub', location: 'Mirpur', capacity: 2500 },
  ]);

  const [userModal, setUserModal] = useState<any | null>(null);
  const [logLevelFilter, setLogLevelFilter] = useState<string>("");

  const menuItems = [
    { id: "overview", label: "Overview", icon: TrendingUp },
    { id: "management", label: "Management", icon: Users },
    { id: "roles", label: "Roles", icon: ShieldCheck },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "logs", label: "System Logs", icon: Activity },
    { id: "reports", label: "Reports", icon: FileText },
  ];

  // --- Overview Module
  const OverviewModule: React.FC = () => {
    const stats = useMemo(() => ({
      totalUsers: users.length,
      roles: roles.length,
      recentLogs: logs.length,
      hubsCount: hubs.length,
    }), [users, roles, logs, hubs]);

    // small sparkline data mock
    const ordersTrend = useMemo(() => [12, 18, 14, 21, 26, 22, 29], []);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Admin Overview</h2>
            <p className="text-sm text-gray-500 mt-1">Summary of system activity and health</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setActiveModule("reports")} className="px-3 py-2 rounded border bg-white flex items-center gap-2">
              <Download size={16} /> Export Report
            </button>
            <button onClick={() => setActiveModule("management")} className="px-3 py-2 rounded bg-green-600 text-white flex items-center gap-2">
              <Plus size={14} /> New Entity
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="Total Users" value={stats.totalUsers} delta="+6% MoM" icon={<Users size={18} />} />
          <StatCard title="Roles" value={stats.roles} delta="+0" icon={<ShieldCheck size={18} />} />
          <StatCard title="Recent Logs" value={stats.recentLogs} delta="—" icon={<Activity size={18} />} />
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-500">Orders (7d)</div>
                <div className="text-lg font-semibold text-gray-800">29</div>
              </div>
              <Sparkline points={ordersTrend} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-800">Recent Activity</h3>
            <div className="mt-3 space-y-2 max-h-48 overflow-auto">
              {logs.slice(0, 6).map((l, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                  <div>
                    <div className="text-xs text-gray-500">{l.at}</div>
                    <div className="text-sm text-gray-800">{l.message}</div>
                  </div>
                  <div className="text-xs text-gray-400">{l.level.toUpperCase()}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-800">Quick Actions</h3>
            <div className="mt-3 flex flex-col gap-2">
              <button className="px-3 py-2 rounded border text-left">Manage Users</button>
              <button className="px-3 py-2 rounded border text-left">Configure Roles</button>
              <button className="px-3 py-2 rounded border text-left">View System Logs</button>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-800">Reports</h3>
            <div className="mt-3 flex flex-col gap-2">
              {reports.map(r => (
                <div key={r.id} className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                  <div>
                    <div className="text-sm font-medium">{r.name}</div>
                    <div className="text-xs text-gray-500">{r.date}</div>
                  </div>
                  <button className="px-2 py-1 border rounded text-sm" onClick={() => console.log("Export", r.id)}>Export</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- Management Module (enhanced)
  const ManagementModule: React.FC = () => {
    const tabs = [
      { id: 'hub-managers', label: 'Hub Managers' },
      { id: 'riders', label: 'Riders' },
      { id: 'merchants', label: 'Merchants' },
      { id: 'hubs', label: 'Hubs' },
    ];
    const [activeTab, setActiveTab] = useState<string>('hub-managers');
    const [localSearch, setLocalSearch] = useState<string>('');
    const [sortKey, setSortKey] = useState<string>('name');
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [confirmOpen, setConfirmOpen] = useState<boolean>(false);

    const itemsPerPageOptions = [5, 10, 20];
    const [itemsPerPage, setItemsPerPage] = useState<number>(10);
    const [page, setPage] = useState<number>(1);

    useEffect(() => { setPage(1); setSelectedIds([]); }, [activeTab, localSearch, itemsPerPage]);

    const dataForTab = useMemo(() => {
      switch (activeTab) {
        case 'hub-managers': return hubManagers.map(h => ({ ...h, _type: 'hub-managers' }));
        case 'riders': return ridersList.map(r => ({ ...r, _type: 'riders' }));
        case 'merchants': return merchants.map(m => ({ ...m, _type: 'merchants' }));
        case 'hubs': return hubs.map(h => ({ ...h, _type: 'hubs' }));
        default: return [];
      }
    }, [activeTab, hubManagers, ridersList, merchants, hubs]);

    const filtered = useMemo(() => {
      const s = localSearch.trim().toLowerCase();
      return dataForTab.filter((it: any) => {
        if (!s) return true;
        return Object.values(it).some(v => String(v).toLowerCase().includes(s));
      }).sort((a: any, b: any) => {
        const aVal = String(a[sortKey] ?? "").toLowerCase();
        const bVal = String(b[sortKey] ?? "").toLowerCase();
        if (aVal === bVal) return 0;
        if (sortDir === "asc") return aVal > bVal ? 1 : -1;
        return aVal < bVal ? 1 : -1;
      });
    }, [dataForTab, localSearch, sortKey, sortDir]);

    const paginated = useMemo(() => {
      const start = (page - 1) * itemsPerPage;
      return filtered.slice(start, start + itemsPerPage);
    }, [filtered, page, itemsPerPage]);

    const toggleSelect = (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    const selectAllVisible = () => {
      const ids = paginated.map((p: any) => p.id);
      const allSelected = ids.every((id) => selectedIds.includes(id));
      if (allSelected) setSelectedIds(prev => prev.filter(id => !ids.includes(id)));
      else setSelectedIds(prev => Array.from(new Set([...prev, ...ids])));
    };

    const deleteSelected = () => {
      // apply deletion based on tab
      if (selectedIds.length === 0) return;
      if (activeTab === 'hub-managers') setHubManagers(prev => prev.filter(x => !selectedIds.includes(x.id)));
      if (activeTab === 'riders') setRidersList(prev => prev.filter(x => !selectedIds.includes(x.id)));
      if (activeTab === 'merchants') setMerchants(prev => prev.filter(x => !selectedIds.includes(x.id)));
      if (activeTab === 'hubs') setHubs(prev => prev.filter(x => !selectedIds.includes(x.id)));
      setSelectedIds([]);
    };

    const exportCSV = (rows: any[]) => {
      if (!rows.length) return;
      const keys = Object.keys(rows[0]).filter(k => !k.startsWith("_"));
      const csv = [keys.join(",")].concat(rows.map(r => keys.map(k => `"${String((r as any)[k] ?? "").replace(/"/g, '""')}"`).join(","))).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${activeTab}-${new Date().toISOString()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    };

    const visibleCount = filtered.length;
    const totalPages = Math.max(1, Math.ceil(visibleCount / itemsPerPage));

    return (
      <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Management</h2>
            <p className="text-sm text-gray-500">Manage hub managers, riders, merchants and hubs</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-gray-50 rounded px-3 py-1 gap-2">
              <Search size={16} />
              <input value={localSearch} onChange={(e) => setLocalSearch(e.target.value)} placeholder="Search across fields..." className="bg-transparent outline-none text-sm" />
            </div>

            <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))} className="px-2 py-1 border rounded">
              {itemsPerPageOptions.map(o => <option key={o} value={o}>{o}/page</option>)}
            </select>

            <button onClick={() => exportCSV(filtered)} className="px-3 py-2 rounded border flex items-center gap-2">
              <Download size={14} /> Export
            </button>

            <button onClick={() => setConfirmOpen(true)} disabled={selectedIds.length === 0} className={`px-3 py-2 rounded ${selectedIds.length ? "bg-red-600 text-white" : "opacity-50"}`}>
              <Trash2 size={14} /> Delete ({selectedIds.length})
            </button>
          </div>
        </div>

        <div className="mb-2 flex gap-2">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`px-3 py-2 rounded ${activeTab === t.id ? "bg-green-600 text-white" : "bg-gray-100"}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-sm text-gray-600"><input type="checkbox" onChange={selectAllVisible} checked={paginated.every((p: any) => selectedIds.includes(p.id)) && paginated.length > 0} /></th>
                  <th className="px-3 py-2 text-left text-sm text-gray-600">ID</th>
                  <th className="px-3 py-2 text-left text-sm text-gray-600 cursor-pointer" onClick={() => { setSortKey('name'); setSortDir(sortDir === "asc" ? "desc" : "asc"); }}>
                    <div className="flex items-center gap-2">Name <ArrowUpDown size={14} /></div>
                  </th>
                  <th className="px-3 py-2 text-left text-sm text-gray-600">Meta</th>
                  <th className="px-3 py-2 text-left text-sm text-gray-600">Status</th>
                  <th className="px-3 py-2 text-left text-sm text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y">
                {paginated.map((row: any) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-sm"><input type="checkbox" checked={selectedIds.includes(row.id)} onChange={() => toggleSelect(row.id)} /></td>
                    <td className="px-3 py-2 text-sm font-medium text-gray-800">{row.id}</td>
                    <td className="px-3 py-2 text-sm text-gray-700">{row.name}</td>
                    <td className="px-3 py-2 text-sm text-gray-700">
                      {activeTab === 'hub-managers' && <div>{row.hub}</div>}
                      {activeTab === 'riders' && <div>{row.area}</div>}
                      {activeTab === 'merchants' && <div>{row.shopName}</div>}
                      {activeTab === 'hubs' && <div>{row.location} • Cap: {row.capacity}</div>}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-700">{row.status}</td>
                    <td className="px-3 py-2 text-sm">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setUserModal(row)} className="text-blue-600">View</button>
                        <button onClick={() => {
                          // single remove
                          if (activeTab === 'hub-managers') setHubManagers(prev => prev.filter(x => x.id !== row.id));
                          if (activeTab === 'riders') setRidersList(prev => prev.filter(x => x.id !== row.id));
                          if (activeTab === 'merchants') setMerchants(prev => prev.filter(x => x.id !== row.id));
                          if (activeTab === 'hubs') setHubs(prev => prev.filter(x => x.id !== row.id));
                        }} className="text-red-600">Remove</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="text-sm text-gray-600">Showing {paginated.length} of {visibleCount} items</div>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} className="px-2 py-1 border rounded">Prev</button>
              <div className="px-3 py-1 border rounded">{page} / {totalPages}</div>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="px-2 py-1 border rounded">Next</button>
            </div>
          </div>
        </div>

        <ConfirmModal open={confirmOpen} title="Delete selected" message={`Delete ${selectedIds.length} selected item(s)? This action cannot be undone.`} onConfirm={() => deleteSelected()} onClose={() => setConfirmOpen(false)} />
      </div>
    );
  };

  const UsersModule: React.FC = () => {
    // For compatibility we still expose users list but route "Users" shows Management by default
    return <ManagementModule />;
  };

  const RolesModule: React.FC = () => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Roles & Permissions</h2>
      <div className="space-y-3">
        {roles.map((r) => (
          <div key={r.id} className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-800">{r.name}</div>
              <div className="text-sm text-gray-600">{r.permissions.join(", ")}</div>
            </div>
            <div>
              <button className="px-3 py-1 border rounded">Edit</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const SettingsModule: React.FC = () => {
    const [maintenance, setMaintenance] = useState<boolean>(false);
    const [inviteOnly, setInviteOnly] = useState<boolean>(false);
    return (
      <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">System Settings</h2>
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <div className="font-medium text-gray-800">Maintenance Mode</div>
            <div className="text-sm text-gray-600">Disable access for non-admins</div>
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={maintenance} onChange={() => setMaintenance((s) => !s)} />
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <div className="font-medium text-gray-800">Invite Only</div>
            <div className="text-sm text-gray-600">Only invited users can register</div>
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={inviteOnly} onChange={() => setInviteOnly((s) => !s)} />
          </label>
        </div>
      </div>
    );
  };

  const LogsModule: React.FC = () => {
    const filteredLogs = logs.filter((l) => !logLevelFilter || l.level === logLevelFilter);
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">System Logs</h2>
          <select value={logLevelFilter} onChange={(e) => setLogLevelFilter(e.target.value)} className="px-3 py-2 border rounded">
            <option value="">All</option>
            <option value="info">Info</option>
            <option value="warn">Warn</option>
            <option value="error">Error</option>
          </select>
        </div>
        <div className="space-y-2 max-h-80 overflow-auto">
          {filteredLogs.map((l, idx) => (
            <div key={idx} className="p-3 bg-gray-50 rounded border">
              <div className="text-xs text-gray-500">{l.at} • {l.level.toUpperCase()}</div>
              <div className="text-sm text-gray-800">{l.message}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const ReportsModule: React.FC = () => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Reports</h2>
      <div className="space-y-3">
        {reports.map((r) => (
          <div key={r.id} className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-800">{r.name}</div>
              <div className="text-sm text-gray-600">{r.date} • {r.summary}</div>
            </div>
            <div>
              <button className="px-3 py-1 border rounded mr-2" onClick={() => console.log("Export", r.id)}>Export</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderModule = () => {
    switch (activeModule) {
      case "overview": return <OverviewModule />;
      case "users": return <UsersModule />;
      case "management": return <ManagementModule />;
      case "roles": return <RolesModule />;
      case "settings": return <SettingsModule />;
      case "logs": return <LogsModule />;
      case "reports": return <ReportsModule />;
      default: return <OverviewModule />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className={`${sidebarOpen ? "w-64" : "w-20"} bg-linear-to-b from-green-600 to-green-700 text-white transition-all duration-300 flex flex-col`}>
        <div className="p-4 flex items-center justify-between border-b border-green-500">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/")} className="p-2 hover:bg-green-500 rounded-lg transition-colors" title="Back to Home">
              <Home size={20} />
            </button>
            {sidebarOpen && <h1 className="text-xl font-bold">Admin</h1>}
          </div>
          <button onClick={() => setSidebarOpen((s) => !s)} className="p-2 hover:bg-green-500 rounded-lg transition-colors">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveModule(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeModule === item.id ? "bg-green-800" : "hover:bg-green-500"}`}
              >
                <Icon size={20} />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-green-500">
          <div className="flex items-center space-x-3 px-4">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">A</div>
            {sidebarOpen && (
              <div>
                <p className="font-medium">Admin</p>
                <p className="text-xs text-green-200">Superuser</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-6">
        {renderModule()}

        {/* User modal */}
        {userModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setUserModal(null)}>
            <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Details — {userModal.name}</h3>
                <button onClick={() => setUserModal(null)} className="text-gray-500 hover:text-gray-800"><X size={20} /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">ID</p>
                  <p className="text-lg font-semibold text-gray-800">{userModal.id}</p>
                  <p className="text-sm text-gray-600 mt-2">Contact</p>
                  <p className="text-lg font-semibold text-gray-800">{userModal.phone ?? userModal.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="text-lg font-semibold text-gray-800">{userModal.status}</p>
                  <p className="text-sm text-gray-600 mt-2">Meta</p>
                  <p className="text-sm text-gray-600">{JSON.stringify(userModal)}</p>
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => setUserModal(null)} className="px-4 py-2 border rounded">Close</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;