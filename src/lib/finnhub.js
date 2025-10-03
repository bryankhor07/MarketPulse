/**
 * Finnhub API wrapper with simple in-memory caching.
 * Docs:
 * - Quote: https://finnhub.io/docs/api/quote
 * - Stock Candles: https://finnhub.io/docs/api/stock-candles
 */

const FINNHUB_BASE_URL = "https://finnhub.io/api/v1";

// In-memory cache keyed by URL.
const cache = new Map();

/**
 * Fetch JSON with simple cache.
 * @param {string} url - Full request URL.
 * @param {number} ttlMs - Time to live in milliseconds.
 * @returns {Promise<any>} Parsed JSON response.
 */
async function cachedFetchJson(url, ttlMs) {
  const now = Date.now();
  const hit = cache.get(url);
  if (hit && hit.expiresAt > now) {
    return hit.data;
  }

  const response = await fetch(url);
  if (!response.ok) {
    let details = "";
    try {
      const maybeJson = await response.json();
      details =
        typeof maybeJson === "object"
          ? JSON.stringify(maybeJson)
          : String(maybeJson);
    } catch (_) {
      // ignore JSON parse error
    }
    const error = new Error(
      `Finnhub request failed: ${response.status} ${response.statusText}${
        details ? " - " + details : ""
      }`
    );
    error.status = response.status;
    throw error;
  }

  const data = await response.json();
  cache.set(url, { data, expiresAt: now + ttlMs });
  return data;
}

/**
 * Get a real-time quote for a stock symbol.
 * Finnhub docs: GET /quote
 * @param {string} symbol - Stock ticker symbol (e.g., 'AAPL').
 * @returns {Promise<any>} Parsed quote JSON.
 */
async function quote(symbol) {
  if (!symbol) {
    throw new Error('Finnhub quote: "symbol" is required');
  }
  const apiKey =
    typeof process !== "undefined"
      ? process.env?.VITE_FINNHUB_API_KEY
      : undefined;
  if (!apiKey) {
    throw new Error(
      "Finnhub API key missing. Set VITE_FINNHUB_API_KEY in your environment."
    );
  }
  const url = new URL(`${FINNHUB_BASE_URL}/quote`);
  url.searchParams.set("symbol", symbol);
  url.searchParams.set("token", apiKey);

  // Quotes move quickly; cache for a short time (e.g., 15 seconds)
  return cachedFetchJson(url.toString(), 15 * 1000);
}

/**
 * Get historical stock candles.
 * Finnhub docs: GET /stock/candle
 * @param {string} symbol - Stock ticker symbol (e.g., 'AAPL').
 * @param {string|number} resolution - Supported: 1, 5, 15, 30, 60, D, W, M
 * @param {number} from - UNIX timestamp (seconds).
 * @param {number} to - UNIX timestamp (seconds).
 * @returns {Promise<any>} Parsed candles JSON.
 */
async function stockCandles(symbol, resolution, from, to) {
  if (!symbol) throw new Error('Finnhub stockCandles: "symbol" is required');
  if (!resolution)
    throw new Error('Finnhub stockCandles: "resolution" is required');
  if (from == null) throw new Error('Finnhub stockCandles: "from" is required');
  if (to == null) throw new Error('Finnhub stockCandles: "to" is required');

  const apiKey =
    typeof process !== "undefined"
      ? process.env?.VITE_FINNHUB_API_KEY
      : undefined;
  if (!apiKey) {
    throw new Error(
      "Finnhub API key missing. Set VITE_FINNHUB_API_KEY in your environment."
    );
  }

  const url = new URL(`${FINNHUB_BASE_URL}/stock/candle`);
  url.searchParams.set("symbol", symbol);
  url.searchParams.set("resolution", String(resolution));
  url.searchParams.set("from", String(from));
  url.searchParams.set("to", String(to));
  url.searchParams.set("token", apiKey);

  // Candles data can be cached briefly (e.g., 60 seconds)
  return cachedFetchJson(url.toString(), 60 * 1000);
}

export const finnhub = {
  quote,
  stockCandles,
};

export default finnhub;
