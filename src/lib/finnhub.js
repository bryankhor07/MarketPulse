import { cache } from "./cache.js";

const FINNHUB_BASE_URL = "https://finnhub.io/api/v1";

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
      `Finnhub API error: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  // Cache the result
  cache.set(cacheKey, data, ttlMs);

  return data;
}

/**
 * Get a real-time quote for a stock symbol
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

  // Quotes move quickly; cache for 15 seconds
  return cachedFetchJson(url.toString(), 15 * 1000);
}

/**
 * Get historical stock candles
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

  // Candles data can be cached for 1 minute
  return cachedFetchJson(url.toString(), 60 * 1000);
}

/**
 * Get general market news
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

  // News can be cached for 5 minutes
  return cachedFetchJson(url.toString(), 5 * 60 * 1000);
}

/**
 * Get company-specific news
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

  // Company news can be cached for 10 minutes
  return cachedFetchJson(url.toString(), 10 * 60 * 1000);
}

export const finnhub = {
  quote,
  stockCandles,
  getNews,
  getCompanyNews,
};

export default finnhub;
