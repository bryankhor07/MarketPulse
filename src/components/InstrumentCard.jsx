import WatchlistButton from "./WatchlistButton.jsx";

export default function InstrumentCard({
  type,
  id,
  name,
  symbol,
  price,
  changePct,
  marketCap,
  volume,
  image,
  onClick,
}) {
  const isPositive = (changePct || 0) >= 0;

  return (
    <article
      className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4 hover:shadow-lg dark:hover:shadow-gray-900/50 transition-all cursor-pointer group"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      aria-label={`View details for ${name} (${symbol})`}
    >
      <div className="flex items-center gap-3 mb-3">
        {image && (
          <img
            src={image}
            alt={`${name} logo`}
            className="w-10 h-10 rounded-full"
            loading="lazy"
          />
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
            {symbol}
          </p>
        </div>
        <WatchlistButton
          instrument={{ type, id, name, symbol, image }}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Add ${name} to watchlist`}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Price
          </span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {price != null ? formatPrice(price) : "N/A"}
          </span>
        </div>

        <div className="flex items-baseline justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            24h Change
          </span>
          <span
            className={`font-semibold ${
              isPositive
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
            aria-label={`24 hour change: ${
              isPositive ? "up" : "down"
            } ${Math.abs(changePct || 0).toFixed(2)} percent`}
          >
            {changePct != null
              ? `${isPositive ? "+" : ""}${changePct.toFixed(2)}%`
              : "N/A"}
          </span>
        </div>

        {marketCap != null && (
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Market Cap
            </span>
            <span className="text-sm text-gray-900 dark:text-white">
              {formatNumber(marketCap)}
            </span>
          </div>
        )}

        {volume != null && (
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Volume
            </span>
            <span className="text-sm text-gray-900 dark:text-white">
              {formatNumber(volume)}
            </span>
          </div>
        )}
      </div>
    </article>
  );
}

function formatPrice(value) {
  if (value == null) return "N/A";
  if (value >= 1) {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(value);
}

function formatNumber(value) {
  if (value == null) return "N/A";
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
}
