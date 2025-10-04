import { cache } from "./cache.js";

const COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3";

/**
 * Fetch JSON with caching support
 */
async function cachedFetchJson(url, ttlMs = 60 * 1000) {
  const cacheKey = url;

  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `CoinGecko API error: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  // Cache the result
  cache.set(cacheKey, data, ttlMs);

  return data;
}

/**
 * Get market data for cryptocurrencies
 */
async function getMarkets(params = {}) {
  const url = new URL(`${COINGECKO_BASE_URL}/coins/markets`);
  Object.entries(params).forEach(([key, value]) => {
    if (value != null) url.searchParams.set(key, String(value));
  });

  // Cache for 30 seconds (market data changes frequently)
  return cachedFetchJson(url.toString(), 30 * 1000);
}

/**
 * Get detailed coin data
 */
async function getCoinDetails(id) {
  if (!id) throw new Error('CoinGecko getCoinDetails: "id" is required');

  const url = new URL(`${COINGECKO_BASE_URL}/coins/${id}`);
  url.searchParams.set("localization", "false");
  url.searchParams.set("tickers", "false");
  url.searchParams.set("community_data", "false");
  url.searchParams.set("developer_data", "false");

  // Cache for 5 minutes (details don't change often)
  return cachedFetchJson(url.toString(), 5 * 60 * 1000);
}

/**
 * Get historical market chart data
 */
async function getMarketChart(id, vs_currency, days) {
  if (!id) throw new Error('CoinGecko getMarketChart: "id" is required');
  if (!vs_currency)
    throw new Error('CoinGecko getMarketChart: "vs_currency" is required');
  if (days == null)
    throw new Error('CoinGecko getMarketChart: "days" is required');

  const url = new URL(`${COINGECKO_BASE_URL}/coins/${id}/market_chart`);
  url.searchParams.set("vs_currency", vs_currency);
  url.searchParams.set("days", String(days));

  // Cache for 1 minute (chart data updates frequently)
  return cachedFetchJson(url.toString(), 60 * 1000);
}

export const coingecko = {
  getMarkets,
  getCoinDetails,
  getMarketChart,
};

export default coingecko;
