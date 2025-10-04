import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import InstrumentCard from "../components/InstrumentCard.jsx";
import { coingecko } from "../lib/coingecko.js";
import { finnhub } from "../lib/finnhub.js";

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const type = params.get("type") || "crypto"; // 'crypto' or 'stock'
  const currency = params.get("currency") || "USD"; // for crypto pricing
  const [timeframe, setTimeframe] = useState("24h"); // 24h | 7d
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");

  // debounce search
  useEffect(() => {
    const id = setTimeout(() => setDebounced(search.trim().toLowerCase()), 300);
    return () => clearTimeout(id);
  }, [search]);

  // fetch data for movers
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        if (type === "crypto") {
          // Use CoinGecko markets endpoint, order by market cap desc by default
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
          // Stocks: Finnhub does not provide a single "top movers" endpoint on free tier
          // For demo, pick a representative list of tickers and fetch quotes, then sort by daily change
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
                // q.c: current price, q.pc: previous close
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
      } catch (e) {
        setError(e?.message || "Failed to load data");
        setItems([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [type, currency, timeframe]);

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

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-4">
        <div className="flex flex-wrap gap-2 items-center">
          <label className="text-sm text-gray-600">Market</label>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={type}
            onChange={(e) => updateParam("type", e.target.value)}
          >
            <option value="crypto">Crypto</option>
            <option value="stock">Stocks</option>
          </select>

          {type === "crypto" && (
            <>
              <label className="text-sm text-gray-600 ml-3">Currency</label>
              <select
                className="border rounded px-2 py-1 text-sm"
                value={currency}
                onChange={(e) => updateParam("currency", e.target.value)}
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="JPY">JPY</option>
              </select>
            </>
          )}

          <label className="text-sm text-gray-600 ml-3">Timeframe</label>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
          >
            <option value="24h">24h</option>
            <option value="7d">7d</option>
          </select>
        </div>

        <div>
          <input
            className="border rounded px-3 py-2 text-sm w-64"
            placeholder="Search ticker or coin..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading && <div className="text-gray-600">Loading...</div>}
      {error && <div className="text-red-600 text-sm mb-3">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((i) => (
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
              navigate(
                `/details/${i.type}/${i.id}?${new URLSearchParams(
                  location.search
                ).toString()}`
              )
            }
          />
        ))}
      </div>
    </div>
  );
}
