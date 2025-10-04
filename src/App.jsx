import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { WatchlistProvider } from "./contexts/WatchlistContext.jsx";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";
import NavBar from "./components/NavBar.jsx";
import NewsSidebar from "./components/NewsSidebar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Details from "./pages/Details.jsx";
import Watchlist from "./pages/Watchlist.jsx";

function AppContent() {
  const location = useLocation();

  // Determine news context based on current route
  const getNewsContext = () => {
    if (location.pathname.startsWith("/details/")) {
      const pathParts = location.pathname.split("/");
      const type = pathParts[2]; // 'crypto' or 'stock'
      const id = pathParts[3];
      return { type, symbol: id };
    } else {
      // Default to general news based on current market selection
      const params = new URLSearchParams(location.search);
      const marketType = params.get("type") || "crypto";
      return { type: marketType };
    }
  };

  const newsContext = getNewsContext();

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar />
      <div className="flex">
        <main className="flex-1 py-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/details/:type/:id" element={<Details />} />
            <Route path="/watchlist" element={<Watchlist />} />
          </Routes>
        </main>

        {/* News Sidebar - Hidden on mobile, visible on larger screens */}
        <aside className="hidden xl:block w-80 p-4">
          <div className="sticky top-20">
            <NewsSidebar type={newsContext.type} symbol={newsContext.symbol} />
          </div>
        </aside>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <WatchlistProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </WatchlistProvider>
    </ThemeProvider>
  );
}

export default App;
