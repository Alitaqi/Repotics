// App.jsx
import { BrowserRouter, Routes, Route, useLocation, matchPath } from "react-router-dom";
import Home from "./pages/Home";
import Feed from "./pages/Feed";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import FeedNav from "./components/layout/FeedNav";
import Setting from "./pages/Setting";
import Heatmap from "./pages/Heatmap";
// import MissingPersons from "./pages/MissingPersons";
import ProtectedRoute from "./components/ProtectedRoute";
import { useGetMeQuery } from "@/lib/redux/api/authApi";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { setUser, logout } from "@/lib/redux/slices/authSlice";
import { Navigate } from "react-router-dom";

function App() {
  const location = useLocation();
  const dispatch = useDispatch();

  // call /me via RTK Query
  const { data, error, isLoading, isFetching } = useGetMeQuery();

  // debug log to inspect what's coming back
  useEffect(() => {
    console.log("useGetMeQuery -> data:", data, "error:", error, "isLoading:", isLoading, "isFetching:", isFetching);
  }, [data, error, isLoading, isFetching]);

  // normalize & dispatch user when we get it
  useEffect(() => {
    if (data) {
      // some backends return { user: {...} } others return user object directly
      const me = data.user ?? data;
      console.log("Dispatching setUser:", me);
      dispatch(setUser(me));
    } else if (error) {
      console.warn("Auth /me returned error:", error);
      // if 401 or unauthenticated, clear auth
      dispatch(logout());
    }
  }, [data, error, dispatch]);

  // Manual fallback: if RTK Query didn't return user, try a raw fetch (useful for diagnosing credentials/cors)
  useEffect(() => {
    if (!data && !isLoading) {
      (async () => {
        try {
          const res = await fetch("/me", { credentials: "include" }); // adjust path if your endpoint is /api/me
          console.log("/me manual fetch status:", res.status);
          if (res.ok) {
            const json = await res.json();
            const me = json.user ?? json;
            console.log("Manual /me fetch ->", me);
            dispatch(setUser(me));
          } else {
            if (res.status === 401) dispatch(logout());
          }
        } catch (err) {
          console.error("Manual /me fetch failed:", err);
        }
      })();
    }
  }, [data, isLoading, dispatch]);

  const showNavbarRoutes = ["/feed", "/profile/:username", "/settings", "/heatmap", "/missing-persons"];
  const shouldShowNavbar = showNavbarRoutes.some((route) =>
    matchPath({ path: route, end: false }, location.pathname)
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {shouldShowNavbar && <FeedNav />}

      <Routes>
        <Route path="/" element={<Navigate to="/feed" replace />} />
        <Route path="/auth" element={<Auth />} />

        <Route
          path="/feed"
          element={
            <ProtectedRoute>
              <Feed />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:username"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Setting />
            </ProtectedRoute>
          }
        />

        <Route
          path="/heatmap"
          element={
            <ProtectedRoute>
              <Heatmap />
            </ProtectedRoute>
          }
        />

        {/* <Route
          path="/missing-persons"
          element={
            <ProtectedRoute>
              <MissingPersons />
            </ProtectedRoute>
          }
        /> */}
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
