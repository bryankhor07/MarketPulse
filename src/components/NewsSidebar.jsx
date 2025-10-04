import { useState, useEffect } from "react";
import { finnhub } from "../lib/finnhub.js";

export default function NewsSidebar({ type, symbol }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchNews() {
      setLoading(true);
      setError("");

      try {
        if (type === "stock") {
          // For stocks, try to get company-specific news first, fallback to general news
          let newsData = [];

          if (symbol) {
            try {
              // Get news from the last 7 days
              const today = new Date().toISOString().split("T")[0];
              const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0];

              const companyNews = await finnhub.getCompanyNews(
                symbol,
                weekAgo,
                today
              );
              if (Array.isArray(companyNews) && companyNews.length > 0) {
                newsData = companyNews.slice(0, 5); // Limit to 5 items
              }
            } catch (companyError) {
              console.warn(
                `Failed to fetch company news for ${symbol}:`,
                companyError
              );
            }
          }

          // If no company news, get general market news
          if (newsData.length === 0) {
            const generalNews = await finnhub.getNews("general");
            if (Array.isArray(generalNews)) {
              newsData = generalNews.slice(0, 5);
            }
          }

          setNews(newsData);
        } else if (type === "crypto") {
          // For crypto, get crypto news from Finnhub
          const cryptoNews = await finnhub.getNews("crypto");
          if (Array.isArray(cryptoNews)) {
            setNews(cryptoNews.slice(0, 5));
          } else {
            setNews([]);
          }
        }
      } catch (err) {
        setError(err?.message || "Failed to load news");
        setNews([]);
      } finally {
        setLoading(false);
      }
    }

    fetchNews();
  }, [type, symbol]);

  const formatTime = (timestamp) => {
    try {
      const date = new Date(timestamp * 1000);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 60) {
        return `${diffMins}m ago`;
      } else if (diffHours < 24) {
        return `${diffHours}h ago`;
      } else {
        return `${diffDays}d ago`;
      }
    } catch {
      return "Recently";
    }
  };

  const handleNewsClick = (url) => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  if (loading) {
    return (
      <div className="w-80 bg-white rounded-lg border p-4">
        <h3 className="text-lg font-semibold mb-4">Latest News</h3>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-3 bg-gray-200 rounded mb-2"></div>
              <div className="h-2 bg-gray-100 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-80 bg-white rounded-lg border p-4">
        <h3 className="text-lg font-semibold mb-4">Latest News</h3>
        <div className="text-red-600 text-sm">
          <p>Failed to load news</p>
          <p className="text-xs text-gray-500 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="w-80 bg-white rounded-lg border p-4">
        <h3 className="text-lg font-semibold mb-4">Latest News</h3>
        <div className="text-gray-500 text-sm">No news available</div>
      </div>
    );
  }

  return (
    <div className="w-70 bg-white rounded-lg border p-4">
      <h3 className="text-lg font-semibold mb-4">
        Latest News
        {symbol && (
          <span className="text-sm text-gray-600 font-normal ml-2">
            ({symbol})
          </span>
        )}
      </h3>

      <div className="space-y-4">
        {news.map((article, index) => (
          <div
            key={index}
            className="border-b border-gray-100 pb-3 last:border-b-0 cursor-pointer hover:bg-gray-50 p-2 -m-2 rounded transition-colors"
            onClick={() => handleNewsClick(article.url)}
          >
            <h4 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 hover:text-blue-600">
              {article.headline}
            </h4>

            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="truncate">
                {article.source || "Unknown Source"}
              </span>
              <span className="ml-2 flex-shrink-0">
                {formatTime(article.datetime)}
              </span>
            </div>

            {article.summary && (
              <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                {article.summary}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-500 text-center">
          News provided by Finnhub
        </p>
      </div>
    </div>
  );
}
