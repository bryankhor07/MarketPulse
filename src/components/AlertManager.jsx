import { useState } from "react";
import { useWatchlist } from "../contexts/WatchlistContext.jsx";

export default function AlertManager({ instrument, currentPrice }) {
  const { addAlert, removeAlert, getAlertsForInstrument } = useWatchlist();
  const [showForm, setShowForm] = useState(false);
  const [condition, setCondition] = useState("above");
  const [threshold, setThreshold] = useState("");

  const { type, id } = instrument;
  const existingAlerts = getAlertsForInstrument(type, id);

  const handleSubmit = (e) => {
    e.preventDefault();
    const thresholdValue = parseFloat(threshold);

    if (isNaN(thresholdValue) || thresholdValue <= 0) {
      alert("Please enter a valid price threshold");
      return;
    }

    addAlert(instrument, condition, thresholdValue);
    setThreshold("");
    setShowForm(false);
  };

  const handleRemoveAlert = (alertCondition) => {
    removeAlert(type, id, alertCondition);
  };

  if (!currentPrice) {
    return null;
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-900">Price Alerts</h4>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
        >
          {showForm ? "Cancel" : "Add Alert"}
        </button>
      </div>

      {/* Existing Alerts */}
      {existingAlerts.length > 0 && (
        <div className="space-y-2 mb-3">
          {existingAlerts.map((alert, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-white p-2 rounded border"
            >
              <span className="text-sm text-gray-700">
                {alert.condition === "above" ? "Above" : "Below"} $
                {alert.threshold.toFixed(2)}
                {alert.triggered && (
                  <span className="ml-2 text-xs bg-red-100 text-red-800 px-1 rounded">
                    Triggered
                  </span>
                )}
              </span>
              <button
                onClick={() => handleRemoveAlert(alert.condition)}
                className="text-xs text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Alert Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Condition
            </label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full text-sm border rounded px-2 py-1"
            >
              <option value="above">Above</option>
              <option value="below">Below</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Price Threshold
            </label>
            <input
              type="number"
              step="0.01"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              placeholder={`Current: $${currentPrice.toFixed(2)}`}
              className="w-full text-sm border rounded px-2 py-1"
              required
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
            >
              Set Alert
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 text-xs bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
