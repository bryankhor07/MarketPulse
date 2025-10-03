import { useLocation } from "react-router-dom";

export default function Dashboard() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const type = params.get("type") || "crypto";
  const currency = params.get("currency") || "USD";

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-2">Dashboard</h2>
      <p className="text-sm text-gray-600 mb-6">
        Mode: {type} • Currency: {currency}
      </p>
      <div className="rounded-lg border bg-white p-6 text-gray-700">
        Content goes here...
      </div>
    </div>
  );
}
