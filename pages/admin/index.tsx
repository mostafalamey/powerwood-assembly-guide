import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../contexts/AuthContext";

export default function AdminDashboard() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      // Redirect to cabinets page
      router.push("/admin/cabinets");
    }
  }, [isAuthenticated, loading, router]);

  return null;
}
