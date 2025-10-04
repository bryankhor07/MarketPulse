import { useEffect, useState } from "react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { coingecko } from "../lib/coingecko.js";
import { finnhub } from "../lib/finnhub.js";

export default function SparklineChart({ type, id, currency = "USD" }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchSparklineData() {
      if (!id) return;

      setLoading(true);
      setError("");

      try {
        if (type === "crypto") {
          // Get 7 days of data for sparkline
          const chartData = await coingecko.getMarketChart(
            id,
            currency.toLowerCase(),
            7
          );

          if (chartData?.prices && Array.isArray(chartData.prices)) {
            const formatted = chartData.prices
              .slice(-24)
              .map(([timestamp, price]) => ({
                price: price,
              }));
            setData(formatted);
          } else {
            setData([]);
          }
        } else if (type === "stock") {
          // Get recent stock data - for sparkline we'll use a shorter timeframe
          const to = Math.floor(Date.now() / 1000);
          const from = to - 7 * 24 * 60 * 60; // 7 days

          const candles = await finnhub.stockCandles(id, "D", from, to);

          if (candles?.c && Array.isArray(candles.c)) {
            const formatted = candles.c.map((close) => ({
              price: close,
            }));
            setData(formatted);
          } else {
            setData([]);
          }
        }
      } catch (err) {
        setError("Failed to load sparkline");
        setData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchSparklineData();
  }, [type, id, currency]);

  if (loading) {
    return (
      <div className="w-16 h-8 bg-gray-100 rounded flex items-center justify-center">
        <div className="w-3 h-3 bg-gray-300 rounded-full animate-pulse"></div>
      </div>
    );
  }

  if (error || data.length === 0) {
    return (
      <div className="w-16 h-8 bg-gray-100 rounded flex items-center justify-center">
        <div className="text-xs text-gray-400">--</div>
      </div>
    );
  }

  // Calculate if the trend is positive or negative
  const firstPrice = data[0]?.price;
  const lastPrice = data[data.length - 1]?.price;
  const isPositive = lastPrice > firstPrice;
  const color = isPositive ? "#10b981" : "#ef4444"; // green or red

  return (
    <div className="w-16 h-8">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
