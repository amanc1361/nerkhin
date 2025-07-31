"use client";

import { useEffect } from "react";
import { useRouter, usePathname, redirect } from "next/navigation";
import useAuth from "@/app/hooks/useAuth";
import React from "react"; // Explicitly import React for React.FC

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const router = useRouter(); // router is not used, can be removed if not needed elsewhere
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();

  const windowIsNotUndefined = typeof window !== "undefined";
  const localStorageNotUndefined = typeof localStorage !== "undefined";

  const sharedPaths = ["/print-price-list"];
  const adminAllowedPathsPrefixes = ["/panel"]; // Changed to prefixes for better matching
  const userAllowedPathsPrefixes = ["/bazaar"]; // Changed to prefixes for better matching

  const getUserRole = (): number => {
    if (windowIsNotUndefined && localStorageNotUndefined) {
      const userString = localStorage.getItem("user");
      if (userString) {
        try {
          const user = JSON.parse(userString);
          return user?.role || 0;
        } catch (error) {
          console.error("Failed to parse user from localStorage", error);
        }
      }
    }
    return 0; // Default to 0 if no user or parsing fails
  };

  const userRole = getUserRole();
  const isAdmin = userRole === 1 || userRole === 2;
  const isUser = userRole === 3 || userRole === 4;

  const isPathAllowed = (path: string, allowedPrefixes: string[]): boolean => {
    return allowedPrefixes.some(prefix => path.startsWith(prefix)) || sharedPaths.includes(path);
  };

  const handleUserNavigation = () => {
    if (isLoading) {
      return; // Still loading, do nothing
    }

    if (!isAuthenticated) {
      redirect("/auth/login");
      return;
    }

    // Check if the current path is allowed for the user's role
    if (isAdmin && !isPathAllowed(pathname, adminAllowedPathsPrefixes)) {
      redirect("/panel");
      return;
    }

    if (isUser && !isPathAllowed(pathname, userAllowedPathsPrefixes)) {
      redirect("/bazaar/shop"); // Assuming /bazaar/shop is the default for users
      return;
    }
  };

  useEffect(() => {
    handleUserNavigation();
  }, [isAuthenticated, isLoading, pathname, userRole]); // Added pathname and userRole to dependencies

  // Render null or a loading indicator while redirecting or loading
  if (!isAuthenticated || isLoading ||
      (isAdmin && !isPathAllowed(pathname, adminAllowedPathsPrefixes)) ||
      (isUser && !isPathAllowed(pathname, userAllowedPathsPrefixes))) {
    return <p>Redirecting...</p>;
  }

  return children;
};

export default ProtectedRoute;
