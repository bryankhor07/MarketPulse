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
  const apiKey = import.meta.env.VITE_FINNHUB_API_KEY;
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

  const apiKey = import.meta.env.VITE_FINNHUB_API_KEY;
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

/**
 * Get general market news.
 * Finnhub docs: GET /news
 * @param {string} [category] - News category (e.g., 'general', 'forex', 'crypto', 'merger').
 * @param {number} [minId] - The ID of the first news item to fetch.
 * @returns {Promise<any>} Parsed news JSON.
 */
async function getNews(category = "general", minId = 0) {
  const apiKey = import.meta.env.VITE_FINNHUB_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Finnhub API key missing. Set VITE_FINNHUB_API_KEY in your environment."
    );
  }

  const url = new URL(`${FINNHUB_BASE_URL}/news`);
  url.searchParams.set("category", category);
  url.searchParams.set("minId", String(minId));
  url.searchParams.set("token", apiKey);

  // News can be cached for a short time (e.g., 5 minutes)
  return cachedFetchJson(url.toString(), 5 * 60 * 1000);
}

/**
 * Get company-specific news.
 * Finnhub docs: GET /company-news
 * @param {string} symbol - Stock ticker symbol (e.g., 'AAPL').
 * @param {string} from - Start date in YYYY-MM-DD format.
 * @param {string} to - End date in YYYY-MM-DD format.
 * @returns {Promise<any>} Parsed company news JSON.
 */
async function getCompanyNews(symbol, from, to) {
  if (!symbol) throw new Error("Finnhub getCompanyNews: 'symbol' is required");
  if (!from) throw new Error("Finnhub getCompanyNews: 'from' date is required");
  if (!to) throw new Error("Finnhub getCompanyNews: 'to' date is required");

  const apiKey = import.meta.env.VITE_FINNHUB_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Finnhub API key missing. Set VITE_FINNHUB_API_KEY in your environment."
    );
  }

  const url = new URL(`${FINNHUB_BASE_URL}/company-news`);
  url.searchParams.set("symbol", symbol);
  url.searchParams.set("from", from);
  url.searchParams.set("to", to);
  url.searchParams.set("token", apiKey);

  // Company news can be cached briefly (e.g., 10 minutes)
  return cachedFetchJson(url.toString(), 10 * 60 * 1000);
}

export const finnhub = {
  quote,
  stockCandles,
  getNews,
  getCompanyNews,
};

export default finnhub;
