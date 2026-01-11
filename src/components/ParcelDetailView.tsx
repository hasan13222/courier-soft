import { MapPin, User, Phone, Package, Truck } from "lucide-react";

const Badge = ({ text }: { text: string }) => {
  const color =
    text === "Delivered"
      ? "bg-green-100 text-green-700"
      : text === "Pending"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-gray-100 text-gray-700";

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${color}`}>
      {text}
    </span>
  );
};

export const ParcelDetailView = ({ parcel }: { parcel: any }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Package size={20} />
            Parcel {parcel.id}
          </h2>
          <p className="text-sm text-gray-500">
            Estimated Fare: ৳{parcel.estFare}
          </p>
        </div>
        <Badge text={parcel.status} />
      </div>

      {/* Customer */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium mb-3 flex items-center gap-2">
          <User size={16} /> Customer
        </h3>
        <div className="text-sm space-y-1">
          <p>{parcel.customerName}</p>
          <p className="flex items-center gap-2 text-gray-600">
            <Phone size={14} /> {parcel.customerPhone}
          </p>
        </div>
      </div>

      {/* Route */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium mb-3 flex items-center gap-2">
          <MapPin size={16} /> Route
        </h3>
        <p className="text-sm text-gray-700">
          {parcel.originHub} → {parcel.destinationHub}
        </p>
      </div>

      {/* Assignment */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium mb-3 flex items-center gap-2">
          <Truck size={16} /> Assignment
        </h3>
        <p className="text-sm text-gray-700">
          Rider: {parcel.rider || "Not Assigned"}
        </p>
        <p className="text-sm text-gray-700">
          Merchant: {parcel.merchant}
        </p>
      </div>
    </div>
  );
};
