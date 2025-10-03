import { useLocation, useParams } from "react-router-dom";

export default function Details() {
  const { type, id } = useParams();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const currency = params.get("currency") || "USD";

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-2">Details</h2>
      <p className="text-sm text-gray-600 mb-6">
        Type: {type} • ID: {id} • Currency: {currency}
      </p>
      <div className="rounded-lg border bg-white p-6 text-gray-700">
        Details content for {type} {id}
      </div>
    </div>
  );
}
