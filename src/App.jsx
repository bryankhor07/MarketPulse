import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Details from "./pages/Details.jsx";
import Watchlist from "./pages/Watchlist.jsx";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <NavBar />
        <main className="py-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/details/:type/:id" element={<Details />} />
            <Route path="/watchlist" element={<Watchlist />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
