import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Feed from "./pages/Feed";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import FeedNav from "./components/layout/FeedNav";

function App() {
  const location = useLocation(); // Get the current route location

  // Define the routes where FeedNav (navbar) should be visible
  const showNavbarRoutes = ['/feed', '/profile'];

  // Check if the current route is one of the specified routes
  const shouldShowNavbar = showNavbarRoutes.includes(location.pathname);

  return (
    <div>
      {/* Conditionally render the FeedNav only on specific routes */}
      {shouldShowNavbar && <FeedNav />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </div>
  );
}

export default function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}
