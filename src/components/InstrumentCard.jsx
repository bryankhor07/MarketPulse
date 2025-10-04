import { useMemo } from "react";

export default function InstrumentCard({
  type,
  id,
  name,
  symbol,
  price,
  changePct,
  marketCap,
  volume,
  onClick,
}) {
  const changeColor = useMemo(() => {
    if (changePct == null) return "text-gray-600";
    return changePct >= 0 ? "text-green-600" : "text-red-600";
  }, [changePct]);

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-lg border bg-white p-4 hover:shadow transition-shadow"
      aria-label={`${name} ${symbol}`}
    >
      <div className="flex items-baseline justify-between">
        <div>
          <div className="font-medium text-gray-900">{name}</div>
          <div className="text-xs uppercase tracking-wide text-gray-500">
            {symbol}
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold text-gray-900">
            {price != null ? formatPrice(price) : "--"}
          </div>
          <div className={`text-sm ${changeColor}`}>
            {changePct != null ? `${changePct.toFixed(2)}%` : "--"}
          </div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600">
        <div className="rounded bg-gray-50 px-2 py-1">
          <span className="text-gray-500">Mkt Cap: </span>
          <span>{marketCap != null ? formatNumber(marketCap) : "--"}</span>
        </div>
        <div className="rounded bg-gray-50 px-2 py-1">
          <span className="text-gray-500">Volume: </span>
          <span>{volume != null ? formatNumber(volume) : "--"}</span>
        </div>
      </div>
    </button>
  );
}

function formatPrice(value) {
  try {
    const abs = Math.abs(value);
    const minFrac = abs < 1 ? 4 : abs < 100 ? 2 : 2;
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: minFrac,
      maximumFractionDigits: 6,
    }).format(value);
  } catch {
    return String(value);
  }
}

function formatNumber(value) {
  try {
    return new Intl.NumberFormat(undefined, { notation: "compact" }).format(
      value
    );
  } catch {
    return String(value);
  }
}
