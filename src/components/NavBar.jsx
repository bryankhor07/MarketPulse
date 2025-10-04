import { useMemo, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle.jsx";

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
    <header className="w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur sticky top-0 z-40 border-b dark:border-gray-700">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link
          to={`/${queryString}`}
          className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          aria-label="MKT Dashboard Home"
        >
          MKT Dashboard
        </Link>

        <nav
          className="ml-auto flex items-center gap-3"
          aria-label="Main navigation"
        >
          <div
            className="inline-flex rounded-md shadow-sm"
            role="group"
            aria-label="Market type selector"
          >
            <button
              className={`px-3 py-1.5 border text-sm rounded-l-md transition-colors ${
                mode === "crypto"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
              onClick={() => handleToggle("crypto")}
              aria-pressed={mode === "crypto"}
              aria-label="View cryptocurrency markets"
            >
              Crypto
            </button>
            <button
              className={`px-3 py-1.5 border text-sm rounded-r-md transition-colors ${
                mode === "stocks"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
              onClick={() => handleToggle("stocks")}
              aria-pressed={mode === "stocks"}
              aria-label="View stock markets"
            >
              Stocks
            </button>
          </div>

          <label htmlFor="currency-select" className="sr-only">
            Select currency
          </label>
          <select
            id="currency-select"
            className="border dark:border-gray-600 rounded-md px-2 py-1 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            value={currency}
            onChange={(e) => handleCurrency(e.target.value)}
            aria-label="Currency selector"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="JPY">JPY</option>
          </select>

          <ThemeToggle />

          <NavLink
            to={{ pathname: "/watchlist", search: queryString }}
            className={({ isActive }) =>
              `text-sm px-3 py-1.5 rounded-md border transition-colors ${
                isActive
                  ? "bg-gray-900 dark:bg-gray-700 text-white border-gray-900 dark:border-gray-700"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`
            }
            aria-label="View watchlist"
          >
            Watchlist
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
