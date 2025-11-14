// components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useGetMeQuery } from "@/lib/redux/api/authApi";
import { Spinner } from "flowbite-react";

export default function ProtectedRoute({ children }) {
  // Fetch current user inside the route1
  // eslint-disable-next-line no-unused-vars
  const { data: user, isLoading, isSuccess } = useGetMeQuery();

  // Show spinner while fetching user
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="xl" aria-label="Loading..." />
      </div>
    );
  }

  // If not logged in
  if (!user && !isLoading) {
    return <Navigate to="/auth" replace />;
  }

  // Render child route if user exists
  return children;
}
