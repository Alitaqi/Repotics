import { BrowserRouter, Routes, Route, useLocation, matchPath } from "react-router-dom";
import Home from "./pages/Home";
import Feed from "./pages/Feed";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import FeedNav from "./components/layout/FeedNav";

function App() {
  const location = useLocation();

  const showNavbarRoutes = ['/feed', '/profile/:userId'];

  // Use matchPath correctly for v6, pattern first then pathname
  const shouldShowNavbar = showNavbarRoutes.some(route =>
    matchPath({ path: route, end: false }, location.pathname)
  );

  return (
    <div>
      {shouldShowNavbar && <FeedNav />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/profile/:userId" element={<Profile />} />
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
