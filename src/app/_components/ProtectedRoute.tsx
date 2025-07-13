"use client";

import { RootState } from "@/fetures/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from "react-redux";

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  adminOnly = false,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const router = useRouter();
  const { currentUser, isAuthenticated, isAdmin, loading } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    if (!loading) {
      // Check if user is authenticated
      if (!isAuthenticated || !currentUser) {
        router.push(redirectTo);
        return;
      }

      // Check if admin access is required
      if (adminOnly && !isAdmin) {
        router.push("/"); // Redirect to home if not admin
        return;
      }
    }
  }, [
    currentUser,
    isAuthenticated,
    isAdmin,
    loading,
    router,
    adminOnly,
    redirectTo,
  ]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Don't render anything if not authenticated or not admin (when required)
  if (!isAuthenticated || !currentUser || (adminOnly && !isAdmin)) {
    return null;
  }

  return <>{children}</>;
}
