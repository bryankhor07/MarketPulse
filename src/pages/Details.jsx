import { useLocation, useParams } from "react-router-dom";
import PriceChart from "../components/PriceChart.jsx";

export default function Details() {
  const { type, id } = useParams();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const currency = params.get("currency") || "USD";

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">
          {type === "crypto" ? "Crypto" : "Stock"} Details
        </h2>
        <p className="text-sm text-gray-600">
          Type: {type} • ID: {id} • Currency: {currency}
        </p>
      </div>

      <div className="space-y-6">
        <PriceChart type={type} id={id} currency={currency} />

        <div className="rounded-lg border bg-white p-6">
          <h3 className="text-lg font-medium mb-4">Additional Information</h3>
          <p className="text-gray-700">
            More details about {type} {id} will be displayed here.
          </p>
        </div>
      </div>
    </div>
  );
}
