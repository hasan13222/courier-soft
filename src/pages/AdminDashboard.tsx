
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
  MapPin,
  Package,
  Wallet,
  Banknote,
  Bell,
  Truck,
  Layers,
  ClipboardList,
} from "lucide-react";

type User = {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Manager" | "Support";
  status: "Active" | "Suspended";
  lastLogin?: string;
};

type Role = { id: string; name: string; permissions: string[] };
type LogEntry = { at: string; level: "info" | "warn" | "error"; message: string };
type Report = { id: string; name: string; date: string; summary: string };

type Hub = {
  id: string;
  name: string;
  location: string;
  district: string;
  type: "district" | "area";
  parentHubId?: string | null; // for area hubs under district hubs
  capacity: number;
  coverageAreas: string[];
  status: "Active" | "Inactive";
};

type HubManager = { id: string; name: string; hubId: string; phone?: string; status: "Active" | "Suspended" };
type Rider = { id: string; name: string; hubId: string; area: string; phone?: string; status: "Available" | "On Delivery" | "Suspended" };
type Merchant = { id: string; name: string; shopName: string; phone?: string; status: "Verified" | "Pending" | "Suspended" };

type ParcelStatus =
  | "Requested"
  | "Picked Up"
  | "At Area Hub"
  | "In Transit"
  | "At District Hub"
  | "Out for Delivery"
  | "Delivered"
  | "Returned"
  | "On Hold"
  | "Disputed";

type ParcelEvent = { at: string; hubId?: string; label: string; note?: string };
type Parcel = {
  id: string;
  merchantId: string;
  customerName: string;
  customerPhone: string;
  originHubId: string;
  destinationHubId: string;
  originDistrict: string;
  destinationDistrict: string;
  weightKg: number;
  distanceKm: number;
  codAmount: number;
  serviceType: "Regular" | "Express";
  status: ParcelStatus;
  assignedRiderId?: string;
  createdAt: string;
  journey: ParcelEvent[];
};

type Dispute = {
  id: string;
  parcelId: string;
  openedAt: string;
  status: "Open" | "Resolved";
  issue: string;
  resolution?: string;
};

type PricingConfig = {
  baseFare: number; // base
  perKg: number; // weight-based
  perKm: number; // distance-based
  codPct: number; // COD %
  serviceAreaSurcharge: number; // flat surcharge
  expressMultiplier: number; // multiplier
};

type TransactionType = "Merchant Wallet" | "COD Settlement" | "Rider Payment" | "Commission";
type Transaction = {
  id: string;
  type: TransactionType;
  refId: string; // merchantId/riderId/parcelId etc
  amount: number;
  direction: "credit" | "debit";
  at: string;
  note: string;
};

const now = () => new Date().toLocaleString();

const moneyBDT = (n: number) => `৳${n.toLocaleString()}`;

const StatCard: React.FC<{
  title: string;
  value: string | number;
  delta?: string;
  icon?: React.ReactNode;
}> = ({ title, value, delta, icon }) => (
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
  const width = 120;
  const height = 28;
  const step = width / Math.max(points.length - 1, 1);
  const d = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${i * step} ${height - ((p - min) / (max - min || 1)) * height}`)
    .join(" ");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="opacity-80">
      <path d={d} fill="none" stroke="#10b981" strokeWidth={2} strokeOpacity={0.9} />
    </svg>
  );
};

const ConfirmModal: React.FC<{
  open: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  tone?: "danger" | "primary";
  onConfirm: () => void;
  onClose: () => void;
}> = ({ open, title = "Confirm", message, confirmText = "Confirm", tone = "danger", onConfirm, onClose }) => {
  if (!open) return null;
  const btnClass =
    tone === "danger"
      ? "bg-red-600 text-white"
      : "bg-green-600 text-white";
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            {message && <p className="text-sm text-gray-600 mt-2">{message}</p>}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X size={18} />
          </button>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 rounded border">
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-3 py-2 rounded ${btnClass} flex items-center gap-2`}
          >
            {tone === "danger" ? <Trash2 size={14} /> : <ShieldCheck size={14} />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

const Pill: React.FC<{ children: React.ReactNode; tone?: "gray" | "green" | "yellow" | "red" | "blue" }> = ({
  children,
  tone = "gray",
}) => {
  const cls =
    tone === "green"
      ? "bg-green-50 text-green-700 border-green-200"
      : tone === "yellow"
      ? "bg-yellow-50 text-yellow-700 border-yellow-200"
      : tone === "red"
      ? "bg-red-50 text-red-700 border-red-200"
      : tone === "blue"
      ? "bg-blue-50 text-blue-700 border-blue-200"
      : "bg-gray-50 text-gray-700 border-gray-200";
  return <span className={`inline-flex items-center px-2 py-0.5 text-xs border rounded ${cls}`}>{children}</span>;
};

const exportCSV = (filenameBase: string, rows: any[]) => {
  if (!rows.length) return;
  const keys = Object.keys(rows[0]).filter((k) => !k.startsWith("_"));
  const csv = [keys.join(",")]
    .concat(
      rows.map((r) =>
        keys
          .map((k) => `"${String((r as any)[k] ?? "").replace(/"/g, '""')}"`)
          .join(",")
      )
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filenameBase}-${new Date().toISOString()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  // new modules
  type ModuleId =
    | "overview"
    | "user-management"
    | "hub-management"
    | "parcel-management"
    | "pricing-settings"
    | "reports-analytics"
    | "financial-management"
    | "system-settings";

  const [activeModule, setActiveModule] = useState<ModuleId>("overview");

  // Core mock: users/roles/logs/reports
  const [users, setUsers] = useState<User[]>([
    { id: "U001", name: "Alice Khan", email: "alice@example.com", role: "Admin", status: "Active", lastLogin: now() },
    { id: "U002", name: "Bilal Ahmed", email: "bilal@example.com", role: "Manager", status: "Active", lastLogin: now() },
    { id: "U003", name: "Clara Roy", email: "clara@example.com", role: "Support", status: "Suspended", lastLogin: now() },
  ]);

  const [roles] = useState<Role[]>([
    { id: "R1", name: "Admin", permissions: ["all"] },
    { id: "R2", name: "Manager", permissions: ["view", "edit"] },
    { id: "R3", name: "Support", permissions: ["view"] },
  ]);

  const [logs, setLogs] = useState<LogEntry[]>([
    { at: now(), level: "info", message: "System started" },
    { at: now(), level: "warn", message: "Disk usage 78%" },
    { at: now(), level: "error", message: "Failed job: invoice-generator" },
  ]);

  const [reports, ] = useState<Report[]>([
    { id: "REP1", name: "Daily Summary", date: new Date().toLocaleDateString(), summary: "Parcels: 120, Revenue: ৳15,000" },
    { id: "REP2", name: "Hub Efficiency", date: new Date().toLocaleDateString(), summary: "Avg transfer time: 6.2h" },
  ]);

  // Entities
  const [hubs, setHubs] = useState<Hub[]>([
    {
      id: "H001",
      name: "Dhaka District Hub",
      location: "Dhaka",
      district: "Dhaka",
      type: "district",
      parentHubId: null,
      capacity: 8000,
      coverageAreas: ["Gulshan", "Banani", "Dhanmondi", "Mirpur", "Uttara"],
      status: "Active",
    },
    {
      id: "H002",
      name: "Mirpur Area Hub",
      location: "Mirpur",
      district: "Dhaka",
      type: "area",
      parentHubId: "H001",
      capacity: 2500,
      coverageAreas: ["Mirpur-1", "Mirpur-2", "Pallabi"],
      status: "Active",
    },
    {
      id: "H003",
      name: "Chattogram District Hub",
      location: "Chattogram",
      district: "Chattogram",
      type: "district",
      parentHubId: null,
      capacity: 6000,
      coverageAreas: ["Pahartali", "Agrabad", "Halishahar"],
      status: "Active",
    },
  ]);

  const [hubManagers, setHubManagers] = useState<HubManager[]>([
    { id: "HM001", name: "Rafiq Ahmed", hubId: "H001", phone: "01711111111", status: "Active" },
    { id: "HM002", name: "Nazma Begum", hubId: "H002", phone: "01722222222", status: "Active" },
    { id: "HM003", name: "Sadia", hubId: "H003", phone: "01733333333", status: "Active" },
  ]);

  const [ridersList, setRidersList] = useState<Rider[]>([
    { id: "RD001", name: "Kamal", hubId: "H002", area: "Mirpur-1", phone: "01811111111", status: "Available" },
    { id: "RD002", name: "Siam", hubId: "H001", area: "Banani", phone: "01822222222", status: "On Delivery" },
    { id: "RD003", name: "Jamil", hubId: "H001", area: "Dhanmondi", phone: "01833333333", status: "Available" },
  ]);

  const [merchants, setMerchants] = useState<Merchant[]>([
    { id: "M001", name: "ABC Stores", shopName: "ABC", phone: "01911111111", status: "Verified" },
    { id: "M002", name: "FreshMart", shopName: "FreshMart", phone: "01922222222", status: "Pending" },
    { id: "M003", name: "UrbanCart", shopName: "UrbanCart", phone: "01933333333", status: "Suspended" },
  ]);

  const [pricing, setPricing] = useState<PricingConfig>({
    baseFare: 60,
    perKg: 15,
    perKm: 2,
    codPct: 1.0,
    serviceAreaSurcharge: 20,
    expressMultiplier: 1.4,
  });

  const [serviceTypes, setServiceTypes] = useState<string[]>(["Regular", "Express"]);
  const [coverageAreas, setCoverageAreas] = useState<string[]>([
    "Gulshan",
    "Banani",
    "Dhanmondi",
    "Mirpur",
    "Uttara",
    "Chattogram - Agrabad",
  ]);

  const [parcels, setParcels] = useState<Parcel[]>([
    {
      id: "PCL001",
      merchantId: "M001",
      customerName: "Arif Hasan",
      customerPhone: "01610000001",
      originHubId: "H002",
      destinationHubId: "H003",
      originDistrict: "Dhaka",
      destinationDistrict: "Chattogram",
      weightKg: 1.2,
      distanceKm: 260,
      codAmount: 850,
      serviceType: "Regular",
      status: "In Transit",
      assignedRiderId: "RD002",
      createdAt: now(),
      journey: [
        { at: now(), hubId: "H002", label: "Requested", note: "Merchant request created" },
        { at: now(), hubId: "H002", label: "Picked Up", note: "Picked up from merchant" },
        { at: now(), hubId: "H002", label: "At Area Hub", note: "Received at area hub" },
        { at: now(), hubId: "H001", label: "At District Hub", note: "Transferred to district hub" },
        { at: now(), label: "In Transit", note: "On route to destination district" },
      ],
    },
    {
      id: "PCL002",
      merchantId: "M002",
      customerName: "Nusrat Jahan",
      customerPhone: "01610000002",
      originHubId: "H001",
      destinationHubId: "H002",
      originDistrict: "Dhaka",
      destinationDistrict: "Dhaka",
      weightKg: 0.6,
      distanceKm: 12,
      codAmount: 0,
      serviceType: "Express",
      status: "Out for Delivery",
      assignedRiderId: "RD001",
      createdAt: now(),
      journey: [
        { at: now(), hubId: "H001", label: "Requested" },
        { at: now(), hubId: "H001", label: "Picked Up" },
        { at: now(), hubId: "H001", label: "At District Hub" },
        { at: now(), hubId: "H002", label: "At Area Hub" },
        { at: now(), hubId: "H002", label: "Out for Delivery" },
      ],
    },
    {
      id: "PCL003",
      merchantId: "M001",
      customerName: "Sabbir Rahman",
      customerPhone: "01610000003",
      originHubId: "H003",
      destinationHubId: "H001",
      originDistrict: "Chattogram",
      destinationDistrict: "Dhaka",
      weightKg: 3.4,
      distanceKm: 260,
      codAmount: 2200,
      serviceType: "Regular",
      status: "Disputed",
      createdAt: now(),
      journey: [
        { at: now(), hubId: "H003", label: "Requested" },
        { at: now(), hubId: "H003", label: "Picked Up" },
        { at: now(), label: "Disputed", note: "Customer claims package damaged" },
      ],
    },
  ]);

  const [disputes, setDisputes] = useState<Dispute[]>([
    { id: "DSP001", parcelId: "PCL003", openedAt: now(), status: "Open", issue: "Damaged package reported by customer" },
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: "TX001", type: "Merchant Wallet", refId: "M001", amount: 15000, direction: "credit", at: now(), note: "Wallet top-up" },
    { id: "TX002", type: "COD Settlement", refId: "PCL001", amount: 850, direction: "credit", at: now(), note: "COD collected and settled" },
    { id: "TX003", type: "Rider Payment", refId: "RD002", amount: 1200, direction: "credit", at: now(), note: "Weekly rider payout" },
    { id: "TX004", type: "Commission", refId: "PCL001", amount: 45, direction: "credit", at: now(), note: "Platform commission" },
  ]);

  // shared UI state
  const [detailModal, setDetailModal] = useState<any | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    message: string;
    confirmText?: string;
    tone?: "danger" | "primary";
    onConfirm: () => void;
  } | null>(null);

  const openConfirm = (cfg: {
    title: string;
    message: string;
    confirmText?: string;
    tone?: "danger" | "primary";
    onConfirm: () => void;
  }) => {
    setConfirmConfig(cfg);
    setConfirmOpen(true);
  };

  const hubNameById = useMemo(() => {
    const m = new Map(hubs.map((h) => [h.id, h.name]));
    return (id?: string) => (id ? m.get(id) ?? id : "—");
  }, [hubs]);

  const merchantNameById = useMemo(() => {
    const m = new Map(merchants.map((mm) => [mm.id, mm.name]));
    return (id: string) => m.get(id) ?? id;
  }, [merchants]);

  const riderNameById = useMemo(() => {
    const m = new Map(ridersList.map((r) => [r.id, r.name]));
    return (id?: string) => (id ? m.get(id) ?? id : "—");
  }, [ridersList]);

  const estimateParcelFare = (p: Parcel) => {
    const base = pricing.baseFare;
    const weight = p.weightKg * pricing.perKg;
    const dist = p.distanceKm * pricing.perKm;
    const cod = p.codAmount > 0 ? (p.codAmount * pricing.codPct) / 100 : 0;
    const area = pricing.serviceAreaSurcharge;
    const subtotal = base + weight + dist + cod + area;
    return p.serviceType === "Express" ? subtotal * pricing.expressMultiplier : subtotal;
  };

  // Sidebar menu (new)
  const menuItems: { id: ModuleId; label: string; icon: any }[] = [
    { id: "overview", label: "Dashboard", icon: TrendingUp },
    { id: "user-management", label: "User Management", icon: Users },
    { id: "hub-management", label: "Hub Management", icon: Layers },
    { id: "parcel-management", label: "Parcel Management", icon: Package },
    { id: "pricing-settings", label: "Pricing & Settings", icon: Banknote },
    { id: "reports-analytics", label: "Reports & Analytics", icon: FileText },
    { id: "financial-management", label: "Financial", icon: Wallet },
    { id: "system-settings", label: "System Settings", icon: Settings },
  ];

  // ---------------------------
  // 1) Dashboard / Overview
  // ---------------------------
  const OverviewModule: React.FC = () => {
    const kpis = useMemo(() => {
      const totalParcels = parcels.length;
      const delivered = parcels.filter((p) => p.status === "Delivered").length;
      const activeUsers = users.filter((u) => u.status === "Active").length + ridersList.filter((r) => r.status !== "Suspended").length;
      const revenue = parcels.reduce((acc, p) => acc + estimateParcelFare(p), 0);
      const disputesOpen = disputes.filter((d) => d.status === "Open").length;

      const hubActive = hubs.filter((h) => h.status === "Active").length;
      return { totalParcels, delivered, activeUsers, revenue, disputesOpen, hubActive };
    }, [parcels, users, ridersList, disputes, hubs]);

    const perf = useMemo(() => {
      // static-style system-wide “performance metrics”
      const avgTransferHrs = 6.2;
      const onTimePct = 93.4;
      const riderUtil = 71.5;
      return { avgTransferHrs, onTimePct, riderUtil };
    }, []);

    const trend = useMemo(() => [18, 22, 19, 26, 31, 28, 35], []);

    const recentActivities = useMemo(() => {
      const a: { at: string; msg: string; tone?: "green" | "yellow" | "red" | "blue" }[] = [];
      parcels.slice(0, 5).forEach((p) => a.push({ at: p.createdAt, msg: `Parcel ${p.id} • ${p.status} • ${merchantNameById(p.merchantId)}`, tone: "blue" }));
      disputes.slice(0, 5).forEach((d) => a.push({ at: d.openedAt, msg: `Dispute ${d.id} opened for ${d.parcelId}`, tone: "red" }));
      logs.slice(0, 5).forEach((l) => a.push({ at: l.at, msg: `System: ${l.message}`, tone: l.level === "error" ? "red" : l.level === "warn" ? "yellow" : "green" }));
      return a.slice(0, 10);
    }, [parcels, disputes, logs, merchantNameById]);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
            <p className="text-sm text-gray-500 mt-1">Real-time overview across all hubs</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveModule("reports-analytics")}
              className="px-3 py-2 rounded border bg-white flex items-center gap-2"
            >
              <Download size={16} /> Export (CSV)
            </button>
            <button
              onClick={() => setActiveModule("parcel-management")}
              className="px-3 py-2 rounded bg-green-600 text-white flex items-center gap-2"
            >
              <ClipboardList size={14} /> View Parcels
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="Total Parcels" value={kpis.totalParcels} delta={`Delivered: ${kpis.delivered}`} icon={<Package size={18} />} />
          <StatCard title="Revenue (est.)" value={moneyBDT(Math.round(kpis.revenue))} delta="+4.8% WoW" icon={<Banknote size={18} />} />
          <StatCard title="Active Users" value={kpis.activeUsers} delta="System-wide" icon={<Users size={18} />} />
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-500">Parcel Volume (7d)</div>
                <div className="text-lg font-semibold text-gray-800">{trend[trend.length - 1]}</div>
              </div>
              <Sparkline points={trend} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Activity size={16} /> System Performance
            </h3>
            <div className="mt-3 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Avg hub transfer time</span>
                <span className="font-semibold">{perf.avgTransferHrs}h</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">On-time delivery</span>
                <span className="font-semibold">{perf.onTimePct}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Rider utilization</span>
                <span className="font-semibold">{perf.riderUtil}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Active hubs</span>
                <span className="font-semibold">{kpis.hubActive}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Open disputes</span>
                <span className="font-semibold">{kpis.disputesOpen}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Bell size={16} /> Recent Activities (All Hubs)
            </h3>
            <div className="mt-3 space-y-2 max-h-56 overflow-auto">
              {recentActivities.map((a, i) => (
                <div key={i} className="flex items-start justify-between p-2 rounded hover:bg-gray-50">
                  <div className="pr-3">
                    <div className="text-xs text-gray-500">{a.at}</div>
                    <div className="text-sm text-gray-800">{a.msg}</div>
                  </div>
                  <Pill tone={a.tone}>{a.tone?.toUpperCase() ?? "INFO"}</Pill>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-800">Quick Actions</h3>
            <div className="mt-3 flex flex-col gap-2">
              <button onClick={() => setActiveModule("user-management")} className="px-3 py-2 rounded border text-left">
                Manage Users
              </button>
              <button onClick={() => setActiveModule("hub-management")} className="px-3 py-2 rounded border text-left">
                Manage Hubs & Coverage
              </button>
              <button onClick={() => setActiveModule("pricing-settings")} className="px-3 py-2 rounded border text-left">
                Update Pricing Rules
              </button>
              <button
                onClick={() => {
                  setLogs((prev) => [{ at: now(), level: "info", message: "Admin triggered system health check" }, ...prev]);
                }}
                className="px-3 py-2 rounded border text-left"
              >
                Run Health Check (static)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --------------------------------
  // Shared Table helper (static UI)
  // --------------------------------
  const TableShell: React.FC<{
    title: string;
    subtitle?: string;
    left?: React.ReactNode;
    right?: React.ReactNode;
    children: React.ReactNode;
  }> = ({ title, subtitle, left, right, children }) => (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          {left}
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">{right}</div>
      </div>
      {children}
    </div>
  );

  // ---------------------------
  // 2) User Management
  // ---------------------------
  const UserManagementModule: React.FC = () => {
    type Tab = "merchants" | "hubManagers" | "riders" | "admins";
    const tabs: { id: Tab; label: string }[] = [
      { id: "merchants", label: "Merchants" },
      { id: "hubManagers", label: "Hub Managers" },
      { id: "riders", label: "Riders" },
      { id: "admins", label: "Admin Users" },
    ];

    const [activeTab, setActiveTab] = useState<Tab>("merchants");
    const [q, setQ] = useState("");
    const [sortKey, setSortKey] = useState("name");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [page, setPage] = useState(1);

    useEffect(() => {
      setSelectedIds([]);
      setPage(1);
    }, [activeTab, q, itemsPerPage]);

    const rows = useMemo(() => {
      if (activeTab === "merchants") return merchants.map((m) => ({ ...m, _type: "merchant" }));
      if (activeTab === "hubManagers") return hubManagers.map((hm) => ({ ...hm, hub: hubNameById(hm.hubId), _type: "hubManager" }));
      if (activeTab === "riders") return ridersList.map((r) => ({ ...r, hub: hubNameById(r.hubId), _type: "rider" }));
      return users.map((u) => ({ ...u, _type: "adminUser" }));
    }, [activeTab, merchants, hubManagers, ridersList, users, hubNameById]);

    const filtered = useMemo(() => {
      const s = q.trim().toLowerCase();
      return rows
        .filter((it: any) => {
          if (!s) return true;
          return Object.values(it).some((v) => String(v).toLowerCase().includes(s));
        })
        .sort((a: any, b: any) => {
          const aVal = String(a[sortKey] ?? "").toLowerCase();
          const bVal = String(b[sortKey] ?? "").toLowerCase();
          if (aVal === bVal) return 0;
          return sortDir === "asc" ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
        });
    }, [rows, q, sortKey, sortDir]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
    const paginated = useMemo(() => {
      const start = (page - 1) * itemsPerPage;
      return filtered.slice(start, start + itemsPerPage);
    }, [filtered, page, itemsPerPage]);

    const toggleSelect = (id: string) =>
      setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

    const selectAllVisible = () => {
      const ids = paginated.map((p: any) => p.id);
      const allSelected = ids.every((id) => selectedIds.includes(id));
      if (allSelected) setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)));
      else setSelectedIds((prev) => Array.from(new Set([...prev, ...ids])));
    };

    const statusTone = (s: string) => {
      const x = s.toLowerCase();
      if (x.includes("verified") || x.includes("active") || x.includes("available")) return "green";
      if (x.includes("pending") || x.includes("on delivery")) return "yellow";
      if (x.includes("suspend")) return "red";
      return "gray";
    };

    const bulkSuspend = () => {
      if (!selectedIds.length) return;
      if (activeTab === "merchants") setMerchants((prev) => prev.map((m) => (selectedIds.includes(m.id) ? { ...m, status: "Suspended" } : m)));
      if (activeTab === "hubManagers") setHubManagers((prev) => prev.map((m) => (selectedIds.includes(m.id) ? { ...m, status: "Suspended" } : m)));
      if (activeTab === "riders") setRidersList((prev) => prev.map((r) => (selectedIds.includes(r.id) ? { ...r, status: "Suspended" } : r)));
      if (activeTab === "admins") setUsers((prev) => prev.map((u) => (selectedIds.includes(u.id) ? { ...u, status: "Suspended" } : u)));
      setLogs((prev) => [{ at: now(), level: "warn", message: `Bulk suspend (${activeTab}): ${selectedIds.join(", ")}` }, ...prev]);
      setSelectedIds([]);
    };

    const bulkApprove = () => {
      if (!selectedIds.length) return;
      if (activeTab === "merchants")
        setMerchants((prev) => prev.map((m) => (selectedIds.includes(m.id) ? { ...m, status: "Verified" } : m)));
      setLogs((prev) => [{ at: now(), level: "info", message: `Bulk approve merchants: ${selectedIds.join(", ")}` }, ...prev]);
      setSelectedIds([]);
    };

    const removeSelected = () => {
      if (!selectedIds.length) return;
      if (activeTab === "merchants") setMerchants((prev) => prev.filter((m) => !selectedIds.includes(m.id)));
      if (activeTab === "hubManagers") setHubManagers((prev) => prev.filter((m) => !selectedIds.includes(m.id)));
      if (activeTab === "riders") setRidersList((prev) => prev.filter((r) => !selectedIds.includes(r.id)));
      if (activeTab === "admins") setUsers((prev) => prev.filter((u) => !selectedIds.includes(u.id)));
      setLogs((prev) => [{ at: now(), level: "warn", message: `Bulk delete (${activeTab}): ${selectedIds.join(", ")}` }, ...prev]);
      setSelectedIds([]);
    };

    const addDummy = () => {
      if (activeTab === "merchants") {
        const id = `M${String(merchants.length + 1).padStart(3, "0")}`;
        setMerchants((prev) => [{ id, name: `New Merchant ${id}`, shopName: `Shop ${id}`, phone: "01900000000", status: "Pending" }, ...prev]);
      }
      if (activeTab === "hubManagers") {
        const id = `HM${String(hubManagers.length + 1).padStart(3, "0")}`;
        setHubManagers((prev) => [{ id, name: `New Manager ${id}`, hubId: hubs[0]?.id ?? "H001", phone: "01700000000", status: "Active" }, ...prev]);
      }
      if (activeTab === "riders") {
        const id = `RD${String(ridersList.length + 1).padStart(3, "0")}`;
        setRidersList((prev) => [{ id, name: `New Rider ${id}`, hubId: hubs[0]?.id ?? "H001", area: "New Area", phone: "01800000000", status: "Available" }, ...prev]);
      }
      if (activeTab === "admins") {
        const id = `U${String(users.length + 1).padStart(3, "0")}`;
        setUsers((prev) => [{ id, name: `New Admin ${id}`, email: `new${id.toLowerCase()}@example.com`, role: "Support", status: "Active", lastLogin: now() }, ...prev]);
      }
      setLogs((prev) => [{ at: now(), level: "info", message: `Created new entity in ${activeTab}` }, ...prev]);
    };

    return (
      <TableShell
        title="User Management"
        subtitle="Approve, suspend, view details, and control roles/permissions (static)"
        right={
          <>
            <div className="flex items-center bg-gray-50 rounded px-3 py-2 gap-2">
              <Search size={16} />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search..."
                className="bg-transparent outline-none text-sm w-48"
              />
            </div>

            <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))} className="px-2 py-2 border rounded">
              {[5, 10, 20].map((o) => (
                <option key={o} value={o}>
                  {o}/page
                </option>
              ))}
            </select>

            <button onClick={() => exportCSV(`user-management-${activeTab}`, filtered)} className="px-3 py-2 rounded border flex items-center gap-2">
              <Download size={14} /> Export
            </button>

            <button onClick={addDummy} className="px-3 py-2 rounded bg-green-600 text-white flex items-center gap-2">
              <Plus size={14} /> Add
            </button>

            {activeTab === "merchants" && (
              <button
                onClick={() =>
                  openConfirm({
                    title: "Approve selected merchants",
                    message: `Approve ${selectedIds.length} merchant(s)?`,
                    confirmText: "Approve",
                    tone: "primary",
                    onConfirm: bulkApprove,
                  })
                }
                disabled={selectedIds.length === 0}
                className={`px-3 py-2 rounded border flex items-center gap-2 ${selectedIds.length ? "" : "opacity-50"}`}
              >
                <ShieldCheck size={14} /> Approve ({selectedIds.length})
              </button>
            )}

            <button
              onClick={() =>
                openConfirm({
                  title: "Suspend selected",
                  message: `Suspend ${selectedIds.length} selected item(s)?`,
                  confirmText: "Suspend",
                  tone: "primary",
                  onConfirm: bulkSuspend,
                })
              }
              disabled={selectedIds.length === 0}
              className={`px-3 py-2 rounded border flex items-center gap-2 ${selectedIds.length ? "" : "opacity-50"}`}
            >
              <ShieldCheck size={14} /> Suspend ({selectedIds.length})
            </button>

            <button
              onClick={() =>
                openConfirm({
                  title: "Delete selected",
                  message: `Delete ${selectedIds.length} selected item(s)? This cannot be undone.`,
                  confirmText: "Delete",
                  tone: "danger",
                  onConfirm: removeSelected,
                })
              }
              disabled={selectedIds.length === 0}
              className={`px-3 py-2 rounded bg-red-600 text-white flex items-center gap-2 ${selectedIds.length ? "" : "opacity-50"}`}
            >
              <Trash2 size={14} /> Delete ({selectedIds.length})
            </button>
          </>
        }
      >
        <div className="flex gap-2 flex-wrap">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3 py-2 rounded ${activeTab === t.id ? "bg-green-600 text-white" : "bg-gray-100"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-sm text-gray-600">
                  <input
                    type="checkbox"
                    onChange={selectAllVisible}
                    checked={paginated.every((p: any) => selectedIds.includes(p.id)) && paginated.length > 0}
                  />
                </th>
                <th className="px-3 py-2 text-left text-sm text-gray-600">ID</th>
                <th
                  className="px-3 py-2 text-left text-sm text-gray-600 cursor-pointer"
                  onClick={() => {
                    setSortKey("name");
                    setSortDir(sortDir === "asc" ? "desc" : "asc");
                  }}
                >
                  <div className="flex items-center gap-2">
                    Name <ArrowUpDown size={14} />
                  </div>
                </th>
                <th className="px-3 py-2 text-left text-sm text-gray-600">Meta</th>
                <th className="px-3 py-2 text-left text-sm text-gray-600">Status</th>
                <th className="px-3 py-2 text-left text-sm text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y">
              {paginated.map((row: any) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 text-sm">
                    <input type="checkbox" checked={selectedIds.includes(row.id)} onChange={() => toggleSelect(row.id)} />
                  </td>
                  <td className="px-3 py-2 text-sm font-medium text-gray-800">{row.id}</td>
                  <td className="px-3 py-2 text-sm text-gray-700">{row.name}</td>
                  <td className="px-3 py-2 text-sm text-gray-700">
                    {activeTab === "merchants" && (
                      <div className="space-y-1">
                        <div className="text-xs text-gray-500">Shop</div>
                        <div>{row.shopName}</div>
                        <div className="text-xs text-gray-500">Phone</div>
                        <div>{row.phone ?? "—"}</div>
                      </div>
                    )}
                    {activeTab === "hubManagers" && (
                      <div className="space-y-1">
                        <div className="text-xs text-gray-500">Hub</div>
                        <div>{row.hub}</div>
                        <div className="text-xs text-gray-500">Phone</div>
                        <div>{row.phone ?? "—"}</div>
                      </div>
                    )}
                    {activeTab === "riders" && (
                      <div className="space-y-1">
                        <div className="text-xs text-gray-500">Hub</div>
                        <div>{row.hub}</div>
                        <div className="text-xs text-gray-500">Area</div>
                        <div>{row.area}</div>
                      </div>
                    )}
                    {activeTab === "admins" && (
                      <div className="space-y-1">
                        <div className="text-xs text-gray-500">Email</div>
                        <div>{row.email}</div>
                        <div className="text-xs text-gray-500">Role</div>
                        <div>{row.role}</div>
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-700">
                    <Pill tone={statusTone(row.status)}>{row.status}</Pill>
                  </td>
                  <td className="px-3 py-2 text-sm">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setDetailModal({ type: activeTab, row })} className="text-blue-600">
                        View
                      </button>
                      <button
                        onClick={() => {
                          // static: quick toggle active/suspended
                          if (activeTab === "merchants")
                            setMerchants((prev) =>
                              prev.map((m) => (m.id === row.id ? { ...m, status: m.status === "Suspended" ? "Pending" : "Suspended" } : m))
                            );
                          if (activeTab === "hubManagers")
                            setHubManagers((prev) =>
                              prev.map((m) => (m.id === row.id ? { ...m, status: m.status === "Suspended" ? "Active" : "Suspended" } : m))
                            );
                          if (activeTab === "riders")
                            setRidersList((prev) =>
                              prev.map((r) => (r.id === row.id ? { ...r, status: r.status === "Suspended" ? "Available" : "Suspended" } : r))
                            );
                          if (activeTab === "admins")
                            setUsers((prev) =>
                              prev.map((u) => (u.id === row.id ? { ...u, status: u.status === "Suspended" ? "Active" : "Suspended" } : u))
                            );
                          setLogs((prev) => [{ at: now(), level: "info", message: `Toggled status (${activeTab}) for ${row.id}` }, ...prev]);
                        }}
                        className="text-green-700"
                      >
                        Toggle Status
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-sm text-gray-500">
                    No results.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {paginated.length} of {filtered.length} items
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-2 py-1 border rounded">
              Prev
            </button>
            <div className="px-3 py-1 border rounded">
              {page} / {totalPages}
            </div>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="px-2 py-1 border rounded">
              Next
            </button>
          </div>
        </div>

        <div className="bg-gray-50 rounded p-4 border">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-gray-800 flex items-center gap-2">
                <ShieldCheck size={16} /> Role & Permission Control (static)
              </div>
              <div className="text-sm text-gray-600 mt-1">Roles: {roles.map((r) => r.name).join(", ")}</div>
            </div>
            <button onClick={() => setDetailModal({ type: "roles", row: roles })} className="px-3 py-2 border rounded">
              View Roles
            </button>
          </div>
        </div>
      </TableShell>
    );
  };

  // ---------------------------
  // 3) Hub Management
  // ---------------------------
  const HubManagementModule: React.FC = () => {
    type Tab = "hubs" | "coverage" | "analytics";
    const [tab, setTab] = useState<Tab>("hubs");
    const [q, setQ] = useState("");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [page, setPage] = useState(1);

    useEffect(() => {
      setSelectedIds([]);
      setPage(1);
    }, [tab, q, itemsPerPage]);

    const rows = useMemo(() => {
      return hubs.map((h) => ({
        ...h,
        parentHub: h.parentHubId ? hubNameById(h.parentHubId) : "—",
        managers: hubManagers.filter((m) => m.hubId === h.id).map((m) => m.name).join(", ") || "—",
        riders: ridersList.filter((r) => r.hubId === h.id).length,
      }));
    }, [hubs, hubManagers, ridersList, hubNameById]);

    const filtered = useMemo(() => {
      const s = q.trim().toLowerCase();
      return rows.filter((r: any) => {
        if (!s) return true;
        return Object.values(r).some((v) => String(v).toLowerCase().includes(s));
      });
    }, [rows, q]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
    const paginated = useMemo(() => {
      const start = (page - 1) * itemsPerPage;
      return filtered.slice(start, start + itemsPerPage);
    }, [filtered, page, itemsPerPage]);

    const toggleSelect = (id: string) =>
      setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

    const selectAllVisible = () => {
      const ids = paginated.map((p: any) => p.id);
      const allSelected = ids.every((id) => selectedIds.includes(id));
      if (allSelected) setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)));
      else setSelectedIds((prev) => Array.from(new Set([...prev, ...ids])));
    };

    const deleteSelected = () => {
      if (!selectedIds.length) return;
      setHubs((prev) => prev.filter((h) => !selectedIds.includes(h.id)));
      setHubManagers((prev) => prev.filter((hm) => !selectedIds.includes(hm.hubId))); // static: remove assigned manager rows
      setLogs((prev) => [{ at: now(), level: "warn", message: `Deleted hubs: ${selectedIds.join(", ")}` }, ...prev]);
      setSelectedIds([]);
    };

    const addHub = () => {
      const id = `H${String(hubs.length + 1).padStart(3, "0")}`;
      const districtHub = hubs.find((h) => h.type === "district");
      setHubs((prev) => [
        {
          id,
          name: `New Area Hub ${id}`,
          location: "New Location",
          district: districtHub?.district ?? "Dhaka",
          type: "area",
          parentHubId: districtHub?.id ?? null,
          capacity: 2000,
          coverageAreas: ["New Area-1", "New Area-2"],
          status: "Active",
        },
        ...prev,
      ]);
      setLogs((prev) => [{ at: now(), level: "info", message: `Created hub ${id}` }, ...prev]);
    };

    const setManagerForHub = (hubId: string) => {
      const id = `HM${String(hubManagers.length + 1).padStart(3, "0")}`;
      setHubManagers((prev) => [{ id, name: `Assigned Manager ${id}`, hubId, phone: "01700000000", status: "Active" }, ...prev]);
      setLogs((prev) => [{ at: now(), level: "info", message: `Assigned manager ${id} to hub ${hubId}` }, ...prev]);
    };

    const hubKpis = useMemo(() => {
      // static analytics
      const active = hubs.filter((h) => h.status === "Active").length;
      const districtHubs = hubs.filter((h) => h.type === "district").length;
      const areaHubs = hubs.filter((h) => h.type === "area").length;
      const avgCapacity = hubs.length ? Math.round(hubs.reduce((a, h) => a + h.capacity, 0) / hubs.length) : 0;
      return { active, districtHubs, areaHubs, avgCapacity };
    }, [hubs]);

    return (
      <TableShell
        title="Hub Management"
        subtitle="Create/edit/delete hubs, hierarchy (district/area), assign managers, define coverage, view analytics (static)"
        right={
          <>
            <div className="flex items-center bg-gray-50 rounded px-3 py-2 gap-2">
              <Search size={16} />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search hubs..." className="bg-transparent outline-none text-sm w-48" />
            </div>

            <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))} className="px-2 py-2 border rounded">
              {[5, 10, 20].map((o) => (
                <option key={o} value={o}>
                  {o}/page
                </option>
              ))}
            </select>

            <button onClick={() => exportCSV("hubs", rows)} className="px-3 py-2 rounded border flex items-center gap-2">
              <Download size={14} /> Export
            </button>

            <button onClick={addHub} className="px-3 py-2 rounded bg-green-600 text-white flex items-center gap-2">
              <Plus size={14} /> Add Hub
            </button>

            <button
              onClick={() =>
                openConfirm({
                  title: "Delete hubs",
                  message: `Delete ${selectedIds.length} hub(s)?`,
                  confirmText: "Delete",
                  tone: "danger",
                  onConfirm: deleteSelected,
                })
              }
              disabled={selectedIds.length === 0}
              className={`px-3 py-2 rounded bg-red-600 text-white flex items-center gap-2 ${selectedIds.length ? "" : "opacity-50"}`}
            >
              <Trash2 size={14} /> Delete ({selectedIds.length})
            </button>
          </>
        }
      >
        <div className="flex gap-2 flex-wrap">
          {([
            { id: "hubs", label: "Hubs" },
            { id: "coverage", label: "Coverage Areas" },
            { id: "analytics", label: "Analytics" },
          ] as { id: Tab; label: string }[]).map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`px-3 py-2 rounded ${tab === t.id ? "bg-green-600 text-white" : "bg-gray-100"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === "analytics" && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard title="Active Hubs" value={hubKpis.active} icon={<Layers size={18} />} />
            <StatCard title="District Hubs" value={hubKpis.districtHubs} icon={<MapPin size={18} />} />
            <StatCard title="Area Hubs" value={hubKpis.areaHubs} icon={<MapPin size={18} />} />
            <StatCard title="Avg Capacity" value={hubKpis.avgCapacity} icon={<TrendingUp size={18} />} />
          </div>
        )}

        {tab === "coverage" && (
          <div className="bg-gray-50 border rounded p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-800">Coverage Area Management (static)</div>
                <div className="text-sm text-gray-600 mt-1">Used for serviceable areas, pricing zones, and rider assignment.</div>
              </div>
              <button
                onClick={() => {
                  const next = `New Area ${coverageAreas.length + 1}`;
                  setCoverageAreas((prev) => [next, ...prev]);
                  setLogs((prev) => [{ at: now(), level: "info", message: `Added coverage area: ${next}` }, ...prev]);
                }}
                className="px-3 py-2 rounded bg-green-600 text-white flex items-center gap-2"
              >
                <Plus size={14} /> Add Area
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
              {coverageAreas.map((a) => (
                <div key={a} className="flex items-center justify-between bg-white p-3 rounded border">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} />
                    <span className="text-sm">{a}</span>
                  </div>
                  <button
                    onClick={() => {
                      setCoverageAreas((prev) => prev.filter((x) => x !== a));
                      setLogs((prev) => [{ at: now(), level: "warn", message: `Removed coverage area: ${a}` }, ...prev]);
                    }}
                    className="text-red-600 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "hubs" && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-sm text-gray-600">
                      <input type="checkbox" onChange={selectAllVisible} checked={paginated.every((p: any) => selectedIds.includes(p.id)) && paginated.length > 0} />
                    </th>
                    <th className="px-3 py-2 text-left text-sm text-gray-600">Hub</th>
                    <th className="px-3 py-2 text-left text-sm text-gray-600">District / Type</th>
                    <th className="px-3 py-2 text-left text-sm text-gray-600">Hierarchy</th>
                    <th className="px-3 py-2 text-left text-sm text-gray-600">Manager</th>
                    <th className="px-3 py-2 text-left text-sm text-gray-600">Coverage</th>
                    <th className="px-3 py-2 text-left text-sm text-gray-600">Status</th>
                    <th className="px-3 py-2 text-left text-sm text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y">
                  {paginated.map((h: any) => (
                    <tr key={h.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2">
                        <input type="checkbox" checked={selectedIds.includes(h.id)} onChange={() => toggleSelect(h.id)} />
                      </td>
                      <td className="px-3 py-2">
                        <div className="font-semibold text-gray-800">{h.name}</div>
                        <div className="text-xs text-gray-500">{h.id} • {h.location}</div>
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-700">
                        <div>{h.district}</div>
                        <Pill tone={h.type === "district" ? "blue" : "gray"}>{h.type.toUpperCase()}</Pill>
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-700">
                        <div className="text-xs text-gray-500">Parent</div>
                        <div>{h.parentHub}</div>
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-700">{h.managers}</td>
                      <td className="px-3 py-2 text-sm text-gray-700">
                        <div className="text-xs text-gray-500">{h.coverageAreas.length} area(s)</div>
                        <div className="line-clamp-2">{h.coverageAreas.join(", ")}</div>
                      </td>
                      <td className="px-3 py-2 text-sm">
                        <Pill tone={h.status === "Active" ? "green" : "red"}>{h.status}</Pill>
                      </td>
                      <td className="px-3 py-2 text-sm">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setDetailModal({ type: "hub", row: h })} className="text-blue-600">View</button>
                          <button onClick={() => setManagerForHub(h.id)} className="text-green-700">Assign Manager</button>
                          <button
                            onClick={() => {
                              setHubs((prev) => prev.map((x) => (x.id === h.id ? { ...x, status: x.status === "Active" ? "Inactive" : "Active" } : x)));
                              setLogs((prev) => [{ at: now(), level: "info", message: `Toggled hub status for ${h.id}` }, ...prev]);
                            }}
                            className="text-gray-700"
                          >
                            Toggle Status
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paginated.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-3 py-8 text-center text-sm text-gray-500">
                        No hubs found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="text-sm text-gray-600">Showing {paginated.length} of {filtered.length} hubs</div>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-2 py-1 border rounded">Prev</button>
                <div className="px-3 py-1 border rounded">{page} / {totalPages}</div>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="px-2 py-1 border rounded">Next</button>
              </div>
            </div>
          </>
        )}
      </TableShell>
    );
  };

  // ---------------------------
  // 4) Parcel Management
  // ---------------------------
  const ParcelManagementModule: React.FC = () => {
    const [q, setQ] = useState("");
    const [status, setStatus] = useState<ParcelStatus | "">("");
    const [district, setDistrict] = useState<string>("");
    const [hubId, setHubId] = useState<string>("");
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [page, setPage] = useState(1);

    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    useEffect(() => {
      setSelectedIds([]);
      setPage(1);
    }, [q, status, district, hubId, itemsPerPage]);

    const rows = useMemo(() => {
      return parcels.map((p) => ({
        ...p,
        merchant: merchantNameById(p.merchantId),
        originHub: hubNameById(p.originHubId),
        destinationHub: hubNameById(p.destinationHubId),
        rider: riderNameById(p.assignedRiderId),
        estFare: Math.round(estimateParcelFare(p)),
      }));
    }, [parcels, merchantNameById, hubNameById, riderNameById]);

    const filtered = useMemo(() => {
      const s = q.trim().toLowerCase();
      return rows.filter((p: any) => {
        if (status && p.status !== status) return false;
        if (district && !(p.originDistrict === district || p.destinationDistrict === district)) return false;
        if (hubId && !(p.originHubId === hubId || p.destinationHubId === hubId)) return false;
        if (!s) return true;
        return Object.values(p).some((v) => String(v).toLowerCase().includes(s));
      });
    }, [rows, q, status, district, hubId]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
    const paginated = useMemo(() => {
      const start = (page - 1) * itemsPerPage;
      return filtered.slice(start, start + itemsPerPage);
    }, [filtered, page, itemsPerPage]);

    const toggleSelect = (id: string) =>
      setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

    const selectAllVisible = () => {
      const ids = paginated.map((p: any) => p.id);
      const allSelected = ids.every((id) => selectedIds.includes(id));
      if (allSelected) setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)));
      else setSelectedIds((prev) => Array.from(new Set([...prev, ...ids])));
    };

    const statusTone = (s: ParcelStatus) => {
      if (s === "Delivered") return "green";
      if (s === "Out for Delivery" || s === "In Transit") return "blue";
      if (s === "Disputed" || s === "On Hold") return "red";
      if (s === "Requested" || s === "Picked Up" || s.includes("Hub")) return "yellow";
      return "gray";
    };

    const markHold = () => {
      if (!selectedIds.length) return;
      setParcels((prev) => prev.map((p) => (selectedIds.includes(p.id) ? { ...p, status: "On Hold" } : p)));
      setLogs((prev) => [{ at: now(), level: "warn", message: `Marked On Hold: ${selectedIds.join(", ")}` }, ...prev]);
      setSelectedIds([]);
    };

    const resolveDispute = (disputeId: string) => {
      setDisputes((prev) => prev.map((d) => (d.id === disputeId ? { ...d, status: "Resolved", resolution: "Resolved by admin (static)" } : d)));
      setLogs((prev) => [{ at: now(), level: "info", message: `Resolved dispute ${disputeId}` }, ...prev]);
    };

    return (
      <TableShell
        title="Parcel Management"
        subtitle="View all parcels, track journey (hub transfers), filter, analytics, and handle disputes/issues (static)"
        right={
          <>
            <div className="flex items-center bg-gray-50 rounded px-3 py-2 gap-2">
              <Search size={16} />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search parcel/customer/merchant..." className="bg-transparent outline-none text-sm w-56" />
            </div>

            <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="px-3 py-2 border rounded">
              <option value="">All Status</option>
              {Array.from(new Set(parcels.map((p) => p.status))).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select value={district} onChange={(e) => setDistrict(e.target.value)} className="px-3 py-2 border rounded">
              <option value="">All Districts</option>
              {Array.from(new Set(hubs.map((h) => h.district))).map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <select value={hubId} onChange={(e) => setHubId(e.target.value)} className="px-3 py-2 border rounded">
              <option value="">All Hubs</option>
              {hubs.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>

            <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))} className="px-2 py-2 border rounded">
              {[5, 10, 20].map((o) => (
                <option key={o} value={o}>
                  {o}/page
                </option>
              ))}
            </select>

            <button onClick={() => exportCSV("parcels", filtered)} className="px-3 py-2 rounded border flex items-center gap-2">
              <Download size={14} /> Export
            </button>

            <button
              onClick={() =>
                openConfirm({
                  title: "Mark selected as On Hold",
                  message: `Mark ${selectedIds.length} parcel(s) as On Hold?`,
                  confirmText: "Mark Hold",
                  tone: "primary",
                  onConfirm: markHold,
                })
              }
              disabled={selectedIds.length === 0}
              className={`px-3 py-2 rounded border flex items-center gap-2 ${selectedIds.length ? "" : "opacity-50"}`}
            >
              <ShieldCheck size={14} /> Hold ({selectedIds.length})
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="Total Parcels" value={parcels.length} icon={<Package size={18} />} />
          <StatCard title="In Transit" value={parcels.filter((p) => p.status === "In Transit").length} icon={<Truck size={18} />} />
          <StatCard title="Delivered" value={parcels.filter((p) => p.status === "Delivered").length} icon={<ShieldCheck size={18} />} />
          <StatCard title="Open Disputes" value={disputes.filter((d) => d.status === "Open").length} icon={<Activity size={18} />} />
        </div>

        <div className="overflow-x-auto mt-2">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-sm text-gray-600">
                  <input type="checkbox" onChange={selectAllVisible} checked={paginated.every((p: any) => selectedIds.includes(p.id)) && paginated.length > 0} />
                </th>
                <th className="px-3 py-2 text-left text-sm text-gray-600">Parcel</th>
                <th className="px-3 py-2 text-left text-sm text-gray-600">Merchant</th>
                <th className="px-3 py-2 text-left text-sm text-gray-600">Route</th>
                <th className="px-3 py-2 text-left text-sm text-gray-600">COD</th>
                <th className="px-3 py-2 text-left text-sm text-gray-600">Est. Fare</th>
                <th className="px-3 py-2 text-left text-sm text-gray-600">Status</th>
                <th className="px-3 py-2 text-left text-sm text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y">
              {paginated.map((p: any) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => toggleSelect(p.id)} />
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-semibold text-gray-800">{p.id}</div>
                    <div className="text-xs text-gray-500">{p.customerName} • {p.customerPhone}</div>
                    <div className="text-xs text-gray-500">Service: {p.serviceType} • Rider: {p.rider}</div>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-700">{p.merchant}</td>
                  <td className="px-3 py-2 text-sm text-gray-700">
                    <div className="text-xs text-gray-500">{p.originDistrict} → {p.destinationDistrict}</div>
                    <div>{p.originHub} → {p.destinationHub}</div>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-700">{p.codAmount ? moneyBDT(p.codAmount) : "—"}</td>
                  <td className="px-3 py-2 text-sm text-gray-700">{moneyBDT(p.estFare)}</td>
                  <td className="px-3 py-2 text-sm">
                    <Pill tone={statusTone(p.status)}>{p.status}</Pill>
                  </td>
                  <td className="px-3 py-2 text-sm">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setDetailModal({ type: "parcel", row: p })} className="text-blue-600">Track</button>
                      {p.status === "Disputed" && (
                        <button
                          onClick={() => {
                            const d = disputes.find((x) => x.parcelId === p.id && x.status === "Open");
                            if (d) resolveDispute(d.id);
                          }}
                          className="text-green-700"
                        >
                          Resolve Dispute
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setParcels((prev) =>
                            prev.map((x) =>
                              x.id === p.id
                                ? { ...x, status: x.status === "Delivered" ? "Returned" : "Delivered", journey: [{ at: now(), label: x.status === "Delivered" ? "Returned" : "Delivered" }, ...x.journey] }
                                : x
                            )
                          );
                          setLogs((prev) => [{ at: now(), level: "info", message: `Updated parcel ${p.id} status (static)` }, ...prev]);
                        }}
                        className="text-gray-700"
                      >
                        Toggle Delivered
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-sm text-gray-500">
                    No parcels found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="text-sm text-gray-600">Showing {paginated.length} of {filtered.length} parcels</div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-2 py-1 border rounded">Prev</button>
            <div className="px-3 py-1 border rounded">{page} / {totalPages}</div>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="px-2 py-1 border rounded">Next</button>
          </div>
        </div>

        <div className="bg-gray-50 border rounded p-4">
          <div className="font-semibold text-gray-800">Disputes / Issues (static)</div>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            {disputes.map((d) => (
              <div key={d.id} className="bg-white border rounded p-3">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{d.id}</div>
                  <Pill tone={d.status === "Open" ? "red" : "green"}>{d.status}</Pill>
                </div>
                <div className="text-sm text-gray-600 mt-1">Parcel: {d.parcelId}</div>
                <div className="text-sm text-gray-700 mt-2">{d.issue}</div>
                {d.resolution && <div className="text-xs text-gray-500 mt-2">Resolution: {d.resolution}</div>}
                <div className="mt-3 flex gap-2">
                  <button onClick={() => setDetailModal({ type: "dispute", row: d })} className="px-3 py-2 border rounded">View</button>
                  {d.status === "Open" && (
                    <button onClick={() => resolveDispute(d.id)} className="px-3 py-2 rounded bg-green-600 text-white">
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            ))}
            {disputes.length === 0 && <div className="text-sm text-gray-600">No disputes.</div>}
          </div>
        </div>
      </TableShell>
    );
  };

  // ---------------------------
  // 5) Pricing & Settings
  // ---------------------------
  const PricingSettingsModule: React.FC = () => {
    const [local, setLocal] = useState(pricing);

    useEffect(() => setLocal(pricing), [pricing]);

    const save = () => {
      setPricing(local);
      setLogs((prev) => [{ at: now(), level: "info", message: "Updated pricing configuration" }, ...prev]);
    };

    const calcExample = useMemo(() => {
      const ex: Parcel = {
        id: "EXAMPLE",
        merchantId: "M001",
        customerName: "Example",
        customerPhone: "000",
        originHubId: "H001",
        destinationHubId: "H003",
        originDistrict: "Dhaka",
        destinationDistrict: "Chattogram",
        weightKg: 2,
        distanceKm: 120,
        codAmount: 1000,
        serviceType: "Regular",
        status: "Requested",
        createdAt: now(),
        journey: [{ at: now(), label: "Requested" }],
      };
      const base = local.baseFare;
      const weight = ex.weightKg * local.perKg;
      const dist = ex.distanceKm * local.perKm;
      const cod = (ex.codAmount * local.codPct) / 100;
      const area = local.serviceAreaSurcharge;
      const subtotal = base + weight + dist + cod + area;
      return {
        base,
        weight,
        dist,
        cod,
        area,
        subtotal,
        express: subtotal * local.expressMultiplier,
      };
    }, [local]);

    return (
      <TableShell
        title="Pricing & Settings"
        subtitle="Configure pricing rules: weight, distance, COD charges, service area pricing (static)"
        right={
          <>
            <button onClick={() => exportCSV("pricing-config", [local])} className="px-3 py-2 rounded border flex items-center gap-2">
              <Download size={14} /> Export
            </button>
            <button onClick={save} className="px-3 py-2 rounded bg-green-600 text-white">
              Save Changes
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-50 border rounded p-4 space-y-4">
            <div className="font-semibold text-gray-800">Pricing Rules</div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { key: "baseFare", label: "Base Fare (৳)" },
                { key: "perKg", label: "Per KG (৳/kg)" },
                { key: "perKm", label: "Per KM (৳/km)" },
                { key: "codPct", label: "COD Charge (%)" },
                { key: "serviceAreaSurcharge", label: "Service Area Surcharge (৳)" },
                { key: "expressMultiplier", label: "Express Multiplier (x)" },
              ].map((f) => (
                <label key={f.key} className="text-sm">
                  <div className="text-xs text-gray-600 mb-1">{f.label}</div>
                  <input
                    type="number"
                    value={(local as any)[f.key]}
                    onChange={(e) => setLocal((p) => ({ ...p, [f.key]: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border rounded bg-white"
                  />
                </label>
              ))}
            </div>

            <div className="text-xs text-gray-500">
              * These are system-wide defaults. You can extend later for district/hub specific overrides.
            </div>
          </div>

          <div className="bg-white border rounded p-4 space-y-3">
            <div className="font-semibold text-gray-800">Example Fare Breakdown (static)</div>
            <div className="text-sm text-gray-600">Example: 2kg, 120km, COD ৳1000, Regular</div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between"><span className="text-gray-600">Base</span><span className="font-semibold">{moneyBDT(calcExample.base)}</span></div>
              <div className="flex items-center justify-between"><span className="text-gray-600">Weight</span><span className="font-semibold">{moneyBDT(Math.round(calcExample.weight))}</span></div>
              <div className="flex items-center justify-between"><span className="text-gray-600">Distance</span><span className="font-semibold">{moneyBDT(Math.round(calcExample.dist))}</span></div>
              <div className="flex items-center justify-between"><span className="text-gray-600">COD</span><span className="font-semibold">{moneyBDT(Math.round(calcExample.cod))}</span></div>
              <div className="flex items-center justify-between"><span className="text-gray-600">Service Area</span><span className="font-semibold">{moneyBDT(Math.round(calcExample.area))}</span></div>
              <div className="border-t pt-2 flex items-center justify-between"><span className="text-gray-800 font-semibold">Subtotal</span><span className="font-semibold">{moneyBDT(Math.round(calcExample.subtotal))}</span></div>
              <div className="flex items-center justify-between"><span className="text-gray-600">Express (x{local.expressMultiplier})</span><span className="font-semibold">{moneyBDT(Math.round(calcExample.express))}</span></div>
            </div>

            <div className="bg-gray-50 border rounded p-3">
              <div className="font-semibold text-gray-800 text-sm">Service Types (static)</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {serviceTypes.map((s) => (
                  <span key={s} className="inline-flex items-center gap-2 px-2 py-1 border rounded bg-white text-sm">
                    {s}
                    <button
                      onClick={() => {
                        setServiceTypes((prev) => prev.filter((x) => x !== s));
                        setLogs((prev) => [{ at: now(), level: "warn", message: `Removed service type: ${s}` }, ...prev]);
                      }}
                      className="text-red-600"
                      title="Remove"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
                <button
                  onClick={() => {
                    const next = `Type ${serviceTypes.length + 1}`;
                    setServiceTypes((prev) => [...prev, next]);
                    setLogs((prev) => [{ at: now(), level: "info", message: `Added service type: ${next}` }, ...prev]);
                  }}
                  className="px-3 py-1 border rounded text-sm"
                >
                  + Add
                </button>
              </div>
            </div>
          </div>
        </div>
      </TableShell>
    );
  };

  // ---------------------------
  // 6) Reports & Analytics
  // ---------------------------
  const ReportsAnalyticsModule: React.FC = () => {
    const analytics = useMemo(() => {
      const byDistrict = new Map<string, number>();
      parcels.forEach((p) => {
        byDistrict.set(p.destinationDistrict, (byDistrict.get(p.destinationDistrict) ?? 0) + 1);
      });

      const byHub = new Map<string, number>();
      parcels.forEach((p) => {
        byHub.set(p.destinationHubId, (byHub.get(p.destinationHubId) ?? 0) + 1);
      });

      const riderPerf = ridersList.map((r) => {
        const assigned = parcels.filter((p) => p.assignedRiderId === r.id).length;
        const delivered = parcels.filter((p) => p.assignedRiderId === r.id && p.status === "Delivered").length;
        return { riderId: r.id, rider: r.name, assigned, delivered, deliveryRate: assigned ? Math.round((delivered / assigned) * 100) : 0 };
      });

      const merchantStats = merchants.map((m) => {
        const total = parcels.filter((p) => p.merchantId === m.id).length;
        const revenue = parcels.filter((p) => p.merchantId === m.id).reduce((a, p) => a + estimateParcelFare(p), 0);
        return { merchantId: m.id, merchant: m.name, parcels: total, revenue: Math.round(revenue) };
      });

      const hubEfficiency = hubs.map((h) => {
        const inbound = parcels.filter((p) => p.destinationHubId === h.id).length;
        const outbound = parcels.filter((p) => p.originHubId === h.id).length;
        const score = Math.min(100, Math.round((inbound + outbound) * 6)); // purely static-ish scoring
        return { hubId: h.id, hub: h.name, inbound, outbound, efficiencyScore: score };
      });

      return {
        byDistrict: Array.from(byDistrict.entries()).map(([district, parcels]) => ({ district, parcels })),
        byHub: Array.from(byHub.entries()).map(([hubId, parcels]) => ({ hubId, hub: hubNameById(hubId), parcels })),
        riderPerf,
        merchantStats,
        hubEfficiency,
      };
    }, [parcels, ridersList, merchants, hubs, hubNameById]);

    const exportPDFPlaceholder = (name: string) => {
      // static: placeholder only
      setLogs((prev) => [{ at: now(), level: "info", message: `PDF export requested: ${name} (placeholder)` }, ...prev]);
      alert(`PDF export is placeholder in this static dashboard: ${name}`);
    };

    return (
      <TableShell
        title="Reports & Analytics"
        subtitle="Revenue, parcel volume, rider performance, hub efficiency, merchant stats, export (static)"
        right={
          <>
            <button onClick={() => exportCSV("reports-list", reports)} className="px-3 py-2 rounded border flex items-center gap-2">
              <Download size={14} /> Export (CSV)
            </button>
            <button onClick={() => exportPDFPlaceholder("All Reports")} className="px-3 py-2 rounded bg-green-600 text-white">
              Export (PDF)
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="Total Revenue (est.)" value={moneyBDT(Math.round(parcels.reduce((a, p) => a + estimateParcelFare(p), 0)))} icon={<Banknote size={18} />} />
          <StatCard title="Total Parcels" value={parcels.length} icon={<Package size={18} />} />
          <StatCard title="Active Merchants" value={merchants.filter((m) => m.status === "Verified").length} icon={<Users size={18} />} />
          <StatCard title="Active Riders" value={ridersList.filter((r) => r.status !== "Suspended").length} icon={<Truck size={18} />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-50 border rounded p-4">
            <div className="font-semibold text-gray-800">Revenue Reports (static list)</div>
            <div className="mt-3 space-y-2">
              {reports.map((r) => (
                <div key={r.id} className="bg-white border rounded p-3 flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{r.name}</div>
                    <div className="text-xs text-gray-500">{r.date} • {r.summary}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => exportCSV(r.id, [r])} className="px-3 py-2 border rounded text-sm">CSV</button>
                    <button onClick={() => exportPDFPlaceholder(r.name)} className="px-3 py-2 border rounded text-sm">PDF</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 border rounded p-4">
            <div className="font-semibold text-gray-800">Parcel Volume by District</div>
            <div className="mt-3 space-y-2">
              {analytics.byDistrict.map((d) => (
                <div key={d.district} className="bg-white border rounded p-3 flex items-center justify-between">
                  <div className="font-medium">{d.district}</div>
                  <Pill tone="blue">{d.parcels} parcels</Pill>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <button onClick={() => exportCSV("parcel-volume-by-district", analytics.byDistrict)} className="px-3 py-2 border rounded text-sm">
                Export CSV
              </button>
            </div>
          </div>

          <div className="bg-gray-50 border rounded p-4">
            <div className="font-semibold text-gray-800">Rider Performance</div>
            <div className="mt-3 space-y-2">
              {analytics.riderPerf.map((r) => (
                <div key={r.riderId} className="bg-white border rounded p-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{r.rider}</div>
                    <div className="text-xs text-gray-500">Assigned: {r.assigned} • Delivered: {r.delivered}</div>
                  </div>
                  <Pill tone={r.deliveryRate >= 80 ? "green" : r.deliveryRate >= 50 ? "yellow" : "red"}>{r.deliveryRate}%</Pill>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <button onClick={() => exportCSV("rider-performance", analytics.riderPerf)} className="px-3 py-2 border rounded text-sm">
                Export CSV
              </button>
            </div>
          </div>

          <div className="bg-gray-50 border rounded p-4">
            <div className="font-semibold text-gray-800">Hub Efficiency Metrics</div>
            <div className="mt-3 space-y-2">
              {analytics.hubEfficiency.map((h) => (
                <div key={h.hubId} className="bg-white border rounded p-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{h.hub}</div>
                    <div className="text-xs text-gray-500">Inbound: {h.inbound} • Outbound: {h.outbound}</div>
                  </div>
                  <Pill tone={h.efficiencyScore >= 80 ? "green" : h.efficiencyScore >= 50 ? "yellow" : "red"}>{h.efficiencyScore}</Pill>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <button onClick={() => exportCSV("hub-efficiency", analytics.hubEfficiency)} className="px-3 py-2 border rounded text-sm">
                Export CSV
              </button>
            </div>
          </div>

          <div className="bg-gray-50 border rounded p-4 lg:col-span-2">
            <div className="font-semibold text-gray-800">Merchant Statistics</div>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              {analytics.merchantStats.map((m) => (
                <div key={m.merchantId} className="bg-white border rounded p-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{m.merchant}</div>
                    <div className="text-xs text-gray-500">Parcels: {m.parcels}</div>
                  </div>
                  <Pill tone="green">{moneyBDT(m.revenue)}</Pill>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <button onClick={() => exportCSV("merchant-statistics", analytics.merchantStats)} className="px-3 py-2 border rounded text-sm">
                Export CSV
              </button>
            </div>
          </div>
        </div>
      </TableShell>
    );
  };

  // ---------------------------
  // 7) Financial Management
  // ---------------------------
  const FinancialManagementModule: React.FC = () => {
    type Tab = "merchant-wallet" | "cod-settlement" | "rider-payments" | "commission";
    const [tab, setTab] = useState<Tab>("merchant-wallet");
    const [q, setQ] = useState("");

    const filtered = useMemo(() => {
      const s = q.trim().toLowerCase();
      const byTab = (t: TransactionType) => transactions.filter((tx) => tx.type === t);
      const rows =
        tab === "merchant-wallet"
          ? byTab("Merchant Wallet")
          : tab === "cod-settlement"
          ? byTab("COD Settlement")
          : tab === "rider-payments"
          ? byTab("Rider Payment")
          : byTab("Commission");

      return rows.filter((tx) => {
        if (!s) return true;
        return Object.values(tx).some((v) => String(v).toLowerCase().includes(s));
      });
    }, [transactions, tab, q]);

    const totals = useMemo(() => {
      const credit = filtered.filter((t) => t.direction === "credit").reduce((a, t) => a + t.amount, 0);
      const debit = filtered.filter((t) => t.direction === "debit").reduce((a, t) => a + t.amount, 0);
      return { credit, debit, net: credit - debit };
    }, [filtered]);

    const addTransaction = () => {
      const id = `TX${String(transactions.length + 1).padStart(3, "0")}`;
      const map: Record<Tab, TransactionType> = {
        "merchant-wallet": "Merchant Wallet",
        "cod-settlement": "COD Settlement",
        "rider-payments": "Rider Payment",
        commission: "Commission",
      };
      const type = map[tab];
      const tx: Transaction = {
        id,
        type,
        refId: type === "Rider Payment" ? ridersList[0]?.id ?? "RD001" : type === "Merchant Wallet" ? merchants[0]?.id ?? "M001" : parcels[0]?.id ?? "PCL001",
        amount: 500,
        direction: "credit",
        at: now(),
        note: "Manual entry (static)",
      };
      setTransactions((prev) => [tx, ...prev]);
      setLogs((prev) => [{ at: now(), level: "info", message: `Added transaction ${id} (${type})` }, ...prev]);
    };

    const refLabel = (tx: Transaction) => {
      if (tx.type === "Merchant Wallet") return `${tx.refId} • ${merchantNameById(tx.refId)}`;
      if (tx.type === "Rider Payment") return `${tx.refId} • ${riderNameById(tx.refId)}`;
      return tx.refId;
    };

    return (
      <TableShell
        title="Financial Management"
        subtitle="Merchant wallet, COD settlements, rider payments, commission and payment history (static)"
        right={
          <>
            <div className="flex items-center bg-gray-50 rounded px-3 py-2 gap-2">
              <Search size={16} />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search transactions..." className="bg-transparent outline-none text-sm w-56" />
            </div>
            <button onClick={() => exportCSV(`financial-${tab}`, filtered)} className="px-3 py-2 rounded border flex items-center gap-2">
              <Download size={14} /> Export
            </button>
            <button onClick={addTransaction} className="px-3 py-2 rounded bg-green-600 text-white flex items-center gap-2">
              <Plus size={14} /> Add Tx
            </button>
          </>
        }
      >
        <div className="flex gap-2 flex-wrap">
          {([
            { id: "merchant-wallet", label: "Merchant Wallet" },
            { id: "cod-settlement", label: "COD Settlements" },
            { id: "rider-payments", label: "Rider Payments" },
            { id: "commission", label: "Commission" },
          ] as { id: Tab; label: string }[]).map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`px-3 py-2 rounded ${tab === t.id ? "bg-green-600 text-white" : "bg-gray-100"}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Credits" value={moneyBDT(totals.credit)} icon={<Wallet size={18} />} />
          <StatCard title="Debits" value={moneyBDT(totals.debit)} icon={<Wallet size={18} />} />
          <StatCard title="Net" value={moneyBDT(totals.net)} icon={<Banknote size={18} />} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-sm text-gray-600">ID</th>
                <th className="px-3 py-2 text-left text-sm text-gray-600">Type</th>
                <th className="px-3 py-2 text-left text-sm text-gray-600">Reference</th>
                <th className="px-3 py-2 text-left text-sm text-gray-600">Amount</th>
                <th className="px-3 py-2 text-left text-sm text-gray-600">When</th>
                <th className="px-3 py-2 text-left text-sm text-gray-600">Note</th>
                <th className="px-3 py-2 text-left text-sm text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y">
              {filtered.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2 font-semibold text-gray-800">{tx.id}</td>
                  <td className="px-3 py-2 text-sm text-gray-700">{tx.type}</td>
                  <td className="px-3 py-2 text-sm text-gray-700">{refLabel(tx)}</td>
                  <td className="px-3 py-2 text-sm">
                    <Pill tone={tx.direction === "credit" ? "green" : "red"}>
                      {tx.direction.toUpperCase()} • {moneyBDT(tx.amount)}
                    </Pill>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-700">{tx.at}</td>
                  <td className="px-3 py-2 text-sm text-gray-700">{tx.note}</td>
                  <td className="px-3 py-2 text-sm">
                    <div className="flex gap-2">
                      <button onClick={() => setDetailModal({ type: "tx", row: tx })} className="text-blue-600">View</button>
                      <button
                        onClick={() =>
                          openConfirm({
                            title: "Delete transaction",
                            message: `Delete ${tx.id}?`,
                            confirmText: "Delete",
                            tone: "danger",
                            onConfirm: () => setTransactions((prev) => prev.filter((x) => x.id !== tx.id)),
                          })
                        }
                        className="text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-sm text-gray-500">
                    No transactions.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </TableShell>
    );
  };

  // ---------------------------
  // 8) System Settings
  // ---------------------------
  const SystemSettingsModule: React.FC = () => {
    const [maintenance, setMaintenance] = useState(false);
    const [inviteOnly, setInviteOnly] = useState(false);
    const [emailNotif, setEmailNotif] = useState(true);
    const [smsNotif, setSmsNotif] = useState(true);

    return (
      <TableShell
        title="System Settings"
        subtitle="General settings, Email/SMS notifications, coverage management, service types, preferences (static)"
        right={
          <button
            onClick={() => {
              setLogs((prev) => [{ at: now(), level: "info", message: "System settings saved (static)" }, ...prev]);
              alert("Saved (static).");
            }}
            className="px-3 py-2 rounded bg-green-600 text-white"
          >
            Save
          </button>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border rounded p-4 space-y-3">
            <div className="font-semibold text-gray-800">General</div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
              <div>
                <div className="font-medium text-gray-800">Maintenance Mode</div>
                <div className="text-sm text-gray-600">Disable access for non-admins</div>
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={maintenance}
                  onChange={() => {
                    setMaintenance((s) => !s);
                    setLogs((prev) => [{ at: now(), level: "warn", message: `Maintenance mode: ${!maintenance ? "ON" : "OFF"}` }, ...prev]);
                  }}
                />
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
              <div>
                <div className="font-medium text-gray-800">Invite Only</div>
                <div className="text-sm text-gray-600">Only invited users can register</div>
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={inviteOnly}
                  onChange={() => {
                    setInviteOnly((s) => !s);
                    setLogs((prev) => [{ at: now(), level: "info", message: `Invite only: ${!inviteOnly ? "ON" : "OFF"}` }, ...prev]);
                  }}
                />
              </label>
            </div>
          </div>

          <div className="bg-white border rounded p-4 space-y-3">
            <div className="font-semibold text-gray-800 flex items-center gap-2">
              <Bell size={16} /> Notifications
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
              <div>
                <div className="font-medium text-gray-800">Email Notifications</div>
                <div className="text-sm text-gray-600">Parcel updates, disputes, settlements</div>
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={emailNotif}
                  onChange={() => {
                    setEmailNotif((s) => !s);
                    setLogs((prev) => [{ at: now(), level: "info", message: `Email notifications: ${!emailNotif ? "ON" : "OFF"}` }, ...prev]);
                  }}
                />
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
              <div>
                <div className="font-medium text-gray-800">SMS Notifications</div>
                <div className="text-sm text-gray-600">Delivery OTP, pickup alerts</div>
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={smsNotif}
                  onChange={() => {
                    setSmsNotif((s) => !s);
                    setLogs((prev) => [{ at: now(), level: "info", message: `SMS notifications: ${!smsNotif ? "ON" : "OFF"}` }, ...prev]);
                  }}
                />
              </label>
            </div>
          </div>

          <div className="bg-white border rounded p-4 space-y-3 lg:col-span-2">
            <div className="font-semibold text-gray-800">Coverage Areas & Service Types</div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 border rounded p-3">
                <div className="font-semibold text-gray-800 text-sm">Coverage Areas</div>
                <div className="mt-2 space-y-2">
                  {coverageAreas.slice(0, 8).map((a) => (
                    <div key={a} className="flex items-center justify-between bg-white border rounded p-2">
                      <span className="text-sm">{a}</span>
                      <button
                        onClick={() => {
                          setCoverageAreas((prev) => prev.filter((x) => x !== a));
                          setLogs((prev) => [{ at: now(), level: "warn", message: `Removed coverage area: ${a}` }, ...prev]);
                        }}
                        className="text-red-600 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    const next = `Coverage ${coverageAreas.length + 1}`;
                    setCoverageAreas((prev) => [next, ...prev]);
                    setLogs((prev) => [{ at: now(), level: "info", message: `Added coverage area: ${next}` }, ...prev]);
                  }}
                  className="mt-3 px-3 py-2 border rounded text-sm"
                >
                  + Add Coverage
                </button>
              </div>

              <div className="bg-gray-50 border rounded p-3">
                <div className="font-semibold text-gray-800 text-sm">Service Types</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {serviceTypes.map((s) => (
                    <span key={s} className="inline-flex items-center gap-2 px-2 py-1 border rounded bg-white text-sm">
                      {s}
                      <button
                        onClick={() => {
                          setServiceTypes((prev) => prev.filter((x) => x !== s));
                          setLogs((prev) => [{ at: now(), level: "warn", message: `Removed service type: ${s}` }, ...prev]);
                        }}
                        className="text-red-600"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => {
                    const next = `Type ${serviceTypes.length + 1}`;
                    setServiceTypes((prev) => [...prev, next]);
                    setLogs((prev) => [{ at: now(), level: "info", message: `Added service type: ${next}` }, ...prev]);
                  }}
                  className="mt-3 px-3 py-2 border rounded text-sm"
                >
                  + Add Service Type
                </button>
              </div>
            </div>
          </div>
        </div>
      </TableShell>
    );
  };

  // ---------------------------
  // (Optional) System Logs (kept as helper inside dashboard)
  // ---------------------------
  const SystemLogsCard: React.FC = () => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">System Logs</h2>
        <button
          onClick={() => exportCSV("system-logs", logs)}
          className="px-3 py-2 border rounded flex items-center gap-2"
        >
          <Download size={14} /> Export
        </button>
      </div>
      <div className="space-y-2 max-h-80 overflow-auto">
        {logs.map((l, idx) => (
          <div key={idx} className="p-3 bg-gray-50 rounded border">
            <div className="text-xs text-gray-500">
              {l.at} • {l.level.toUpperCase()}
            </div>
            <div className="text-sm text-gray-800">{l.message}</div>
          </div>
        ))}
      </div>
    </div>
  );

  // ---------------------------
  // Render module
  // ---------------------------
  const renderModule = () => {
    switch (activeModule) {
      case "overview":
        return (
          <div className="space-y-6">
            <OverviewModule />
            {/* keep logs visible on overview */}
            <SystemLogsCard />
          </div>
        );
      case "user-management":
        return <UserManagementModule />;
      case "hub-management":
        return <HubManagementModule />;
      case "parcel-management":
        return <ParcelManagementModule />;
      case "pricing-settings":
        return <PricingSettingsModule />;
      case "reports-analytics":
        return <ReportsAnalyticsModule />;
      case "financial-management":
        return <FinancialManagementModule />;
      case "system-settings":
        return <SystemSettingsModule />;
      default:
        return <OverviewModule />;
    }
  };

  // ---------------------------
  // Detail Modal (unified)
  // ---------------------------
  const DetailModal = () => {
    if (!detailModal) return null;
    const { type, row } = detailModal;

    const title =
      type === "parcel"
        ? `Parcel Tracking — ${row.id}`
        : type === "dispute"
        ? `Dispute — ${row.id}`
        : type === "hub"
        ? `Hub — ${row.id}`
        : type === "tx"
        ? `Transaction — ${row.id}`
        : type === "roles"
        ? "Roles & Permissions"
        : `Details — ${row?.name ?? row?.id ?? ""}`;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setDetailModal(null)}>
        <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            <button onClick={() => setDetailModal(null)} className="text-gray-500 hover:text-gray-800">
              <X size={20} />
            </button>
          </div>

          {type === "parcel" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-gray-50 border rounded p-3">
                  <div className="text-xs text-gray-500">Merchant</div>
                  <div className="font-semibold">{row.merchant}</div>
                  <div className="text-xs text-gray-500 mt-2">Customer</div>
                  <div className="font-semibold">{row.customerName} • {row.customerPhone}</div>
                </div>
                <div className="bg-gray-50 border rounded p-3">
                  <div className="text-xs text-gray-500">Route</div>
                  <div className="font-semibold">{row.originDistrict} → {row.destinationDistrict}</div>
                  <div className="text-sm text-gray-700">{row.originHub} → {row.destinationHub}</div>
                  <div className="text-xs text-gray-500 mt-2">Status</div>
                  <Pill tone="blue">{row.status}</Pill>
                </div>
              </div>

              <div className="bg-white border rounded p-4">
                <div className="font-semibold text-gray-800">Journey / Transfers</div>
                <div className="mt-3 space-y-2">
                  {row.journey.map((e: ParcelEvent, i: number) => (
                    <div key={i} className="flex items-start justify-between gap-3 p-2 rounded hover:bg-gray-50">
                      <div className="min-w-0">
                        <div className="text-xs text-gray-500">{e.at}</div>
                        <div className="text-sm font-medium text-gray-800">{e.label}</div>
                        {e.note && <div className="text-sm text-gray-600">{e.note}</div>}
                        {e.hubId && <div className="text-xs text-gray-500">Hub: {hubNameById(e.hubId)}</div>}
                      </div>
                      <Pill tone="gray">{i === 0 ? "LATEST" : "EVENT"}</Pill>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {type === "dispute" && (
            <div className="space-y-3">
              <div className="bg-gray-50 border rounded p-3">
                <div className="text-xs text-gray-500">Parcel</div>
                <div className="font-semibold">{row.parcelId}</div>
                <div className="text-xs text-gray-500 mt-2">Opened</div>
                <div className="font-semibold">{row.openedAt}</div>
                <div className="text-xs text-gray-500 mt-2">Status</div>
                <Pill tone={row.status === "Open" ? "red" : "green"}>{row.status}</Pill>
              </div>
              <div className="bg-white border rounded p-3">
                <div className="font-semibold text-gray-800">Issue</div>
                <div className="text-sm text-gray-700 mt-2">{row.issue}</div>
                {row.resolution && (
                  <>
                    <div className="font-semibold text-gray-800 mt-4">Resolution</div>
                    <div className="text-sm text-gray-700 mt-2">{row.resolution}</div>
                  </>
                )}
              </div>
            </div>
          )}

          {type === "hub" && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-gray-50 border rounded p-3">
                  <div className="text-xs text-gray-500">Hub</div>
                  <div className="font-semibold">{row.name}</div>
                  <div className="text-xs text-gray-500 mt-2">District / Type</div>
                  <div className="font-semibold">{row.district} • {row.type}</div>
                  <div className="text-xs text-gray-500 mt-2">Parent</div>
                  <div className="font-semibold">{row.parentHub}</div>
                </div>
                <div className="bg-gray-50 border rounded p-3">
                  <div className="text-xs text-gray-500">Capacity</div>
                  <div className="font-semibold">{row.capacity}</div>
                  <div className="text-xs text-gray-500 mt-2">Managers</div>
                  <div className="font-semibold">{row.managers}</div>
                  <div className="text-xs text-gray-500 mt-2">Riders</div>
                  <div className="font-semibold">{row.riders}</div>
                </div>
              </div>
              <div className="bg-white border rounded p-3">
                <div className="font-semibold text-gray-800">Coverage Areas</div>
                <div className="text-sm text-gray-700 mt-2">{(row.coverageAreas ?? []).join(", ")}</div>
              </div>
            </div>
          )}

          {type === "tx" && (
            <div className="space-y-3">
              <div className="bg-gray-50 border rounded p-3">
                <div className="text-xs text-gray-500">Type</div>
                <div className="font-semibold">{row.type}</div>
                <div className="text-xs text-gray-500 mt-2">Reference</div>
                <div className="font-semibold">{row.refId}</div>
                <div className="text-xs text-gray-500 mt-2">Amount</div>
                <Pill tone={row.direction === "credit" ? "green" : "red"}>{row.direction.toUpperCase()} • {moneyBDT(row.amount)}</Pill>
              </div>
              <div className="bg-white border rounded p-3">
                <div className="font-semibold text-gray-800">Note</div>
                <div className="text-sm text-gray-700 mt-2">{row.note}</div>
                <div className="text-xs text-gray-500 mt-3">At: {row.at}</div>
              </div>
            </div>
          )}

          {type === "roles" && (
            <div className="space-y-3">
              {(row as Role[]).map((r: Role) => (
                <div key={r.id} className="bg-gray-50 border rounded p-3 flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-gray-800">{r.name}</div>
                    <div className="text-sm text-gray-600">{r.permissions.join(", ")}</div>
                  </div>
                  <button className="px-3 py-2 border rounded">Edit (static)</button>
                </div>
              ))}
            </div>
          )}

          {type !== "parcel" && type !== "dispute" && type !== "hub" && type !== "tx" && type !== "roles" && (
            <div className="bg-gray-50 border rounded p-3">
              <div className="text-xs text-gray-500 mb-2">Raw</div>
              <pre className="text-xs overflow-auto">{JSON.stringify(row, null, 2)}</pre>
            </div>
          )}

          <div className="mt-5 flex justify-end gap-2">
            <button onClick={() => setDetailModal(null)} className="px-4 py-2 border rounded">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className={`${sidebarOpen ? "w-72" : "w-20"} bg-linear-to-b from-green-600 to-green-700 text-white transition-all duration-300 flex flex-col`}>
        <div className="p-4 flex items-center justify-between border-b border-green-500">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/")} className="p-2 hover:bg-green-500 rounded-lg transition-colors" title="Back to Home">
              <Home size={20} />
            </button>
            {sidebarOpen && <h1 className="text-xl font-bold">Courier Admin</h1>}
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
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeModule === item.id ? "bg-green-800" : "hover:bg-green-500"
                }`}
                title={item.label}
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
        <DetailModal />

        <ConfirmModal
          open={confirmOpen}
          title={confirmConfig?.title}
          message={confirmConfig?.message}
          confirmText={confirmConfig?.confirmText ?? "Confirm"}
          tone={confirmConfig?.tone ?? "danger"}
          onConfirm={() => confirmConfig?.onConfirm?.()}
          onClose={() => setConfirmOpen(false)}
        />
      </main>
    </div>
  );
};

export default AdminDashboard;

