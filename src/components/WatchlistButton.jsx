import { useWatchlist } from "../contexts/WatchlistContext.jsx";

export default function WatchlistButton({ instrument, className = "" }) {
  const { isWatching, addToWatchlist, removeFromWatchlist } = useWatchlist();

  const { type, id, name, symbol, image } = instrument;
  const watching = isWatching(type, id);

  const handleToggle = (e) => {
    e.stopPropagation(); // Prevent card click when button is clicked

    if (watching) {
      removeFromWatchlist(type, id);
    } else {
      addToWatchlist({ type, id, name, symbol, image });
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`inline-flex items-center justify-center w-8 h-8 rounded-full border transition-colors ${
        watching
          ? "bg-yellow-500 text-white border-yellow-500 hover:bg-yellow-600"
          : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
      } ${className}`}
      title={watching ? "Remove from watchlist" : "Add to watchlist"}
      aria-label={watching ? "Remove from watchlist" : "Add to watchlist"}
    >
      <svg
        className="w-4 h-4"
        fill={watching ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
        />
      </svg>
    </button>
  );
}
