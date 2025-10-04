import { useState, useEffect, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { coingecko } from "../lib/coingecko.js";
import { finnhub } from "../lib/finnhub.js";

const RANGES = [
  { key: "30d", label: "30 Days", days: 30 },
  { key: "90d", label: "90 Days", days: 90 },
  { key: "1y", label: "1 Year", days: 365 },
];

export default function PriceChart({ type, id, currency = "USD" }) {
  const [selectedRange, setSelectedRange] = useState("30d");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const range = RANGES.find((r) => r.key === selectedRange) || RANGES[0];

  // Fetch chart data based on type and range
  useEffect(() => {
    async function fetchData() {
      if (!id) return;

      setLoading(true);
      setError("");

      try {
        if (type === "crypto") {
          const chartData = await coingecko.getMarketChart(
            id,
            currency.toLowerCase(),
            range.days
          );

          if (chartData?.prices && Array.isArray(chartData.prices)) {
            const formatted = chartData.prices.map(([timestamp, price]) => ({
              date: new Date(timestamp).toISOString().split("T")[0],
              timestamp: timestamp,
              price: price,
              volume:
                chartData.total_volumes?.[
                  chartData.prices.indexOf([timestamp, price])
                ]?.[1] || null,
            }));
            setData(formatted);
          } else {
            setData([]);
          }
        } else if (type === "stock") {
          // For stocks, calculate from/to timestamps based on range
          const to = Math.floor(Date.now() / 1000);
          const from = to - range.days * 24 * 60 * 60;

          // Determine resolution based on range
          let resolution = "D"; // daily by default
          if (range.days <= 30) resolution = "D";
          else if (range.days <= 90) resolution = "D";
          else resolution = "W"; // weekly for 1 year

          const candles = await finnhub.stockCandles(id, resolution, from, to);

          if (candles?.c && Array.isArray(candles.c)) {
            const formatted = candles.c.map((close, index) => ({
              date: new Date(candles.t[index] * 1000)
                .toISOString()
                .split("T")[0],
              timestamp: candles.t[index] * 1000,
              price: close,
              volume: candles.v?.[index] || null,
            }));
            setData(formatted);
          } else {
            setData([]);
          }
        }
      } catch (err) {
        setError(err?.message || "Failed to load chart data");
        setData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [type, id, currency, range.days]);

  // Format price for tooltip and Y-axis
  const formatPrice = (value) => {
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 6,
      }).format(value);
    } catch {
      return `$${value?.toFixed(2) || "0.00"}`;
    }
  };

  // Format date for X-axis
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-medium">{formatDate(label)}</p>
          <p className="text-blue-600">Price: {formatPrice(data.price)}</p>
          {data.volume && (
            <p className="text-gray-600 text-sm">
              Volume:{" "}
              {new Intl.NumberFormat(undefined, { notation: "compact" }).format(
                data.volume
              )}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // CSV export
  const exportCSV = () => {
    if (!data.length) return;

    const headers = ["Date", "Price", "Volume"];
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        [row.date, row.price?.toFixed(6) || "", row.volume || ""].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${id}_${selectedRange}_price_data.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
        <div className="flex gap-2">
          {RANGES.map((rangeOption) => (
            <button
              key={rangeOption.key}
              onClick={() => setSelectedRange(rangeOption.key)}
              className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                selectedRange === rangeOption.key
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {rangeOption.label}
            </button>
          ))}
        </div>

        <button
          onClick={exportCSV}
          disabled={!data.length || loading}
          className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Export CSV
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg border">
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-600">Loading chart data...</div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-64">
            <div className="text-red-600 text-center">
              <p className="font-medium">Error loading chart</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && data.length === 0 && (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-600">No data available</div>
          </div>
        )}

        {!loading && !error && data.length > 0 && (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                stroke="#666"
                fontSize={12}
              />
              <YAxis
                tickFormatter={(value) => formatPrice(value)}
                stroke="#666"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.1}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
