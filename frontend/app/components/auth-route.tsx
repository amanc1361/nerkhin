"use client";

import { useEffect } from "react";
import { redirect } from "next/navigation";
import useAuth from "@/app/hooks/useAuth";
import React from "react"; // Explicitly import React for React.FC

interface AuthRouteProps {
  children: React.ReactNode;
}

const AuthRoute: React.FC<AuthRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const userString = localStorage.getItem("user");
      if (userString) {
        try {
          const user = JSON.parse(userString);
          const userRole = user?.role;
          if ([3, 4].includes(userRole)) {
            redirect("/bazaar");
          } else if ([1, 2].includes(userRole)) { // Assuming roles 1 and 2 are for panel access
            redirect("/panel");
          } 
        } catch (error) {
          console.error("Failed to parse user from localStorage", error);
          // Optionally redirect to login or handle error
        }
      }
    }
  }, [isAuthenticated, isLoading]);

  if (isAuthenticated || isLoading) {
    return <p>Redirecting...</p>;
  }

  return children;
};

export default AuthRoute;
