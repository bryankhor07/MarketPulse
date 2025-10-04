import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import PriceChart from "../components/PriceChart.jsx";
import { coingecko } from "../lib/coingecko.js";
import { finnhub } from "../lib/finnhub.js";

export default function Details() {
  const { type, id } = useParams();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const currency = params.get("currency") || "USD";

  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch instrument details on mount
  useEffect(() => {
    async function fetchDetails() {
      if (!id) return;

      setLoading(true);
      setError("");

      try {
        if (type === "crypto") {
          // Get coin details from markets endpoint
          const marketData = await coingecko.getMarkets({
            vs_currency: currency.toLowerCase(),
            ids: id,
            per_page: 1,
          });

          if (marketData && marketData.length > 0) {
            const coin = marketData[0];
            setDetails({
              name: coin.name,
              symbol: coin.symbol?.toUpperCase(),
              image: coin.image,
              currentPrice: coin.current_price,
              priceChange24h: coin.price_change_24h,
              priceChangePercentage24h: coin.price_change_percentage_24h,
              marketCap: coin.market_cap,
              totalVolume: coin.total_volume,
              circulatingSupply: coin.circulating_supply,
              totalSupply: coin.total_supply,
              ath: coin.ath,
              atl: coin.atl,
            });
          }
        } else if (type === "stock") {
          // Get stock quote
          const quote = await finnhub.quote(id);

          // Get company profile if available (this would need a separate API call)
          setDetails({
            name: id, // Use symbol as name for now
            symbol: id,
            image: null, // No image from Finnhub free tier
            currentPrice: quote.c,
            priceChange24h: quote.c && quote.pc ? quote.c - quote.pc : null,
            priceChangePercentage24h:
              quote.c && quote.pc
                ? ((quote.c - quote.pc) / quote.pc) * 100
                : null,
            previousClose: quote.pc,
            open: quote.o,
            high: quote.h,
            low: quote.l,
            volume: quote.v,
            marketCap: null, // Not available in free tier
            pe: null, // Not available in free tier
            high52w: quote.h, // Use day high as approximation
            low52w: quote.l, // Use day low as approximation
          });
        }
      } catch (err) {
        setError(err?.message || "Failed to load details");
      } finally {
        setLoading(false);
      }
    }

    fetchDetails();
  }, [type, id, currency]);

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

  const formatNumber = (value) => {
    try {
      return new Intl.NumberFormat(undefined, { notation: "compact" }).format(
        value
      );
    } catch {
      return String(value);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">Loading details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-600 text-center">
            <p className="font-medium">Error loading details</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">No details available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Header Section */}
      <div className="bg-white rounded-lg border p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          {details.image && (
            <img
              src={details.image}
              alt={details.name}
              className="w-16 h-16 rounded-full"
            />
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{details.name}</h1>
            <p className="text-lg text-gray-600">{details.symbol}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Current Price</p>
            <p className="text-2xl font-semibold text-gray-900">
              {formatPrice(details.currentPrice)}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">24h Change</p>
            <div className="flex items-center gap-2">
              <span
                className={`text-xl font-semibold ${
                  (details.priceChangePercentage24h || 0) >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {formatPrice(details.priceChange24h)}
              </span>
              <span
                className={`text-sm ${
                  (details.priceChangePercentage24h || 0) >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                ({details.priceChangePercentage24h?.toFixed(2)}%)
              </span>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500">Market Cap</p>
            <p className="text-xl font-semibold text-gray-900">
              {details.marketCap ? formatNumber(details.marketCap) : "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Price Chart */}
      <div className="mb-6">
        <PriceChart type={type} id={id} currency={currency} />
      </div>

      {/* Fundamentals Panel */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Fundamentals</h3>

        {type === "crypto" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Market Cap</p>
              <p className="text-lg font-semibold">
                {details.marketCap ? formatNumber(details.marketCap) : "N/A"}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">24h Volume</p>
              <p className="text-lg font-semibold">
                {details.totalVolume
                  ? formatNumber(details.totalVolume)
                  : "N/A"}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Circulating Supply</p>
              <p className="text-lg font-semibold">
                {details.circulatingSupply
                  ? formatNumber(details.circulatingSupply)
                  : "N/A"}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Total Supply</p>
              <p className="text-lg font-semibold">
                {details.totalSupply
                  ? formatNumber(details.totalSupply)
                  : "N/A"}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">All-Time High</p>
              <p className="text-lg font-semibold text-green-600">
                {details.ath ? formatPrice(details.ath) : "N/A"}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">All-Time Low</p>
              <p className="text-lg font-semibold text-red-600">
                {details.atl ? formatPrice(details.atl) : "N/A"}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Previous Close</p>
              <p className="text-lg font-semibold">
                {details.previousClose
                  ? formatPrice(details.previousClose)
                  : "N/A"}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Open</p>
              <p className="text-lg font-semibold">
                {details.open ? formatPrice(details.open) : "N/A"}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Day High</p>
              <p className="text-lg font-semibold text-green-600">
                {details.high ? formatPrice(details.high) : "N/A"}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Day Low</p>
              <p className="text-lg font-semibold text-red-600">
                {details.low ? formatPrice(details.low) : "N/A"}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Volume</p>
              <p className="text-lg font-semibold">
                {details.volume ? formatNumber(details.volume) : "N/A"}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Market Cap</p>
              <p className="text-lg font-semibold">
                {details.marketCap ? formatNumber(details.marketCap) : "N/A"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
