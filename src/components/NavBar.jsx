import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";

// Simple NavBar that lives on all pages
export default function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mode, setMode] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get("type") === "stock" ? "stocks" : "crypto";
  });
  const [currency, setCurrency] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get("currency") || "USD";
  });

  // keep query params in URL so pages can read them as single source of truth
  const queryString = useMemo(() => {
    const params = new URLSearchParams(location.search);
    params.set("type", mode === "stocks" ? "stock" : "crypto");
    params.set("currency", currency);
    return `?${params.toString()}`;
  }, [location.search, mode, currency]);

  function handleToggle(next) {
    setMode(next);
    const params = new URLSearchParams(location.search);
    params.set("type", next === "stocks" ? "stock" : "crypto");
    navigate({ pathname: location.pathname, search: `?${params.toString()}` });
  }

  function handleCurrency(next) {
    setCurrency(next);
    const params = new URLSearchParams(location.search);
    params.set("currency", next);
    navigate({ pathname: location.pathname, search: `?${params.toString()}` });
  }

  return (
    <header className="w-full bg-white/80 backdrop-blur sticky top-0 z-40 border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link to={`/${queryString}`} className="text-lg font-semibold">
          MKT Dashboard
        </Link>

        <nav className="ml-auto flex items-center gap-3">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              className={`px-3 py-1.5 border text-sm rounded-l-md ${
                mode === "crypto"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300"
              }`}
              onClick={() => handleToggle("crypto")}
            >
              Crypto
            </button>
            <button
              className={`px-3 py-1.5 border text-sm rounded-r-md ${
                mode === "stocks"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300"
              }`}
              onClick={() => handleToggle("stocks")}
            >
              Stocks
            </button>
          </div>

          <select
            className="border rounded-md px-2 py-1 text-sm"
            value={currency}
            onChange={(e) => handleCurrency(e.target.value)}
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="JPY">JPY</option>
          </select>

          <NavLink
            to={{ pathname: "/watchlist", search: queryString }}
            className={({ isActive }) =>
              `text-sm px-3 py-1.5 rounded-md border ${
                isActive
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-700 border-gray-300"
              }`
            }
          >
            Watchlist
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
