/**
 * CoinGecko API wrapper with simple in-memory caching.
 * Docs:
 * - Markets: https://www.coingecko.com/en/api/documentation (GET /coins/markets)
 * - Market Chart: https://www.coingecko.com/en/api/documentation (GET /coins/{id}/market_chart)
 */

const COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3";

// Very basic in-memory cache suitable for short-lived sessions.
// Keyed by request URL; values store JSON and an expiry timestamp.
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
    // Attempt to parse error body if present
    let details = "";
    try {
      const maybeJson = await response.json();
      details =
        typeof maybeJson === "object"
          ? JSON.stringify(maybeJson)
          : String(maybeJson);
    } catch (_) {
      // ignore JSON parse error of error body
    }
    const error = new Error(
      `CoinGecko request failed: ${response.status} ${response.statusText}${
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
 * Get market data for coins.
 * CoinGecko docs: GET /coins/markets
 * @param {Object} params
 * @param {string} [params.vs_currency='usd'] - The target currency of market data (usd, eur, etc.).
 * @param {string} [params.order] - Sort order, e.g., 'market_cap_desc'.
 * @param {number} [params.per_page] - Total results per page, e.g., 100.
 * @param {number} [params.page] - Page through results.
 * @param {string} [params.price_change_percentage] - Comma-separated list of 24h,7d,14d,30d,200d,1y.
 * @returns {Promise<any>} Parsed JSON array of markets.
 */
async function getMarkets({
  vs_currency = "usd",
  order,
  per_page,
  page,
  price_change_percentage,
} = {}) {
  const url = new URL(`${COINGECKO_BASE_URL}/coins/markets`);
  url.searchParams.set("vs_currency", vs_currency);
  if (order) url.searchParams.set("order", order);
  if (per_page != null) url.searchParams.set("per_page", String(per_page));
  if (page != null) url.searchParams.set("page", String(page));
  if (price_change_percentage)
    url.searchParams.set("price_change_percentage", price_change_percentage);

  // Markets change frequently; keep TTL short (e.g., 30 seconds)
  return cachedFetchJson(url.toString(), 30 * 1000);
}

/**
 * Get market chart data for a coin.
 * CoinGecko docs: GET /coins/{id}/market_chart
 * @param {string} id - Coin id (e.g., 'bitcoin').
 * @param {string} [vs_currency='usd'] - Target currency.
 * @param {number|string} [days=30] - Data up to number of days ago (e.g., 1, 7, 30, 'max').
 * @returns {Promise<any>} Parsed JSON with prices/market_caps/total_volumes arrays.
 */
async function getMarketChart(id, vs_currency = "usd", days = 30) {
  if (!id) {
    throw new Error('CoinGecko getMarketChart: "id" is required');
  }
  const url = new URL(
    `${COINGECKO_BASE_URL}/coins/${encodeURIComponent(id)}/market_chart`
  );
  url.searchParams.set("vs_currency", vs_currency);
  url.searchParams.set("days", String(days));

  // Chart data can be cached a bit longer (e.g., 2 minutes)
  return cachedFetchJson(url.toString(), 2 * 60 * 1000);
}

export const coingecko = {
  getMarkets,
  getMarketChart,
};

export default coingecko;
