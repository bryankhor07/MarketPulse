import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState, useCallback } from "react";
import { coingecko } from "../lib/coingecko.js";
import { finnhub } from "../lib/finnhub.js";
import { usePolling } from "../hooks/usePolling.js";
import InstrumentCard from "../components/InstrumentCard.jsx";
import { CardSkeleton } from "../components/LoadingSkeleton.jsx";

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const type = params.get("type") || "crypto";
  const currency = params.get("currency") || "USD";
  const [timeframe, setTimeframe] = useState("24h");
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(search.trim().toLowerCase()), 300);
    return () => clearTimeout(id);
  }, [search]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      if (type === "crypto") {
        const data = await coingecko.getMarkets({
          vs_currency: currency.toLowerCase(),
          order: "market_cap_desc",
          per_page: 100,
          page: 1,
          price_change_percentage: timeframe === "7d" ? "7d" : "24h",
        });
        setItems(
          Array.isArray(data)
            ? data.map((d) => ({
                type: "crypto",
                id: d.id,
                name: d.name,
                symbol: d.symbol?.toUpperCase(),
                price: d.current_price,
                changePct:
                  timeframe === "7d"
                    ? d.price_change_percentage_7d_in_currency
                    : d.price_change_percentage_24h_in_currency,
                marketCap: d.market_cap,
                volume: d.total_volume,
                image: d.image,
              }))
            : []
        );
      } else {
        const symbols = [
          "AAPL",
          "MSFT",
          "GOOGL",
          "AMZN",
          "NVDA",
          "TSLA",
          "META",
          "BRK.B",
          "JPM",
          "V",
        ];
        const results = await Promise.all(
          symbols.map(async (s) => {
            try {
              const q = await finnhub.quote(s);
              const changePct =
                q.c && q.pc ? ((q.c - q.pc) / q.pc) * 100 : null;
              return {
                type: "stock",
                id: s,
                name: s,
                symbol: s,
                price: q.c ?? null,
                changePct,
                marketCap: null,
                volume: q.v ?? null,
                image: null,
              };
            } catch {
              return null;
            }
          })
        );
        const filtered = results.filter(Boolean);
        filtered.sort(
          (a, b) => (b.changePct ?? -Infinity) - (a.changePct ?? -Infinity)
        );
        setItems(filtered);
      }
      setLastUpdate(new Date());
    } catch (e) {
      setError(e?.message || "Failed to load data");
      setItems([]);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [type, currency, timeframe]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  usePolling(loadData, 60 * 1000, {
    enabled: true,
    maxBackoff: 5 * 60 * 1000,
    backoffMultiplier: 2,
    maxErrors: 5,
  });

  const filtered = useMemo(() => {
    if (!debounced) return items;
    return items.filter((i) =>
      [i.name, i.symbol, i.id].some((v) =>
        String(v).toLowerCase().includes(debounced)
      )
    );
  }, [items, debounced]);

  function updateParam(key, value) {
    const next = new URLSearchParams(location.search);
    if (value == null || value === "") next.delete(key);
    else next.set(key, value);
    navigate({ pathname: location.pathname, search: `?${next.toString()}` });
  }

  const formatLastUpdate = () => {
    if (!lastUpdate) return "";
    const now = new Date();
    const diffSeconds = Math.floor((now - lastUpdate) / 1000);
    if (diffSeconds < 60) return `Updated ${diffSeconds}s ago`;
    const diffMinutes = Math.floor(diffSeconds / 60);
    return `Updated ${diffMinutes}m ago`;
  };

  return (
    <main className="max-w-5xl mx-auto p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-6">
        <div className="flex flex-wrap gap-2 items-center">
          <label
            htmlFor="market-select"
            className="text-sm text-gray-600 dark:text-gray-400"
          >
            Market
          </label>
          <select
            id="market-select"
            className="border dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            value={type}
            onChange={(e) => updateParam("type", e.target.value)}
            aria-label="Select market type"
          >
            <option value="crypto">Crypto</option>
            <option value="stock">Stocks</option>
          </select>

          {type === "crypto" && (
            <>
              <label
                htmlFor="currency-select-dashboard"
                className="text-sm text-gray-600 dark:text-gray-400 ml-3"
              >
                Currency
              </label>
              <select
                id="currency-select-dashboard"
                className="border dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                value={currency}
                onChange={(e) => updateParam("currency", e.target.value)}
                aria-label="Select currency"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="JPY">JPY</option>
              </select>
            </>
          )}

          <label
            htmlFor="timeframe-select"
            className="text-sm text-gray-600 dark:text-gray-400 ml-3"
          >
            Timeframe
          </label>
          <select
            id="timeframe-select"
            className="border dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            aria-label="Select timeframe"
          >
            <option value="24h">24h</option>
            <option value="7d">7d</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="search-input" className="sr-only">
            Search instruments
          </label>
          <input
            id="search-input"
            className="border dark:border-gray-600 rounded px-3 py-2 text-sm w-64 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="Search ticker or coin..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search for instruments"
          />
          {lastUpdate && (
            <div
              className="text-xs text-gray-500 dark:text-gray-400 text-right"
              aria-live="polite"
            >
              {formatLastUpdate()}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded mb-4"
          role="alert"
        >
          <strong className="font-medium">Error:</strong> {error}
        </div>
      )}

      {loading && !items.length ? (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          aria-label="Loading instruments"
        >
          {Array.from({ length: 9 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
              No instruments found matching "{search}"
            </div>
          ) : (
            filtered.map((i) => (
              <InstrumentCard
                key={`${i.type}:${i.id}`}
                type={i.type}
                id={i.id}
                name={i.name}
                symbol={i.symbol}
                price={i.price}
                changePct={i.changePct}
                marketCap={i.marketCap}
                volume={i.volume}
                image={i.image}
                onClick={() =>
                  navigate(`/details/${i.type}/${i.id}?${params.toString()}`)
                }
              />
            ))
          )}
        </div>
      )}
    </main>
  );
}
