import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Truck,
  Users,
  Menu,
  X,
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowRight,
  ScanLine,
  ClipboardList,
  Send,
  UserCheck,
  Home,
} from "lucide-react";

/**
 * Hub Manager Dashboard (Single-file demo)
 * - Incoming -> Receive/Process into Inventory
 * - Inventory -> Create outgoing jobs (transfer / last-mile)
 * - Outgoing -> Assign rider / Dispatch
 * - Riders -> Rider details
 *
 * Replace mock data + handlers with API calls later.
 */

const nowTime = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const uid = () => `PCL${Math.floor(1000 + Math.random() * 9000)}`;

const statusPill = (status: string) => {
  const base = "px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full";
  if (["Arrived", "In Hub", "Delivered"].includes(status))
    return `${base} bg-green-100 text-green-800`;
  if (["Arriving", "Ready"].includes(status)) return `${base} bg-blue-100 text-blue-800`;
  if (["Not Picked", "Pending Transfer"].includes(status))
    return `${base} bg-yellow-100 text-yellow-800`;
  if (["Dispatched", "On Delivery"].includes(status))
    return `${base} bg-purple-100 text-purple-800`;
  return `${base} bg-gray-100 text-gray-800`;
};

type Log = { at: string; note: string; status: string };

type IncomingParcel = {
  id: string;
  origin?: string;
  destination?: string;
  status: string;
  eta?: string;
  rider?: string;
  weight?: string;
  type?: string;
  logs?: Log[];
};

type InventoryParcel = {
  id: string;
  origin?: string;
  destination?: string;
  status: string;
  receivedAt?: string;
  weight?: string;
  nextHop?: string;
  routeType?: string;
  logs?: Log[];
};

type OutgoingParcel = {
  id: string;
  destination?: string;
  status: string;
  assignedTo?: string;
  weight?: string;
  routeType?: string;
  nextHop?: string;
  logs?: Log[];
};

type Parcel = IncomingParcel | InventoryParcel | OutgoingParcel;

type Rider = { id: string; name: string; status: string; parcels: number; area: string; phone?: string };

type Toast = { msg: string; type?: "success" | "error" } | null;

type ModalProps = { title: string; children: React.ReactNode; onClose: () => void; footer?: React.ReactNode };

const Modal: React.FC<ModalProps> = ({ title, children, onClose, footer }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 overflow-hidden">
      <div className="p-5 border-b flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        <button onClick={onClose} className="p-2 rounded-md hover:bg-gray-100">
          <X size={18} />
        </button>
      </div>
      <div className="p-5">{children}</div>
      {footer && <div className="p-5 border-t bg-gray-50">{footer}</div>}
    </div>
  </div>
);

const HubManagerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const HUB_NAME = "Dhaka Central Hub";

  const [activeModule, setActiveModule] = useState<string>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  // ------------------------------
  // DATA (mock)
  // ------------------------------
  const [incomingParcels, setIncomingParcels] = useState<IncomingParcel[]>([
    {
      id: "PCL001",
      origin: "Gulshan Hub",
      destination: "Mirpur Hub",
      status: "Arriving",
      eta: "2:30 PM",
      rider: "Karim",
      weight: "1.1kg",
      type: "Hub Transfer",
      logs: [{ at: "10:10 AM", note: "Created", status: "Arriving" }],
    },
    {
      id: "PCL002",
      origin: "Dhanmondi Hub",
      destination: "Uttara Hub",
      status: "Arrived",
      eta: "1:15 PM",
      rider: "Rahim",
      weight: "2.0kg",
      type: "Hub Transfer",
      logs: [{ at: "11:45 AM", note: "Arrived at gate", status: "Arrived" }],
    },
    {
      id: "PCL003",
      origin: "Chattogram District",
      destination: "Dhaka Central",
      status: "Not Picked",
      eta: "4:00 PM",
      rider: "Jalal",
      weight: "3.2kg",
      type: "District Transfer",
      logs: [{ at: "9:20 AM", note: "Left district hub", status: "Not Picked" }],
    },
  ]);

  // Inventory means physically in this hub warehouse (sorted/scanned)
  const [inventoryParcels, setInventoryParcels] = useState<InventoryParcel[]>([
    {
      id: "PCL100",
      origin: "Barishal District",
      destination: "Dhaka Central",
      status: "In Hub",
      receivedAt: "12:30 PM",
      weight: "0.8kg",
      nextHop: "Mirpur Hub",
      routeType: "To Destination Hub",
      logs: [{ at: "12:30 PM", note: "Received into inventory", status: "In Hub" }],
    },
  ]);

  const [outgoingParcels, setOutgoingParcels] = useState<OutgoingParcel[]>([
    {
      id: "PCL004",
      destination: "Sylhet District",
      status: "Ready",
      assignedTo: "Unassigned",
      weight: "2.5kg",
      routeType: "To District Hub",
      nextHop: "Dhaka District Hub",
      logs: [{ at: "1:10 PM", note: "Prepared for dispatch", status: "Ready" }],
    },
    {
      id: "PCL005",
      destination: "Khulna Hub",
      status: "Dispatched",
      assignedTo: "Rider-05",
      weight: "1.2kg",
      routeType: "To Destination Hub",
      nextHop: "Khulna Hub",
      logs: [{ at: "2:00 PM", note: "Dispatched", status: "Dispatched" }],
    },
    {
      id: "PCL006",
      destination: "Rajshahi District",
      status: "Ready",
      assignedTo: "Unassigned",
      weight: "3.0kg",
      routeType: "To District Hub",
      nextHop: "Dhaka District Hub",
      logs: [{ at: "2:20 PM", note: "Prepared for dispatch", status: "Ready" }],
    },
  ]);

  const [riders, setRiders] = useState<Rider[]>([
    { id: "R001", name: "Karim Ahmed", status: "Available", parcels: 0, area: "Gulshan-Banani", phone: "01XXXXXXXXX" },
    { id: "R002", name: "Rahim Uddin", status: "On Delivery", parcels: 3, area: "Dhanmondi-Mohammadpur", phone: "01XXXXXXXXX" },
    { id: "R003", name: "Jalal Miah", status: "Available", parcels: 0, area: "Mirpur-Pallabi", phone: "01XXXXXXXXX" },
    { id: "R004", name: "Sabbir Khan", status: "On Delivery", parcels: 2, area: "Uttara-Airport", phone: "01XXXXXXXXX" },
    { id: "R005", name: "Faruk Islam", status: "Off Duty", parcels: 0, area: "Gulshan-Banani", phone: "01XXXXXXXXX" },
  ]);

  // ------------------------------
  // UI State
  // ------------------------------
  const [toast, setToast] = useState<Toast>(null);

  const [parcelModal, setParcelModal] = useState<Parcel | null>(null);
  const [riderModal, setRiderModal] = useState<Rider | null>(null);

  const [assignModal, setAssignModal] = useState<{ open: boolean; parcelIds: string[] }>({ open: false, parcelIds: [] });
  const [assignRiderId, setAssignRiderId] = useState<string>("");

  const [createOutgoingModal, setCreateOutgoingModal] = useState<{
    open: boolean;
    parcelId: string | null;
    routeType: string;
    nextHop: string;
    destination: string;
  }>({
    open: false,
    parcelId: null,
    routeType: "To District Hub",
    nextHop: "Dhaka District Hub",
    destination: "",
  });

  const [scanModalOpen, setScanModalOpen] = useState<boolean>(false);
  const [scanValue, setScanValue] = useState<string>("");

  const [incomingSelected, setIncomingSelected] = useState<Set<string>>(new Set<string>());
  const [inventorySelected, setInventorySelected] = useState<Set<string>>(new Set<string>());
  const [outgoingSelected, setOutgoingSelected] = useState<Set<string>>(new Set<string>());

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: TrendingUp },
    { id: "incoming", label: "Incoming Parcels", icon: Package },
    { id: "inventory", label: "Hub Inventory", icon: ClipboardList },
    { id: "outgoing", label: "Outgoing Parcels", icon: Truck },
    { id: "riders", label: "Rider Management", icon: Users },
  ];

  // ------------------------------
  // Helpers / mutations
  // ------------------------------
  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 1800);
  };

  const addLog = <T extends { logs?: Log[] }>(parcel: T, status: string, note: string) => ({
    ...parcel,
    status,
    logs: [...(parcel.logs || []), { at: nowTime(), status, note }],
  });

  const toggleSet = (
    setFn: React.Dispatch<React.SetStateAction<Set<string>>>,
    // setValue: Set<string>,
    id: string
  ) => {
    setFn((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const setAllSelected = (
    setFn: React.Dispatch<React.SetStateAction<Set<string>>>,
    list: { id: string }[],
    checked: boolean
  ) => {
    setFn(() => (checked ? new Set(list.map((x) => x.id)) : new Set<string>()));
  };

  // Incoming: mark as Arrived (gate scan)
  const markArrived = (parcelId: string) => {
    setIncomingParcels((prev) =>
      prev.map((p) => (p.id === parcelId ? addLog(p, "Arrived", "Marked as arrived") : p))
    );
    showToast(`Parcel ${parcelId} marked Arrived`);
  };

  // Incoming: process Arrived -> Inventory (In Hub)
  const processToInventory = (parcelId: string) => {
    let moved: IncomingParcel | null = null;
    setIncomingParcels((prev) => {
      const next: IncomingParcel[] = [];
      for (const p of prev) {
        if (p.id === parcelId) moved = p;
        else next.push(p);
      }
      return next;
    });

    if (!moved) return;

    const movedParcel: IncomingParcel = moved;
    const inv = addLog(
      {
        id: movedParcel.id,
        origin: movedParcel.origin,
        destination: movedParcel.destination,
        weight: movedParcel.weight || "—",
        receivedAt: nowTime(),
        nextHop: movedParcel.destination, // default guess (edit later)
        routeType: movedParcel.type || "Hub Transfer",
        logs: movedParcel.logs || [],
        status: "In Hub",
      } as InventoryParcel,
      "In Hub",
      `Processed into ${HUB_NAME} inventory`
    );

    setInventoryParcels((prev) => [inv, ...prev]);
    showToast(`Parcel ${parcelId} moved to Inventory`);
  };

  // Inventory: open create outgoing (choose next hop / route)
  const openCreateOutgoing = (parcelId: string) => {
    const p = inventoryParcels.find((x) => x.id === parcelId);
    setCreateOutgoingModal({
      open: true,
      parcelId,
      routeType: "To District Hub",
      nextHop: "Dhaka District Hub",
      destination: p?.destination || "",
    });
  };

  // Inventory: create outgoing entry (Ready)
  const createOutgoingFromInventory = () => {
    const { parcelId, routeType, nextHop, destination } = createOutgoingModal;
    const p = inventoryParcels.find((x) => x.id === parcelId);
    if (!p) return;

    // remove from inventory
    setInventoryParcels((prev) => prev.filter((x) => x.id !== parcelId));

    const out = addLog(
      {
        id: p.id,
        destination: destination || p.destination,
        weight: p.weight,
        status: "Ready",
        assignedTo: "Unassigned",
        routeType,
        nextHop,
        logs: p.logs || [],
      },
      "Ready",
      `Prepared for dispatch via ${nextHop}`
    );

    setOutgoingParcels((prev) => [out, ...prev]);
    setCreateOutgoingModal((s) => ({ ...s, open: false, parcelId: null }));
    showToast(`Outgoing created for ${parcelId}`);
  };

  // Open assign rider modal
  const openAssign = (parcelIds: string[]) => {
    setAssignModal({ open: true, parcelIds });
    setAssignRiderId("");
  };

  // Outgoing: assign rider (only Ready)
  const applyAssignRider = () => {
    const { parcelIds } = assignModal;
    if (!assignRiderId) {
      showToast("Select a rider first", "error");
      return;
    }
    const rider = riders.find((r) => r.id === assignRiderId);
    if (!rider || rider.status !== "Available") {
      showToast("Rider not available", "error");
      return;
    }

    setOutgoingParcels((prev) =>
      prev.map((p) => {
        if (!parcelIds.includes(p.id)) return p;
        if (p.status !== "Ready") return p;
        return addLog({ ...p, assignedTo: rider.id }, "Ready", `Assigned to ${rider.name} (${rider.id})`);
      })
    );

    // Handle incoming parcels
    setIncomingParcels((prev) =>
      prev.map((p) => {
        if (!parcelIds.includes(p.id)) return p;
        return addLog({ ...p, rider: rider.name }, p.status, `Assigned rider: ${rider.name} (${rider.id})`);
      })
    );

    // increase rider parcel count (demo)
    setRiders((prev) =>
      prev.map((r) => (r.id === rider.id ? { ...r, parcels: r.parcels + parcelIds.length } : r))
    );

    setAssignModal({ open: false, parcelIds: [] });
    setAssignRiderId("");
    showToast(`Assigned ${parcelIds.length} parcel(s) to ${rider.name}`);
    
    // Clear selections
    setIncomingSelected(new Set());
    setOutgoingSelected(new Set());
  };

  // Outgoing: dispatch (Ready -> Dispatched)
  const dispatchParcel = (parcelId: string) => {
    setOutgoingParcels((prev) =>
      prev.map((p) => {
        if (p.id !== parcelId) return p;
        if (p.status !== "Ready") return p;
        if (p.assignedTo === "Unassigned") {
          showToast("Assign a rider first", "error");
          return p;
        }
        return addLog(p, "Dispatched", `Dispatched by hub (${HUB_NAME})`);
      })
    );
    showToast(`Dispatched ${parcelId}`);
  };

  const bulkDispatch = (parcelIds: (string | undefined | null)[]) => {
    const ids = parcelIds.filter(Boolean) as string[];
    setOutgoingParcels((prev) =>
      prev.map((p) => {
        if (!ids.includes(p.id)) return p;
        if (p.status !== "Ready") return p;
        if (p.assignedTo === "Unassigned") return p;
        return addLog(p, "Dispatched", `Dispatched by hub (${HUB_NAME})`);
      })
    );
    showToast(`Bulk dispatched ${ids.length} parcel(s)`);
  };

  // Scan: create or update incoming quickly
  const scanSubmit = () => {
    const code = scanValue.trim().toUpperCase();
    if (!code) return;

    // If exists in incoming -> mark arrived
    const inIncoming = incomingParcels.some((p) => p.id === code);
    if (inIncoming) {
      markArrived(code);
      setScanValue("");
      setScanModalOpen(false);
      return;
    }

    // If exists elsewhere, just open details
    const inInventory = inventoryParcels.find((p) => p.id === code);
    const inOutgoing = outgoingParcels.find((p) => p.id === code);
    const found = inInventory || inOutgoing;
    if (found) {
      setParcelModal(found);
      setScanValue("");
      setScanModalOpen(false);
      return;
    }

    // Create new incoming record (demo)
    const newP: IncomingParcel = {
      id: code,
      origin: "Unknown Origin",
      destination: HUB_NAME,
      status: "Arrived",
      eta: "—",
      rider: "—",
      weight: "—",
      type: "Unknown",
      logs: [{ at: nowTime(), note: "Scanned at gate", status: "Arrived" }],
    };
    setIncomingParcels((prev) => [newP, ...prev]);
    showToast(`Scanned new parcel ${code} (Arrived)`);
    setScanValue("");
    setScanModalOpen(false);
  };

  // ------------------------------
  // DASHBOARD STATS
  // ------------------------------
  const stats = useMemo(() => {
    const total = incomingParcels.length + inventoryParcels.length + outgoingParcels.length;
    const dispatchedToday = outgoingParcels.filter((p) => p.status === "Dispatched").length;
    const pendingTransfer = outgoingParcels.filter((p) => p.status === "Ready").length;
    const activeRiders = riders.filter((r) => r.status !== "Off Duty").length;
    return { total, dispatchedToday, pendingTransfer, activeRiders };
  }, [incomingParcels, inventoryParcels, outgoingParcels, riders]);

  // ------------------------------
  // MODULES
  // ------------------------------
  const DashboardModule = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Hub Overview</h2>
          <p className="text-sm text-gray-500 mt-1">
            Gate scan → Receive → Inventory → Outgoing → Assign → Dispatch
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setScanModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <ScanLine size={18} />
            Scan Parcel
          </button>

          <div className="bg-green-100 px-4 py-2 rounded-lg">
            <p className="text-xs text-gray-600">Hub Location</p>
            <p className="font-bold text-gray-800">{HUB_NAME}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Parcels</p>
              <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <Package className="text-blue-500" size={40} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Dispatched</p>
              <p className="text-3xl font-bold text-gray-800">{stats.dispatchedToday}</p>
            </div>
            <CheckCircle className="text-green-500" size={40} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Ready to Dispatch</p>
              <p className="text-3xl font-bold text-gray-800">{stats.pendingTransfer}</p>
            </div>
            <Clock className="text-yellow-500" size={40} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Active Riders</p>
              <p className="text-3xl font-bold text-gray-800">{stats.activeRiders}</p>
            </div>
            <Users className="text-purple-500" size={40} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Recent Incoming</h3>
            <button
              onClick={() => setActiveModule("incoming")}
              className="text-sm text-green-700 hover:text-green-900 inline-flex items-center gap-1"
            >
              View all <ArrowRight size={16} />
            </button>
          </div>

          <div className="space-y-3">
            {incomingParcels.slice(0, 4).map((parcel) => (
              <button
                key={parcel.id}
                onClick={() => setParcelModal(parcel)}
                className="w-full text-left flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
              >
                <div className="flex items-center space-x-3">
                  <Package className="text-gray-400" size={20} />
                  <div>
                    <p className="font-medium text-gray-800">{parcel.id}</p>
                    <p className="text-sm text-gray-500">From: {parcel.origin}</p>
                  </div>
                </div>
                <span className={statusPill(parcel.status)}>{parcel.status}</span>
              </button>
            ))}
            {incomingParcels.length === 0 && (
              <div className="text-sm text-gray-500 py-4 text-center">No incoming parcels</div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Rider Status</h3>
            <button
              onClick={() => setActiveModule("riders")}
              className="text-sm text-green-700 hover:text-green-900 inline-flex items-center gap-1"
            >
              View all <ArrowRight size={16} />
            </button>
          </div>

          <div className="space-y-3">
            {riders.slice(0, 4).map((rider) => (
              <button
                key={rider.id}
                onClick={() => setRiderModal(rider)}
                className="w-full text-left flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
              >
                <div className="flex items-center space-x-3">
                  <Users className="text-gray-400" size={20} />
                  <div>
                    <p className="font-medium text-gray-800">{rider.name}</p>
                    <p className="text-sm text-gray-500">{rider.area}</p>
                  </div>
                </div>
                <span className={statusPill(rider.status)}>{rider.status}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => setActiveModule("incoming")}
            className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <Package className="text-blue-600 mb-2 mx-auto" size={28} />
            <p className="text-sm font-medium text-gray-700">Process Incoming</p>
          </button>

          <button
            onClick={() => setActiveModule("inventory")}
            className="p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
          >
            <ClipboardList className="text-yellow-700 mb-2 mx-auto" size={28} />
            <p className="text-sm font-medium text-gray-700">Inventory</p>
          </button>

          <button
            onClick={() => setActiveModule("outgoing")}
            className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
          >
            <Truck className="text-green-600 mb-2 mx-auto" size={28} />
            <p className="text-sm font-medium text-gray-700">Dispatch Parcels</p>
          </button>

          <button
            onClick={() => setScanModalOpen(true)}
            className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
          >
            <ScanLine className="text-purple-700 mb-2 mx-auto" size={28} />
            <p className="text-sm font-medium text-gray-700">Scan at Gate</p>
          </button>
        </div>
      </div>
    </div>
  );

  const IncomingParcelsModule = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const filtered = incomingParcels.filter((p) => {
      const matchesSearch =
        p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.origin || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.destination || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    const bulkProcess = () => {
      const ids = [...incomingSelected];
      if (ids.length === 0) return showToast("Select parcels first", "error");
      // Only process Arrived
      const arrivedIds = incomingParcels.filter((p) => ids.includes(p.id) && p.status === "Arrived").map((p) => p.id);
      arrivedIds.forEach(processToInventory);
      setIncomingSelected(new Set());
      showToast(`Processed ${arrivedIds.length} parcel(s) to Inventory`);
    };

    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Incoming Parcels</h2>
            <p className="text-sm text-gray-500 mt-1">Gate scan & receiving workflow</p>
          </div>

          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID / origin / destination"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-full md:w-72"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="Arriving">Arriving</option>
              <option value="Arrived">Arrived</option>
              <option value="Not Picked">Not Picked</option>
            </select>
            <button
              onClick={() => setScanModalOpen(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 inline-flex items-center gap-2"
            >
              <ScanLine size={18} />
              Scan
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={filtered.length > 0 && incomingSelected.size === filtered.length}
              onChange={(e) => setAllSelected(setIncomingSelected, filtered, e.target.checked)}
            />
            Select all
          </label>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                const ids = [...incomingSelected];
                if (ids.length === 0) return showToast("Select parcels first", "error");
                setAssignModal({ open: true, parcelIds: ids });
                setAssignRiderId("");
              }}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 inline-flex items-center gap-2"
            >
              <UserCheck size={18} />
              Assign Rider
            </button>
            <button
              onClick={bulkProcess}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
            >
              <ClipboardList size={18} />
              Process to Inventory
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sel</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parcel ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Origin</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destination</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rider</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ETA</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={incomingSelected.has(p.id)}
                      onChange={() => toggleSet(setIncomingSelected, p.id)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{p.origin}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{p.destination}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{p.rider}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{p.eta}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={statusPill(p.status)}>{p.status}</span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => setParcelModal(p)}
                      className="text-gray-700 hover:text-gray-900 font-medium mr-3"
                    >
                      View
                    </button>

                    <button
                      onClick={() => openAssign([p.id])}
                      className="text-purple-600 hover:text-purple-900 font-medium mr-3"
                    >
                      Assign
                    </button>

                    {p.status !== "Arrived" ? (
                      <button
                        onClick={() => markArrived(p.id)}
                        className="text-blue-600 hover:text-blue-900 font-medium"
                      >
                        Mark Arrived
                      </button>
                    ) : (
                      <button
                        onClick={() => processToInventory(p.id)}
                        className="text-green-700 hover:text-green-900 font-medium"
                      >
                        Process
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-8 text-gray-500">No incoming parcels found</div>
          )}
        </div>
      </div>
    );
  };

  const InventoryModule = () => {
    const [searchTerm, setSearchTerm] = useState("");

    const filtered = inventoryParcels.filter((p) => {
      return (
        p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.destination || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.nextHop || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

    const bulkCreateOutgoing = () => {
      const ids = [...inventorySelected];
      if (ids.length === 0) return showToast("Select inventory parcels first", "error");
      // quick create outgoing with defaults
      ids.forEach((id) => {
        const p = inventoryParcels.find((x) => x.id === id);
        if (!p) return;
        setCreateOutgoingModal({
          open: true,
          parcelId: id,
          routeType: "To District Hub",
          nextHop: "Dhaka District Hub",
          destination: p.destination || "",
        });
      });
      // keep modal flow simple: open one by one manually in real app
      showToast("Tip: Create outgoing one-by-one for correct routing", "success");
    };

    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Hub Inventory</h2>
            <p className="text-sm text-gray-500 mt-1">Physically received parcels inside {HUB_NAME}</p>
          </div>

          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search ID / destination / next hop"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-full md:w-72"
            />
            <button
              onClick={() => {
                const newId = uid();
                setInventoryParcels((prev) => [
                  addLog(
                    {
                      id: newId,
                      origin: "Dhaka Central",
                      destination: "Customer (Last-mile)",
                      status: "In Hub",
                      receivedAt: nowTime(),
                      weight: "1.0kg",
                      nextHop: "Last-mile",
                      routeType: "Last-mile",
                      logs: [],
                    },
                    "In Hub",
                    "Manually added into inventory (demo)"
                  ),
                  ...prev,
                ]);
                showToast(`Added ${newId} to Inventory`);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 inline-flex items-center gap-2"
              title="Demo helper"
            >
              <Package size={18} />
              Add Demo
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={filtered.length > 0 && inventorySelected.size === filtered.length}
              onChange={(e) => setAllSelected(setInventorySelected, filtered, e.target.checked)}
            />
            Select all
          </label>

          <button
            onClick={bulkCreateOutgoing}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 inline-flex items-center gap-2"
          >
            <Send size={18} />
            Create Outgoing
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sel</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parcel ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Received At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destination</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Next Hop</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={inventorySelected.has(p.id)}
                      onChange={() => toggleSet(setInventorySelected, p.id)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{p.receivedAt}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{p.destination}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{p.nextHop}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={statusPill(p.status)}>{p.status}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button onClick={() => setParcelModal(p)} className="text-gray-700 hover:text-gray-900 font-medium mr-3">
                      View
                    </button>
                    <button
                      onClick={() => openCreateOutgoing(p.id)}
                      className="text-green-700 hover:text-green-900 font-medium"
                    >
                      Create Outgoing
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-8 text-gray-500">No parcels in inventory</div>
          )}
        </div>
      </div>
    );
  };

  const OutgoingParcelsModule = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const filtered = outgoingParcels.filter((p) => {
      const matchesSearch =
        p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.destination || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.nextHop || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    const bulkAssign = () => {
      const ids = [...outgoingSelected];
      if (ids.length === 0) return showToast("Select outgoing parcels first", "error");
      const readyIds = outgoingParcels.filter((p) => ids.includes(p.id) && p.status === "Ready").map((p) => p.id);
      if (readyIds.length === 0) return showToast("No Ready parcels selected", "error");
      openAssign(readyIds);
    };

    const bulkDispatchAction = () => {
      const ids = [...outgoingSelected];
      if (ids.length === 0) return showToast("Select outgoing parcels first", "error");
      const readyAssigned = outgoingParcels
        .filter((p) => ids.includes(p.id) && p.status === "Ready" && p.assignedTo !== "Unassigned")
        .map((p) => p.id);
      if (readyAssigned.length === 0) return showToast("Select Ready + Assigned parcels", "error");
      bulkDispatch(readyAssigned);
      setOutgoingSelected(new Set());
    };

    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Outgoing Parcels</h2>
            <p className="text-sm text-gray-500 mt-1">Assign rider → dispatch to next hub/district or last-mile</p>
          </div>

          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID / destination / next hop"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-full md:w-72"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="Ready">Ready</option>
              <option value="Dispatched">Dispatched</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={filtered.length > 0 && outgoingSelected.size === filtered.length}
              onChange={(e) => setAllSelected(setOutgoingSelected, filtered, e.target.checked)}
            />
            Select all
          </label>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={bulkAssign}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
            >
              <UserCheck size={18} />
              Bulk Assign
            </button>
            <button
              onClick={bulkDispatchAction}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 inline-flex items-center gap-2"
            >
              <Send size={18} />
              Bulk Dispatch
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sel</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parcel ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destination</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Next Hop</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Weight</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={outgoingSelected.has(p.id)}
                      onChange={() => toggleSet(setOutgoingSelected, p.id)}
                    />
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{p.destination}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{p.nextHop}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{p.weight}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{p.assignedTo}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={statusPill(p.status)}>{p.status}</span>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button onClick={() => setParcelModal(p)} className="text-gray-700 hover:text-gray-900 font-medium mr-3">
                      View
                    </button>

                    {p.status === "Ready" ? (
                      <>
                        <button
                          onClick={() => openAssign([p.id])}
                          className="text-blue-600 hover:text-blue-900 font-medium mr-3"
                        >
                          Assign
                        </button>
                        <button
                          onClick={() => dispatchParcel(p.id)}
                          className="text-green-700 hover:text-green-900 font-medium"
                        >
                          Dispatch
                        </button>
                      </>
                    ) : (
                      <span className="text-gray-500">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-8 text-gray-500">No outgoing parcels found</div>
          )}
        </div>
      </div>
    );
  };

  const RiderManagementModule = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const filtered = riders.filter((r) => {
      const matchesSearch =
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Rider Management</h2>
            <p className="text-sm text-gray-500 mt-1">Assign areas under hub, track availability</p>
          </div>

          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID / name / area"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent w-full md:w-72"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="Available">Available</option>
              <option value="On Delivery">On Delivery</option>
              <option value="Off Duty">Off Duty</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rider ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Area</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Active Parcels</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{r.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r.area}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r.parcels}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={statusPill(r.status)}>{r.status}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button onClick={() => setRiderModal(r)} className="text-blue-600 hover:text-blue-900 font-medium">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && <div className="text-center py-8 text-gray-500">No riders found</div>}
        </div>
      </div>
    );
  };

  const renderModule = () => {
    switch (activeModule) {
      case "dashboard":
        return <DashboardModule />;
      case "incoming":
        return <IncomingParcelsModule />;
      case "inventory":
        return <InventoryModule />;
      case "outgoing":
        return <OutgoingParcelsModule />;
      case "riders":
        return <RiderManagementModule />;
      default:
        return <DashboardModule />;
    }
  };

  // ------------------------------
  // RENDER
  // ------------------------------
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-60 px-4 py-3 rounded-lg shadow-lg text-white ${
            toast.type === "error" ? "bg-red-600" : "bg-green-600"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-linear-to-b from-green-600 to-green-700 text-white transition-all duration-300 flex flex-col`}
      >
        <div className="p-4 flex items-center justify-between border-b border-green-500">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/')} className="p-2 hover:bg-green-500 rounded-lg transition-colors" title="Back to Home">
              <Home size={20} />
            </button>
            {sidebarOpen && <h1 className="text-xl font-bold">Hub Manager</h1>}
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-green-500 rounded-lg transition-colors">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveModule(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeModule === item.id ? "bg-green-800" : "hover:bg-green-500"
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
              <span className="font-bold">H</span>
            </div>
            {sidebarOpen && (
              <div>
                <p className="font-medium">Hub Manager</p>
                <p className="text-xs text-green-200">{HUB_NAME}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 overflow-auto p-6">{renderModule()}</div>

      {/* Scan Modal */}
      {scanModalOpen && (
        <Modal
          title="Scan Parcel at Gate"
          onClose={() => setScanModalOpen(false)}
          footer={
            <div className="flex gap-2">
              <button
                onClick={scanSubmit}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Submit Scan
              </button>
              <button
                onClick={() => setScanModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          }
        >
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Enter/scan parcel ID. If it exists, we will mark it arrived or open details. If not, we create an Arrived record.
            </p>
            <input
              value={scanValue}
              onChange={(e) => setScanValue(e.target.value)}
              placeholder="e.g. PCL1234"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </Modal>
      )}

      {/* Assign Rider Modal */}
      {assignModal.open && (
        <Modal
          title="Assign Rider"
          onClose={() => setAssignModal({ open: false, parcelIds: [] })}
          footer={
            <div className="flex gap-2">
              <button
                onClick={applyAssignRider}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Assign
              </button>
              <button
                onClick={() => setAssignModal({ open: false, parcelIds: [] })}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          }
        >
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Assigning <b>{assignModal.parcelIds.length}</b> parcel(s):{" "}
              <span className="text-gray-800">{assignModal.parcelIds.join(", ")}</span>
            </p>

            <select
              value={assignRiderId}
              onChange={(e) => setAssignRiderId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Select Available Rider</option>
              {riders
                .filter((r) => r.status === "Available")
                .map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.id}) - {r.area}
                  </option>
                ))}
            </select>
          </div>
        </Modal>
      )}

      {/* Create Outgoing Modal */}
      {createOutgoingModal.open && (
        <Modal
          title="Create Outgoing Dispatch"
          onClose={() => setCreateOutgoingModal((s) => ({ ...s, open: false }))}
          footer={
            <div className="flex gap-2">
              <button
                onClick={createOutgoingFromInventory}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Create
              </button>
              <button
                onClick={() => setCreateOutgoingModal((s) => ({ ...s, open: false }))}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              Parcel: <b className="text-gray-800">{createOutgoingModal.parcelId}</b>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Route Type</label>
                <select
                  value={createOutgoingModal.routeType}
                  onChange={(e) => setCreateOutgoingModal((s) => ({ ...s, routeType: e.target.value }))}
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option>To District Hub</option>
                  <option>To Destination Hub</option>
                  <option>Last-mile</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Next Hop</label>
                <input
                  value={createOutgoingModal.nextHop}
                  onChange={(e) => setCreateOutgoingModal((s) => ({ ...s, nextHop: e.target.value }))}
                  placeholder="e.g. Dhaka District Hub / Mirpur Hub / Last-mile"
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-medium text-gray-500 uppercase">Final Destination</label>
                <input
                  value={createOutgoingModal.destination}
                  onChange={(e) => setCreateOutgoingModal((s) => ({ ...s, destination: e.target.value }))}
                  placeholder="e.g. Sylhet District / Uttara Hub / Customer"
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Parcel Details Modal */}
      {parcelModal && (
        <Modal
          title={`Parcel Details — ${parcelModal.id}`}
          onClose={() => setParcelModal(null)}
          footer={
            <div className="flex gap-2">
              <button
                onClick={() => setParcelModal(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-500 uppercase">Status</div>
              <div className="mt-1">
                <span className={statusPill(parcelModal.status)}>{parcelModal.status}</span>
              </div>

              <div className="mt-4 text-xs text-gray-500 uppercase">Info</div>
              <div className="mt-2 space-y-1 text-sm text-gray-700">
                {"origin" in parcelModal && <div>Origin: <b>{parcelModal.origin}</b></div>}
                {"destination" in parcelModal && <div>Destination: <b>{parcelModal.destination}</b></div>}
                {"nextHop" in parcelModal && <div>Next Hop: <b>{parcelModal.nextHop}</b></div>}
                {"assignedTo" in parcelModal && <div>Assigned: <b>{parcelModal.assignedTo}</b></div>}
                {"weight" in parcelModal && <div>Weight: <b>{parcelModal.weight}</b></div>}
                {"receivedAt" in parcelModal && <div>Received: <b>{parcelModal.receivedAt}</b></div>}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-500 uppercase">Activity Log</div>
              <div className="mt-2 space-y-2 max-h-64 overflow-auto">
                {(parcelModal.logs || []).slice().reverse().map((l, idx) => (
                  <div key={idx} className="p-2 bg-white rounded border">
                    <div className="text-xs text-gray-500">{l.at}</div>
                    <div className="text-sm text-gray-800 font-medium">{l.status}</div>
                    <div className="text-sm text-gray-600">{l.note}</div>
                  </div>
                ))}
                {(parcelModal.logs || []).length === 0 && (
                  <div className="text-sm text-gray-500">No logs</div>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Rider Details Modal */}
      {riderModal && (
        <Modal
          title={`Rider Details — ${riderModal.name}`}
          onClose={() => setRiderModal(null)}
          footer={
            <div className="flex gap-2">
              <button
                onClick={() => setRiders((prev) => prev.map((r) => (r.id === riderModal.id ? { ...r, status: "Available" } : r)))}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Set Available
              </button>
              <button
                onClick={() => setRiders((prev) => prev.map((r) => (r.id === riderModal.id ? { ...r, status: "Off Duty" } : r)))}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Set Off Duty
              </button>
              <button
                onClick={() => setRiderModal(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          }
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
              <div>
                <div className="text-sm text-gray-600">Rider ID</div>
                <div className="font-bold text-gray-800">{riderModal.id}</div>
              </div>
              <span className={statusPill(riderModal.status)}>{riderModal.status}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-xs text-gray-500 uppercase">Area</div>
                <div className="font-medium text-gray-800 mt-1">{riderModal.area}</div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-xs text-gray-500 uppercase">Active Parcels</div>
                <div className="font-medium text-gray-800 mt-1">{riderModal.parcels}</div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                <div className="text-xs text-gray-500 uppercase">Phone</div>
                <div className="font-medium text-gray-800 mt-1">{riderModal.phone || "—"}</div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default HubManagerDashboard;
