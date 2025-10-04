import { createContext, useContext, useState, useEffect } from "react";

const WatchlistContext = createContext();

const STORAGE_KEY = "mkt-dashboard-watchlist";
const ALERTS_STORAGE_KEY = "mkt-dashboard-alerts";

export function WatchlistProvider({ children }) {
  const [watchlist, setWatchlist] = useState([]);
  const [alerts, setAlerts] = useState([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedWatchlist = localStorage.getItem(STORAGE_KEY);
      if (savedWatchlist) {
        setWatchlist(JSON.parse(savedWatchlist));
      }

      const savedAlerts = localStorage.getItem(ALERTS_STORAGE_KEY);
      if (savedAlerts) {
        setAlerts(JSON.parse(savedAlerts));
      }
    } catch (error) {
      console.error(
        "Failed to load watchlist/alerts from localStorage:",
        error
      );
    }
  }, []);

  // Save to localStorage whenever watchlist changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
    } catch (error) {
      console.error("Failed to save watchlist to localStorage:", error);
    }
  }, [watchlist]);

  // Save to localStorage whenever alerts change
  useEffect(() => {
    try {
      localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(alerts));
    } catch (error) {
      console.error("Failed to save alerts to localStorage:", error);
    }
  }, [alerts]);

  const addToWatchlist = (instrument) => {
    const { type, id } = instrument;
    const key = `${type}:${id}`;

    if (!isWatching(type, id)) {
      setWatchlist((prev) => [
        ...prev,
        {
          key,
          type,
          id,
          name: instrument.name || id,
          symbol: instrument.symbol || id,
          image: instrument.image || null,
          addedAt: Date.now(),
        },
      ]);
    }
  };

  const removeFromWatchlist = (type, id) => {
    const key = `${type}:${id}`;
    setWatchlist((prev) => prev.filter((item) => item.key !== key));

    // Also remove any alerts for this instrument
    setAlerts((prev) => prev.filter((alert) => alert.key !== key));
  };

  const isWatching = (type, id) => {
    const key = `${type}:${id}`;
    return watchlist.some((item) => item.key === key);
  };

  const getWatchlist = () => watchlist;

  // Alert functions
  const addAlert = (instrument, condition, threshold) => {
    const { type, id } = instrument;
    const key = `${type}:${id}`;

    const alert = {
      key,
      type,
      id,
      name: instrument.name || id,
      symbol: instrument.symbol || id,
      condition, // 'above' or 'below'
      threshold,
      createdAt: Date.now(),
      triggered: false,
    };

    setAlerts((prev) => {
      // Remove existing alert for this instrument and condition
      const filtered = prev.filter(
        (a) => !(a.key === key && a.condition === condition)
      );
      return [...filtered, alert];
    });
  };

  const removeAlert = (type, id, condition) => {
    const key = `${type}:${id}`;
    setAlerts((prev) =>
      prev.filter(
        (alert) => !(alert.key === key && alert.condition === condition)
      )
    );
  };

  const getAlerts = () => alerts;

  const getAlertsForInstrument = (type, id) => {
    const key = `${type}:${id}`;
    return alerts.filter((alert) => alert.key === key);
  };

  const checkAlerts = (instrument, currentPrice) => {
    if (!currentPrice) return [];

    const { type, id } = instrument;
    const key = `${type}:${id}`;
    const instrumentAlerts = alerts.filter(
      (alert) => alert.key === key && !alert.triggered
    );

    const triggered = [];

    instrumentAlerts.forEach((alert) => {
      let shouldTrigger = false;

      if (alert.condition === "above" && currentPrice > alert.threshold) {
        shouldTrigger = true;
      } else if (
        alert.condition === "below" &&
        currentPrice < alert.threshold
      ) {
        shouldTrigger = true;
      }

      if (shouldTrigger) {
        triggered.push(alert);
        // Mark alert as triggered
        setAlerts((prev) =>
          prev.map((a) =>
            a.key === alert.key && a.condition === alert.condition
              ? { ...a, triggered: true, triggeredAt: Date.now() }
              : a
          )
        );
      }
    });

    return triggered;
  };

  const clearTriggeredAlerts = () => {
    setAlerts((prev) => prev.filter((alert) => !alert.triggered));
  };

  const value = {
    // Watchlist
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    isWatching,
    getWatchlist,

    // Alerts
    alerts,
    addAlert,
    removeAlert,
    getAlerts,
    getAlertsForInstrument,
    checkAlerts,
    clearTriggeredAlerts,
  };

  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (!context) {
    throw new Error("useWatchlist must be used within a WatchlistProvider");
  }
  return context;
}
