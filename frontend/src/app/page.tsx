"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (token) {
      router.replace("/search");
    } else {
      router.replace("/login");
    }
  }, [token, router]);

  return (
    <div className="loading-center" style={{ minHeight: "100vh" }}>
      <div className="spinner" />
    </div>
  );
}
