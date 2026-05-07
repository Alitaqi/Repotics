// App.jsx
import { BrowserRouter, Routes, Route, useLocation, matchPath } from "react-router-dom";
import Home from "./pages/Home";
import Feed from "./pages/Feed";
import Auth from "./pages/Auth";
import Dashboard from "./pages/dashboard/DashboardLayout";
import Profile from "./pages/Profile";
import FeedNav from "./components/layout/FeedNav";
import Setting from "./pages/Setting";
import Heatmap from "./pages/Heatmap";
import Analytics from "./pages/dashboard/Analytics";
import CrimeReports from "./pages/dashboard/CrimeReports";
import MissingPersonsDash from "./pages/dashboard/MissingPersons";
import MissingPersons from "./pages/MissingPersons";
import MissingPersonView from "./pages/MissingPersonView";
import ProtectedRoute from "./components/ProtectedRoute";
import { useGetMeQuery } from "@/lib/redux/api/authApi";
import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
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

  const [searchParams, setSearchParams] = useState(null);

  const showNavbarRoutes = ["/feed", "/profile/:username", "/settings", "/heatmap", "/missing-persons", "/missingperson/:id"];
  const shouldShowNavbar = showNavbarRoutes.some((route) =>
    matchPath({ path: route, end: false }, location.pathname)
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {shouldShowNavbar && <FeedNav onSearch={setSearchParams} />}

      <Routes>
        <Route path="/" element={<Navigate to="/feed" replace />} />
        <Route path="/auth" element={<Auth />} />

        <Route
          path="/feed"
          element={
            <ProtectedRoute>
              <Feed externalSearchParams={searchParams} onClearSearch={() => setSearchParams(null)} />
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

        <Route
          path="/missing-persons"
          element={
            <ProtectedRoute>
              <MissingPersons />
            </ProtectedRoute>
          }
        />

        <Route
          path="/missingperson/:id"
          element={
            <ProtectedRoute>
              <MissingPersonView/>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requireVerified={true}>
              <Dashboard/>
            </ProtectedRoute>
          }
        >
          <Route index element={<Analytics />} />
          <Route path="crime-reports" element={<CrimeReports />} />
          <Route path="missing-persons" element={<MissingPersonsDash />} />
        </Route>
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
