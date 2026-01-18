
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Settings,
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
  Layers,
  ClipboardList,
  Pencil,
  ShieldCheck,
} from "lucide-react";
import { ParcelDetailView } from "../components/ParcelDetailView";

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
  parentHubId?: string | null;
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
  | "Picking Up"
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
  baseFare: number;
  perKg: number;
  perKm: number;
  codPct: number;
  serviceAreaSurcharge: number;
  expressMultiplier: number;
};

type TransactionType = "Merchant Wallet" | "COD Settlement" | "Rider Payment" | "Commission";
type Transaction = {
  id: string;
  type: TransactionType;
  refId: string;
  amount: number;
  direction: "credit" | "debit";
  at: string;
  note: string;
};

const now = () => new Date().toLocaleString();
const moneyBDT = (n: number) => `৳${n.toLocaleString()}`;

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
  const btnClass = tone === "danger" ? "bg-red-600 text-white" : "bg-green-600 text-white";
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

/** ============================
 *  Reusable Add/Edit Form Modal
 * ============================ */
type EntityType = "merchant" | "hubManager" | "rider" | "adminUser" | "hub";
type FormMode = "create" | "edit";

type FormModalState =
  | { open: false }
  | {
    open: true;
    entity: EntityType;
    mode: FormMode;
    initial?: any;
  };

const FormModal: React.FC<{
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onSubmit: () => void;
  submitText?: string;
  disabled?: boolean;
}> = ({ open, title, children, onClose, onSubmit, submitText = "Save", disabled }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b flex items-center justify-between">
          <div className="font-semibold text-gray-800">{title}</div>
          <button className="text-gray-500 hover:text-gray-800" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
        <div className="p-5 border-t flex justify-end gap-2">
          <button className="px-4 py-2 border rounded" onClick={onClose}>
            Cancel
          </button>
          <button
            className={`px-4 py-2 rounded text-white ${disabled ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"}`}
            onClick={onSubmit}
            disabled={disabled}
          >
            {submitText}
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

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

  // Core mock
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

  const [reports,] = useState<Report[]>([
    { id: "REP1", name: "Daily Summary", date: new Date().toLocaleDateString(), summary: "Parcels: 120, Revenue: ৳15,000" },
    { id: "REP2", name: "Hub Efficiency", date: new Date().toLocaleDateString(), summary: "Avg transfer time: 6.2h" },
  ]);

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

  const initialParcels: Parcel[] = [
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
        { at: now(), hubId: "H002", label: "Picking Up", note: "Rider assigned to pickup" },
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
      customerPhone: "01720000002",
      originHubId: "H001",
      destinationHubId: "H004",
      originDistrict: "Dhaka",
      destinationDistrict: "Sylhet",
      weightKg: 0.8,
      distanceKm: 240,
      codAmount: 1200,
      serviceType: "Express",
      status: "Requested",
      assignedRiderId: "RD003",
      createdAt: now(),
      journey: [
        { at: now(), hubId: "H001", label: "Requested", note: "Order placed by merchant" },
        { at: now(), hubId: "H001", label: "Picking Up", note: "Rider assigned to pickup" },
      ],
    },

    {
      id: "PCL003",
      merchantId: "M003",
      customerName: "Tanvir Ahmed",
      customerPhone: "01830000003",
      originHubId: "H003",
      destinationHubId: "H002",
      originDistrict: "Chattogram",
      destinationDistrict: "Dhaka",
      weightKg: 2.5,
      distanceKm: 260,
      codAmount: 2500,
      serviceType: "Regular",
      status: "Delivered",
      assignedRiderId: "RD001",
      createdAt: now(),
      journey: [
        { at: now(), hubId: "H003", label: "Requested", note: "Pickup requested" },
        { at: now(), hubId: "H003", label: "Picking Up", note: "Rider assigned to pickup" },
        { at: now(), hubId: "H003", label: "Picked Up", note: "Picked up from warehouse" },
        { at: now(), hubId: "H003", label: "At Area Hub", note: "Received at Chattogram hub" },
        { at: now(), hubId: "H002", label: "At District Hub", note: "Arrived at Dhaka hub" },
        { at: now(), label: "Out for Delivery", note: "Assigned to delivery rider" },
        { at: now(), label: "Delivered", note: "Successfully delivered to customer" },
      ],
    },

    {
      id: "PCL004",
      merchantId: "M001",
      customerName: "Farhan Kabir",
      customerPhone: "01940000004",
      originHubId: "H005",
      destinationHubId: "H001",
      originDistrict: "Rajshahi",
      destinationDistrict: "Dhaka",
      weightKg: 3.1,
      distanceKm: 245,
      codAmount: 1800,
      serviceType: "Regular",
      status: "Out for Delivery",
      assignedRiderId: "RD004",
      createdAt: now(),
      journey: [
        { at: now(), hubId: "H005", label: "Requested", note: "Merchant booking created" },
        { at: now(), hubId: "H005", label: "Picking Up", note: "Rider assigned to pickup" },
        { at: now(), hubId: "H005", label: "Picked Up", note: "Pickup completed" },
        { at: now(), hubId: "H005", label: "At Area Hub", note: "Processed at Rajshahi hub" },
        { at: now(), hubId: "H001", label: "At District Hub", note: "Arrived at Dhaka hub" },
        { at: now(), label: "Out for Delivery", note: "Rider heading to customer" },
      ],
    },

    {
      id: "PCL005",
      merchantId: "M004",
      customerName: "Shakib Mahmud",
      customerPhone: "01550000005",
      originHubId: "H004",
      destinationHubId: "H006",
      originDistrict: "Sylhet",
      destinationDistrict: "Khulna",
      weightKg: 1.6,
      distanceKm: 420,
      codAmount: 950,
      serviceType: "Express",
      status: "Requested",
      assignedRiderId: "",
      createdAt: now(),
      journey: [
        { at: now(), hubId: "H004", label: "Requested", note: "Order placed by merchant" },
      ],
    },
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
      status: "At Area Hub",
      assignedRiderId: "RD002",
      createdAt: now(),
      journey: [
        { at: now(), hubId: "H002", label: "Requested", note: "Merchant request created" },
        { at: now(), hubId: "H002", label: "Picking Up", note: "Rider assigned to pickup" },
        { at: now(), hubId: "H002", label: "Picked Up", note: "Picked up from merchant" },
      ],
    },
  ]

  const [disputes,] = useState<Dispute[]>([
    { id: "DSP001", parcelId: "PCL001", openedAt: now(), status: "Open", issue: "Customer claims late delivery" },
  ]);

  const [transactions,] = useState<Transaction[]>([
    { id: "TX001", type: "Merchant Wallet", refId: "M001", amount: 15000, direction: "credit", at: now(), note: "Wallet top-up" },
  ]);

  // shared UI
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

  // NEW: form modal state
  const [formModal, setFormModal] = useState<FormModalState>({ open: false });

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

  const menuItems: { id: ModuleId; label: string; icon: any }[] = [
    { id: "overview", label: "Dashboard", icon: TrendingUp },
    { id: "user-management", label: "User Management", icon: Users },
    { id: "hub-management", label: "Hub Management", icon: Layers },
    { id: "parcel-management", label: "Parcel Management", icon: Package },
    { id: "pricing-settings", label: "Pricing & Settings", icon: Banknote },
    { id: "reports-analytics", label: "Reports & Analytics", icon: Activity },
    { id: "financial-management", label: "Financial", icon: Wallet },
    { id: "system-settings", label: "System Settings", icon: Settings },
  ];

  /** ======================
   *  Add/Edit Form Handlers
   * ====================== */
  const openCreate = (entity: EntityType) => setFormModal({ open: true, entity, mode: "create" });
  const openEdit = (entity: EntityType, initial: any) => setFormModal({ open: true, entity, mode: "edit", initial });
  const closeForm = () => setFormModal({ open: false });

  // Form draft values
  const [draft, setDraft] = useState<any>({});

  // Initialize draft when modal opens
  useEffect(() => {
    if (!formModal.open) return;
    const { entity, mode, initial } = formModal;
    const base =
      entity === "merchant"
        ? { id: "", name: "", shopName: "", phone: "", status: "Pending" as Merchant["status"] }
        : entity === "hubManager"
          ? { id: "", name: "", hubId: hubs[0]?.id ?? "", phone: "", status: "Active" as HubManager["status"] }
          : entity === "rider"
            ? { id: "", name: "", hubId: hubs[0]?.id ?? "", area: "", phone: "", status: "Available" as Rider["status"] }
            : entity === "adminUser"
              ? { id: "", name: "", email: "", role: "Support" as User["role"], status: "Active" as User["status"] }
              : {
                id: "",
                name: "",
                location: "",
                district: "",
                type: "area" as Hub["type"],
                parentHubId: hubs.find((h) => h.type === "district")?.id ?? null,
                capacity: 2000,
                coverageAreasText: "", // UI-only
                status: "Active" as Hub["status"],
              };

    if (mode === "edit" && initial) {
      if (entity === "hub") {
        setDraft({
          ...base,
          ...initial,
          coverageAreasText: Array.isArray(initial.coverageAreas) ? initial.coverageAreas.join(", ") : "",
        });
      } else {
        setDraft({ ...base, ...initial });
      }
      return;
    }

    // create mode auto id suggestion (still editable)
    const nextId = (() => {
      if (entity === "merchant") return `M${String(merchants.length + 1).padStart(3, "0")}`;
      if (entity === "hubManager") return `HM${String(hubManagers.length + 1).padStart(3, "0")}`;
      if (entity === "rider") return `RD${String(ridersList.length + 1).padStart(3, "0")}`;
      if (entity === "adminUser") return `U${String(users.length + 1).padStart(3, "0")}`;
      return `H${String(hubs.length + 1).padStart(3, "0")}`;
    })();

    setDraft({ ...base, id: nextId });
  }, [formModal.open]); // eslint-disable-line react-hooks/exhaustive-deps

  const validateDraft = () => {
    if (!formModal.open) return false;
    const { entity } = formModal;
    if (!draft?.id || !draft?.name) return false;

    if (entity === "merchant") return !!draft.shopName;
    if (entity === "hubManager") return !!draft.hubId;
    if (entity === "rider") return !!draft.hubId && !!draft.area;
    if (entity === "adminUser") return !!draft.email && !!draft.role;
    if (entity === "hub") return !!draft.location && !!draft.district && !!draft.type && !!draft.capacity;
    return true;
  };

  const upsertEntity = () => {
    if (!formModal.open) return;
    const { entity, mode } = formModal;

    if (!validateDraft()) {
      alert("Please fill required fields.");
      return;
    }

    if (entity === "merchant") {
      const payload: Merchant = {
        id: String(draft.id).trim(),
        name: String(draft.name).trim(),
        shopName: String(draft.shopName).trim(),
        phone: draft.phone ? String(draft.phone).trim() : undefined,
        status: draft.status,
      };
      setMerchants((prev) => {
        if (mode === "edit") return prev.map((m) => (m.id === payload.id ? payload : m));
        return [payload, ...prev];
      });
      setLogs((p) => [{ at: now(), level: "info", message: `${mode === "edit" ? "Updated" : "Created"} merchant ${payload.id}` }, ...p]);
    }

    if (entity === "hubManager") {
      const payload: HubManager = {
        id: String(draft.id).trim(),
        name: String(draft.name).trim(),
        hubId: String(draft.hubId),
        phone: draft.phone ? String(draft.phone).trim() : undefined,
        status: draft.status,
      };
      setHubManagers((prev) => {
        if (mode === "edit") return prev.map((m) => (m.id === payload.id ? payload : m));
        return [payload, ...prev];
      });
      setLogs((p) => [{ at: now(), level: "info", message: `${mode === "edit" ? "Updated" : "Created"} hub manager ${payload.id}` }, ...p]);
    }

    if (entity === "rider") {
      const payload: Rider = {
        id: String(draft.id).trim(),
        name: String(draft.name).trim(),
        hubId: String(draft.hubId),
        area: String(draft.area).trim(),
        phone: draft.phone ? String(draft.phone).trim() : undefined,
        status: draft.status,
      };
      setRidersList((prev) => {
        if (mode === "edit") return prev.map((r) => (r.id === payload.id ? payload : r));
        return [payload, ...prev];
      });
      setLogs((p) => [{ at: now(), level: "info", message: `${mode === "edit" ? "Updated" : "Created"} rider ${payload.id}` }, ...p]);
    }

    if (entity === "adminUser") {
      const payload: User = {
        id: String(draft.id).trim(),
        name: String(draft.name).trim(),
        email: String(draft.email).trim(),
        role: draft.role,
        status: draft.status,
        lastLogin: draft.lastLogin ?? now(),
      };
      setUsers((prev) => {
        if (mode === "edit") return prev.map((u) => (u.id === payload.id ? payload : u));
        return [payload, ...prev];
      });
      setLogs((p) => [{ at: now(), level: "info", message: `${mode === "edit" ? "Updated" : "Created"} admin user ${payload.id}` }, ...p]);
    }

    if (entity === "hub") {
      const coverage = String(draft.coverageAreasText ?? "")
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);

      const payload: Hub = {
        id: String(draft.id).trim(),
        name: String(draft.name).trim(),
        location: String(draft.location).trim(),
        district: String(draft.district).trim(),
        type: draft.type,
        parentHubId: draft.type === "area" ? (draft.parentHubId ? String(draft.parentHubId) : null) : null,
        capacity: Number(draft.capacity || 0),
        coverageAreas: coverage,
        status: draft.status,
      };

      setHubs((prev) => {
        if (mode === "edit") return prev.map((h) => (h.id === payload.id ? payload : h));
        return [payload, ...prev];
      });

      setLogs((p) => [{ at: now(), level: "info", message: `${mode === "edit" ? "Updated" : "Created"} hub ${payload.id}` }, ...p]);
    }

    closeForm();
  };

  /** ======================
   *  1) Overview
   * ====================== */
  const OverviewModule: React.FC = () => {
    const kpis = useMemo(() => {
      const totalParcels = initialParcels.length;
      const delivered = initialParcels.filter((p) => p.status === "Delivered").length;
      const activeUsers = users.filter((u) => u.status === "Active").length + ridersList.filter((r) => r.status !== "Suspended").length;
      const revenue = initialParcels.reduce((acc, p) => acc + estimateParcelFare(p), 0);
      const disputesOpen = disputes.filter((d) => d.status === "Open").length;
      const hubActive = hubs.filter((h) => h.status === "Active").length;
      return { totalParcels, delivered, activeUsers, revenue, disputesOpen, hubActive };
    }, [initialParcels, users, ridersList, disputes, hubs]);

    const trend = useMemo(() => [18, 22, 19, 26, 31, 28, 35], []);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
            <p className="text-sm text-gray-500 mt-1">Real-time overview across all hubs</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setActiveModule("reports-analytics")} className="px-3 py-2 rounded border bg-white flex items-center gap-2">
              <Download size={16} /> Export (CSV)
            </button>
            <button onClick={() => setActiveModule("parcel-management")} className="px-3 py-2 rounded bg-green-600 text-white flex items-center gap-2">
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

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">System Logs</h2>
            <button onClick={() => exportCSV("system-logs", logs)} className="px-3 py-2 border rounded flex items-center gap-2">
              <Download size={14} /> Export
            </button>
          </div>
          <div className="space-y-2 max-h-80 overflow-auto">
            {logs.map((l, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded border">
                <div className="text-xs text-gray-500">{l.at} • {l.level.toUpperCase()}</div>
                <div className="text-sm text-gray-800">{l.message}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  /** ======================
   *  2) User Management (ADD + EDIT)
   * ====================== */
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
      if (activeTab === "merchants") return merchants.map((m) => ({ ...m, _entity: "merchant" as const }));
      if (activeTab === "hubManagers") return hubManagers.map((hm) => ({ ...hm, hub: hubNameById(hm.hubId), _entity: "hubManager" as const }));
      if (activeTab === "riders") return ridersList.map((r) => ({ ...r, hub: hubNameById(r.hubId), _entity: "rider" as const }));
      return users.map((u) => ({ ...u, _entity: "adminUser" as const }));
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

    const bulkApproveMerchants = () => {
      if (!selectedIds.length) return;
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

    const openAddForTab = () => {
      if (activeTab === "merchants") openCreate("merchant");
      if (activeTab === "hubManagers") openCreate("hubManager");
      if (activeTab === "riders") openCreate("rider");
      if (activeTab === "admins") openCreate("adminUser");
    };

    const openEditForRow = (row: any) => {
      if (row._entity === "merchant") openEdit("merchant", row);
      if (row._entity === "hubManager") openEdit("hubManager", row);
      if (row._entity === "rider") openEdit("rider", row);
      if (row._entity === "adminUser") openEdit("adminUser", row);
    };

    return (
      <TableShell
        title="User Management"
        subtitle="Now includes Add/Edit forms (modal) instead of auto-adding"
        right={
          <>
            <div className="flex items-center bg-gray-50 rounded px-3 py-2 gap-2">
              <Search size={16} />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search..." className="bg-transparent outline-none text-sm w-48" />
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

            <button onClick={openAddForTab} className="px-3 py-2 rounded bg-green-600 text-white flex items-center gap-2">
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
                    onConfirm: bulkApproveMerchants,
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
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`px-3 py-2 rounded ${activeTab === t.id ? "bg-green-600 text-white" : "bg-gray-100"}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-sm text-gray-600">
                  <input type="checkbox" onChange={selectAllVisible} checked={paginated.every((p: any) => selectedIds.includes(p.id)) && paginated.length > 0} />
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
                    {activeTab === "merchants" && <div>{row.shopName} • {row.phone ?? "—"}</div>}
                    {activeTab === "hubManagers" && <div>{row.hub} • {row.phone ?? "—"}</div>}
                    {activeTab === "riders" && <div>{row.hub} • {row.area}</div>}
                    {activeTab === "admins" && <div>{row.email} • {row.role}</div>}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-700">
                    <Pill tone={statusTone(row.status)}>{row.status}</Pill>
                  </td>
                  <td className="px-3 py-2 text-sm">
                    <div className="flex items-center gap-3">
                      <button onClick={() => setDetailModal({ type: activeTab, row })} className="text-blue-600">
                        View
                      </button>
                      <button onClick={() => openEditForRow(row)} className="text-green-700 inline-flex items-center gap-1">
                        <Pencil size={14} /> Edit
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
          <div className="text-sm text-gray-600">Showing {paginated.length} of {filtered.length} items</div>
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
          <div className="font-semibold text-gray-800 flex items-center gap-2">
            <ShieldCheck size={16} /> Role & Permission Control (static list)
          </div>
          <div className="text-sm text-gray-600 mt-1">{roles.map((r) => r.name).join(", ")}</div>
        </div>
      </TableShell>
    );
  };

  /** ======================
   *  3) Hub Management (ADD + EDIT)
   * ====================== */
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
      setLogs((prev) => [{ at: now(), level: "warn", message: `Deleted hubs: ${selectedIds.join(", ")}` }, ...prev]);
      setSelectedIds([]);
    };

    const hubKpis = useMemo(() => {
      const active = hubs.filter((h) => h.status === "Active").length;
      const districtHubs = hubs.filter((h) => h.type === "district").length;
      const areaHubs = hubs.filter((h) => h.type === "area").length;
      const avgCapacity = hubs.length ? Math.round(hubs.reduce((a, h) => a + h.capacity, 0) / hubs.length) : 0;
      return { active, districtHubs, areaHubs, avgCapacity };
    }, [hubs]);

    return (
      <TableShell
        title="Hub Management"
        subtitle="Now includes Add/Edit hub forms (modal)."
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

            <button onClick={() => openCreate("hub")} className="px-3 py-2 rounded bg-green-600 text-white flex items-center gap-2">
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
                <div className="font-semibold text-gray-800">Coverage Area Management</div>
                <div className="text-sm text-gray-600 mt-1">Add/remove coverage areas (static)</div>
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
                        <div className="flex items-center gap-3">
                          <button onClick={() => setDetailModal({ type: "hub", row: h })} className="text-blue-600">
                            View
                          </button>
                          <button onClick={() => openEdit("hub", h)} className="text-green-700 inline-flex items-center gap-1">
                            <Pencil size={14} /> Edit
                          </button>
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
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-2 py-1 border rounded">
                  Prev
                </button>
                <div className="px-3 py-1 border rounded">{page} / {totalPages}</div>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="px-2 py-1 border rounded">
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </TableShell>
    );
  };

  /** ======================
   *  4) Parcel Management (kept)
   * ====================== */
  const ParcelManagementModule: React.FC = () => {
    const [selectedRider, setSelectedRider] = useState("");
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);
    const [parcels, setParcels] = useState<Parcel[]>(initialParcels);
    const [q, setQ] = useState("");
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
        if (!s) return true;
        return Object.values(p).some((v) => String(v).toLowerCase().includes(s));
      });
    }, [rows, q]);
    const handleAssignRider = () => {
      setParcels((prev) => {
        return prev.map((p) => {
          if (p.id !== selectedParcel?.id) return p;

          return {
            ...p,
            status: "Picking Up",
            assignedRiderId: selectedRider,
            journey: [
              ...p.journey,
              {
                at: now(),
                hubId: p.originHubId,
                label: "Picking Up",
                note: "Pickup rider assigned by admin",
              },
            ],
          };
        })
      }

      );

      setAssignModalOpen(false);
      setSelectedRider("");
    };

    return (
      <TableShell
        title="Parcel Management"
        subtitle="(Static) Track parcels + disputes"
        right={
          <>
            <div className="flex items-center bg-gray-50 rounded px-3 py-2 gap-2">
              <Search size={16} />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search parcels..." className="bg-transparent outline-none text-sm w-56" />
            </div>
            <button onClick={() => exportCSV("parcels", filtered)} className="px-3 py-2 rounded border flex items-center gap-2">
              <Download size={14} /> Export
            </button>
          </>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-sm text-gray-600">Parcel</th>
                <th className="px-3 py-2 text-left text-sm text-gray-600">Merchant</th>
                <th className="px-3 py-2 text-left text-sm text-gray-600">Route</th>
                <th className="px-3 py-2 text-left text-sm text-gray-600">Est. Fare</th>
                <th className="px-3 py-2 text-left text-sm text-gray-600">Status</th>
                <th className="px-3 py-2 text-left text-sm text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y">
              {filtered.map((p: any) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div className="font-semibold text-gray-800">{p.id}</div>
                    <div className="text-xs text-gray-500">{p.customerName} • {p.customerPhone}</div>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-700">{p.merchant}</td>
                  <td className="px-3 py-2 text-sm text-gray-700">{p.originHub} → {p.destinationHub}</td>
                  <td className="px-3 py-2 text-sm text-gray-700">{moneyBDT(p.estFare)}</td>
                  <td className="px-3 py-2 text-sm text-gray-700">{p.status}</td>
                  <td className="px-3 py-2 text-sm">
                    <button onClick={() => setDetailModal({ type: "parcel", row: p })} className="text-blue-600">
                      Track
                    </button>
                    {p.status === "Requested" && (
                      <button
                        onClick={() => {
                          setSelectedParcel(p);
                          setAssignModalOpen(true);
                        }}
                        className="text-green-600 font-medium ml-4"
                      >
                        Assign Rider
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-sm text-gray-500">
                    No parcels found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {assignModalOpen && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg w-full max-w-md p-6 space-y-4">
                <h2 className="text-lg font-semibold">
                  Assign Pickup Rider
                </h2>

                <div className="text-sm text-gray-600">
                  Parcel ID: <span className="font-medium">{selectedParcel?.id}</span>
                </div>

                <select
                  value={selectedRider}
                  onChange={(e) => setSelectedRider(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Select Rider</option>
                  <option value="RD001">Rider 1</option>
                  <option value="RD002">Rider 2</option>
                  <option value="RD003">Rider 3</option>
                  <option value="RD004">Rider 4</option>
                </select>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => {
                      setAssignModalOpen(false);
                      setSelectedRider("");
                    }}
                    className="px-4 py-2 border rounded"
                  >
                    Cancel
                  </button>

                  <button
                    disabled={!selectedRider}
                    onClick={() => handleAssignRider()}
                    className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
                  >
                    Assign
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </TableShell>
    );
  };

  /** ======================
   *  5) Pricing & Settings (already a form)
   * ====================== */
  const PricingSettingsModule: React.FC = () => {
    const [local, setLocal] = useState(pricing);
    useEffect(() => setLocal(pricing), [pricing]);

    return (
      <TableShell
        title="Pricing & Settings"
        subtitle="Pricing rules form"
        right={
          <button
            onClick={() => {
              setPricing(local);
              setLogs((prev) => [{ at: now(), level: "info", message: "Updated pricing configuration" }, ...prev]);
            }}
            className="px-3 py-2 rounded bg-green-600 text-white"
          >
            Save
          </button>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { key: "baseFare", label: "Base Fare (৳)" },
            { key: "perKg", label: "Per KG (৳/kg)" },
            { key: "perKm", label: "Per KM (৳/km)" },
            { key: "codPct", label: "COD Charge (%)" },
            { key: "serviceAreaSurcharge", label: "Service Area Surcharge (৳)" },
            { key: "expressMultiplier", label: "Express Multiplier (x)" },
          ].map((f) => (
            <label key={f.key} className="text-sm bg-white border rounded p-3">
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

        <div className="bg-gray-50 border rounded p-4">
          <div className="font-semibold text-gray-800">Service Types</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {serviceTypes.map((s) => (
              <span key={s} className="inline-flex items-center gap-2 px-2 py-1 border rounded bg-white text-sm">
                {s}
                <button onClick={() => setServiceTypes((prev) => prev.filter((x) => x !== s))} className="text-red-600">
                  <X size={14} />
                </button>
              </span>
            ))}
            <button onClick={() => setServiceTypes((prev) => [...prev, `Type ${prev.length + 1}`])} className="px-3 py-1 border rounded text-sm">
              + Add
            </button>
          </div>
        </div>
      </TableShell>
    );
  };

  /** ======================
   *  6) Reports & Analytics (kept simple)
   * ====================== */
  const ReportsAnalyticsModule: React.FC = () => (
    <TableShell title="Reports & Analytics" subtitle="Static reports list" right={<button onClick={() => exportCSV("reports", reports)} className="px-3 py-2 border rounded flex items-center gap-2"><Download size={14} /> Export</button>}>
      <div className="space-y-3">
        {reports.map((r) => (
          <div key={r.id} className="p-4 bg-gray-50 rounded-lg flex items-center justify-between border">
            <div>
              <div className="font-medium text-gray-800">{r.name}</div>
              <div className="text-sm text-gray-600">{r.date} • {r.summary}</div>
            </div>
            <button className="px-3 py-2 border rounded" onClick={() => exportCSV(r.id, [r])}>Export</button>
          </div>
        ))}
      </div>
    </TableShell>
  );

  /** ======================
   *  7) Financial Management (kept)
   * ====================== */
  const FinancialManagementModule: React.FC = () => (
    <TableShell title="Financial Management" subtitle="Static transactions" right={<button onClick={() => exportCSV("transactions", transactions)} className="px-3 py-2 border rounded flex items-center gap-2"><Download size={14} /> Export</button>}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-sm text-gray-600">ID</th>
              <th className="px-3 py-2 text-left text-sm text-gray-600">Type</th>
              <th className="px-3 py-2 text-left text-sm text-gray-600">Ref</th>
              <th className="px-3 py-2 text-left text-sm text-gray-600">Amount</th>
              <th className="px-3 py-2 text-left text-sm text-gray-600">At</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y">
            {transactions.map((t) => (
              <tr key={t.id}>
                <td className="px-3 py-2 font-semibold">{t.id}</td>
                <td className="px-3 py-2">{t.type}</td>
                <td className="px-3 py-2">{t.refId}</td>
                <td className="px-3 py-2">{moneyBDT(t.amount)}</td>
                <td className="px-3 py-2">{t.at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </TableShell>
  );

  /** ======================
   *  8) System Settings (kept)
   * ====================== */
  const SystemSettingsModule: React.FC = () => {
    const [maintenance, setMaintenance] = useState(false);
    const [inviteOnly, setInviteOnly] = useState(false);
    const [emailNotif, setEmailNotif] = useState(true);
    const [smsNotif, setSmsNotif] = useState(true);

    return (
      <TableShell
        title="System Settings"
        subtitle="General + notifications + coverage/service types"
        right={
          <button
            onClick={() => {
              setLogs((prev) => [{ at: now(), level: "info", message: "System settings saved (static)" }, ...prev]);
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
              <input type="checkbox" checked={maintenance} onChange={() => setMaintenance((s) => !s)} />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
              <div>
                <div className="font-medium text-gray-800">Invite Only</div>
                <div className="text-sm text-gray-600">Only invited users can register</div>
              </div>
              <input type="checkbox" checked={inviteOnly} onChange={() => setInviteOnly((s) => !s)} />
            </div>
          </div>

          <div className="bg-white border rounded p-4 space-y-3">
            <div className="font-semibold text-gray-800 flex items-center gap-2"><Bell size={16} /> Notifications</div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
              <div>
                <div className="font-medium text-gray-800">Email Notifications</div>
                <div className="text-sm text-gray-600">Parcel updates, disputes, settlements</div>
              </div>
              <input type="checkbox" checked={emailNotif} onChange={() => setEmailNotif((s) => !s)} />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
              <div>
                <div className="font-medium text-gray-800">SMS Notifications</div>
                <div className="text-sm text-gray-600">Delivery OTP, pickup alerts</div>
              </div>
              <input type="checkbox" checked={smsNotif} onChange={() => setSmsNotif((s) => !s)} />
            </div>
          </div>
        </div>
      </TableShell>
    );
  };

  const renderModule = () => {
    switch (activeModule) {
      case "overview":
        return <OverviewModule />;
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

  /** ======================
   *  Detail Modal (unchanged simple)
   * ====================== */
  const DetailModal = () => {
    if (!detailModal) return null;
    const title = `Details — ${detailModal?.row?.name ?? detailModal?.row?.id ?? ""}`;
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setDetailModal(null)}>
        <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            <button onClick={() => setDetailModal(null)} className="text-gray-500 hover:text-gray-800">
              <X size={20} />
            </button>
          </div>
          {detailModal?.type === "parcel" ? (
            <ParcelDetailView parcel={detailModal.row} />
          ) : <pre className="text-xs bg-gray-50 border rounded p-3 overflow-auto max-h-96">{JSON.stringify(detailModal.row, null, 2)}</pre>
          }

          <div className="mt-4 flex justify-end">
            <button onClick={() => setDetailModal(null)} className="px-4 py-2 border rounded">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  /** ======================
   *  Form modal content (dynamic by entity)
   * ====================== */
  const FormModalContent = () => {
    if (!formModal.open) return null;
    const { entity, mode } = formModal;

    const title =
      mode === "create"
        ? `Add ${entity === "adminUser" ? "Admin User" : entity === "hubManager" ? "Hub Manager" : entity === "merchant" ? "Merchant" : entity === "rider" ? "Rider" : "Hub"}`
        : `Edit ${entity === "adminUser" ? "Admin User" : entity === "hubManager" ? "Hub Manager" : entity === "merchant" ? "Merchant" : entity === "rider" ? "Rider" : "Hub"}`;

    const disabled = !validateDraft();

    return (
      <FormModal
        open={formModal.open}
        title={title}
        onClose={closeForm}
        onSubmit={upsertEntity}
        submitText={mode === "create" ? "Create" : "Update"}
        disabled={disabled}
      >
        {/* Common */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="text-sm">
            <div className="text-xs text-gray-600 mb-1">ID *</div>
            <input
              className="w-full px-3 py-2 border rounded"
              value={draft.id ?? ""}
              onChange={(e) => setDraft((p: any) => ({ ...p, id: e.target.value }))}
              disabled={mode === "edit"} // keep id fixed on edit
            />
            {mode === "edit" && <div className="text-xs text-gray-500 mt-1">ID cannot be changed.</div>}
          </label>

          <label className="text-sm">
            <div className="text-xs text-gray-600 mb-1">Name *</div>
            <input className="w-full px-3 py-2 border rounded" value={draft.name ?? ""} onChange={(e) => setDraft((p: any) => ({ ...p, name: e.target.value }))} />
          </label>

          {/* Merchant */}
          {entity === "merchant" && (
            <>
              <label className="text-sm">
                <div className="text-xs text-gray-600 mb-1">Shop Name *</div>
                <input className="w-full px-3 py-2 border rounded" value={draft.shopName ?? ""} onChange={(e) => setDraft((p: any) => ({ ...p, shopName: e.target.value }))} />
              </label>

              <label className="text-sm">
                <div className="text-xs text-gray-600 mb-1">Phone</div>
                <input className="w-full px-3 py-2 border rounded" value={draft.phone ?? ""} onChange={(e) => setDraft((p: any) => ({ ...p, phone: e.target.value }))} />
              </label>

              <label className="text-sm md:col-span-2">
                <div className="text-xs text-gray-600 mb-1">Status</div>
                <select className="w-full px-3 py-2 border rounded" value={draft.status} onChange={(e) => setDraft((p: any) => ({ ...p, status: e.target.value }))}>
                  {(["Pending", "Verified", "Suspended"] as Merchant["status"][]).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>
            </>
          )}

          {/* Hub Manager */}
          {entity === "hubManager" && (
            <>
              <label className="text-sm">
                <div className="text-xs text-gray-600 mb-1">Hub *</div>
                <select className="w-full px-3 py-2 border rounded" value={draft.hubId} onChange={(e) => setDraft((p: any) => ({ ...p, hubId: e.target.value }))}>
                  {hubs.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm">
                <div className="text-xs text-gray-600 mb-1">Phone</div>
                <input className="w-full px-3 py-2 border rounded" value={draft.phone ?? ""} onChange={(e) => setDraft((p: any) => ({ ...p, phone: e.target.value }))} />
              </label>

              <label className="text-sm md:col-span-2">
                <div className="text-xs text-gray-600 mb-1">Status</div>
                <select className="w-full px-3 py-2 border rounded" value={draft.status} onChange={(e) => setDraft((p: any) => ({ ...p, status: e.target.value }))}>
                  {(["Active", "Suspended"] as HubManager["status"][]).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>
            </>
          )}

          {/* Rider */}
          {entity === "rider" && (
            <>
              <label className="text-sm">
                <div className="text-xs text-gray-600 mb-1">Hub *</div>
                <select className="w-full px-3 py-2 border rounded" value={draft.hubId} onChange={(e) => setDraft((p: any) => ({ ...p, hubId: e.target.value }))}>
                  {hubs.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm">
                <div className="text-xs text-gray-600 mb-1">Area *</div>
                <input className="w-full px-3 py-2 border rounded" value={draft.area ?? ""} onChange={(e) => setDraft((p: any) => ({ ...p, area: e.target.value }))} />
              </label>

              <label className="text-sm">
                <div className="text-xs text-gray-600 mb-1">Phone</div>
                <input className="w-full px-3 py-2 border rounded" value={draft.phone ?? ""} onChange={(e) => setDraft((p: any) => ({ ...p, phone: e.target.value }))} />
              </label>

              <label className="text-sm">
                <div className="text-xs text-gray-600 mb-1">Status</div>
                <select className="w-full px-3 py-2 border rounded" value={draft.status} onChange={(e) => setDraft((p: any) => ({ ...p, status: e.target.value }))}>
                  {(["Available", "On Delivery", "Suspended"] as Rider["status"][]).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>
            </>
          )}

          {/* Admin User */}
          {entity === "adminUser" && (
            <>
              <label className="text-sm">
                <div className="text-xs text-gray-600 mb-1">Email *</div>
                <input className="w-full px-3 py-2 border rounded" value={draft.email ?? ""} onChange={(e) => setDraft((p: any) => ({ ...p, email: e.target.value }))} />
              </label>

              <label className="text-sm">
                <div className="text-xs text-gray-600 mb-1">Role *</div>
                <select className="w-full px-3 py-2 border rounded" value={draft.role} onChange={(e) => setDraft((p: any) => ({ ...p, role: e.target.value }))}>
                  {(["Admin", "Manager", "Support"] as User["role"][]).map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </label>

              <label className="text-sm md:col-span-2">
                <div className="text-xs text-gray-600 mb-1">Status</div>
                <select className="w-full px-3 py-2 border rounded" value={draft.status} onChange={(e) => setDraft((p: any) => ({ ...p, status: e.target.value }))}>
                  {(["Active", "Suspended"] as User["status"][]).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>
            </>
          )}

          {/* Hub */}
          {entity === "hub" && (
            <>
              <label className="text-sm">
                <div className="text-xs text-gray-600 mb-1">District *</div>
                <input className="w-full px-3 py-2 border rounded" value={draft.district ?? ""} onChange={(e) => setDraft((p: any) => ({ ...p, district: e.target.value }))} />
              </label>

              <label className="text-sm">
                <div className="text-xs text-gray-600 mb-1">Location *</div>
                <input className="w-full px-3 py-2 border rounded" value={draft.location ?? ""} onChange={(e) => setDraft((p: any) => ({ ...p, location: e.target.value }))} />
              </label>

              <label className="text-sm">
                <div className="text-xs text-gray-600 mb-1">Hub Type *</div>
                <select className="w-full px-3 py-2 border rounded" value={draft.type} onChange={(e) => setDraft((p: any) => ({ ...p, type: e.target.value }))}>
                  <option value="district">district</option>
                  <option value="area">area</option>
                </select>
              </label>

              <label className="text-sm">
                <div className="text-xs text-gray-600 mb-1">Capacity *</div>
                <input type="number" className="w-full px-3 py-2 border rounded" value={draft.capacity ?? 0} onChange={(e) => setDraft((p: any) => ({ ...p, capacity: Number(e.target.value) }))} />
              </label>

              {draft.type === "area" && (
                <label className="text-sm md:col-span-2">
                  <div className="text-xs text-gray-600 mb-1">Parent District Hub</div>
                  <select className="w-full px-3 py-2 border rounded" value={draft.parentHubId ?? ""} onChange={(e) => setDraft((p: any) => ({ ...p, parentHubId: e.target.value || null }))}>
                    <option value="">—</option>
                    {hubs.filter((h) => h.type === "district").map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              <label className="text-sm md:col-span-2">
                <div className="text-xs text-gray-600 mb-1">Coverage Areas (comma separated)</div>
                <input className="w-full px-3 py-2 border rounded" value={draft.coverageAreasText ?? ""} onChange={(e) => setDraft((p: any) => ({ ...p, coverageAreasText: e.target.value }))} />
                <div className="text-xs text-gray-500 mt-1">Example: Gulshan, Banani, Dhanmondi</div>
              </label>

              <label className="text-sm md:col-span-2">
                <div className="text-xs text-gray-600 mb-1">Status</div>
                <select className="w-full px-3 py-2 border rounded" value={draft.status} onChange={(e) => setDraft((p: any) => ({ ...p, status: e.target.value }))}>
                  {(["Active", "Inactive"] as Hub["status"][]).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>
            </>
          )}
        </div>

        <div className="mt-4 text-xs text-gray-500">
          Required fields are marked with * . Submit button activates when required fields are filled.
        </div>
      </FormModal>
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
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeModule === item.id ? "bg-green-800" : "hover:bg-green-500"
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
        <FormModalContent />

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

