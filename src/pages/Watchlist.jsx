import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useWatchlist } from "../contexts/WatchlistContext.jsx";
import WatchlistButton from "../components/WatchlistButton.jsx";
import SparklineChart from "../components/SparklineChart.jsx";
import { coingecko } from "../lib/coingecko.js";
import { finnhub } from "../lib/finnhub.js";

export default function Watchlist() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const currency = params.get("currency") || "USD";

  const { getWatchlist, removeFromWatchlist } = useWatchlist();
  const watchlist = getWatchlist();

  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch current prices for all watchlist items
  useEffect(() => {
    async function fetchPrices() {
      if (watchlist.length === 0) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const priceData = {};

      try {
        // Fetch crypto prices
        const cryptoItems = watchlist.filter((item) => item.type === "crypto");
        if (cryptoItems.length > 0) {
          const cryptoIds = cryptoItems.map((item) => item.id);
          const marketData = await coingecko.getMarkets({
            vs_currency: currency.toLowerCase(),
            ids: cryptoIds.join(","),
            per_page: cryptoItems.length,
          });

          if (marketData) {
            marketData.forEach((coin) => {
              priceData[`crypto:${coin.id}`] = {
                price: coin.current_price,
                change: coin.price_change_percentage_24h,
              };
            });
          }
        }

        // Fetch stock prices
        const stockItems = watchlist.filter((item) => item.type === "stock");
        for (const item of stockItems) {
          try {
            const quote = await finnhub.quote(item.id);
            if (quote.c && quote.pc) {
              priceData[`stock:${item.id}`] = {
                price: quote.c,
                change: ((quote.c - quote.pc) / quote.pc) * 100,
              };
            }
          } catch (error) {
            console.error(`Failed to fetch price for ${item.id}:`, error);
          }
        }

        setPrices(priceData);
      } catch (error) {
        console.error("Failed to fetch prices:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPrices();
  }, [watchlist, currency]);

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

  const handleItemClick = (item) => {
    navigate(`/details/${item.type}/${item.id}?${params.toString()}`);
  };

  if (watchlist.length === 0) {
    return (
      <div className="max-w-5xl mx-auto p-4">
        <h2 className="text-2xl font-semibold mb-2">Watchlist</h2>
        <p className="text-sm text-gray-600 mb-6">Currency: {currency}</p>
        <div className="rounded-lg border bg-white p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Your watchlist is empty
          </h3>
          <p className="text-gray-600 mb-4">
            Add instruments from the dashboard to track their performance.
          </p>
          <button
            onClick={() => navigate(`/?${params.toString()}`)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Browse Instruments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-2">Watchlist</h2>
      <p className="text-sm text-gray-600 mb-6">
        Currency: {currency} • {watchlist.length} item
        {watchlist.length !== 1 ? "s" : ""}
      </p>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-600">Loading prices...</div>
        </div>
      ) : (
        <div className="space-y-3">
          {watchlist.map((item) => {
            const key = `${item.type}:${item.id}`;
            const priceData = prices[key];

            return (
              <div
                key={item.key}
                className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleItemClick(item)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-10 rounded-full"
                      />
                    )}
                    <div>
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-600">{item.symbol}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <SparklineChart
                      type={item.type}
                      id={item.id}
                      currency={currency}
                    />

                    <div className="text-right">
                      {priceData ? (
                        <>
                          <div className="font-semibold text-gray-900">
                            {formatPrice(priceData.price)}
                          </div>
                          <div
                            className={`text-sm ${
                              (priceData.change || 0) >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {priceData.change
                              ? `${priceData.change.toFixed(2)}%`
                              : "--"}
                          </div>
                        </>
                      ) : (
                        <div className="text-sm text-gray-400">No data</div>
                      )}
                    </div>

                    <WatchlistButton instrument={item} className="!w-8 !h-8" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
