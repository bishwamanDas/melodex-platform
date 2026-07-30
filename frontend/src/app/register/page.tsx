"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (password.length < 4) {
      setErr("Password must be at least 4 characters");
      return;
    }
    setLoading(true);
    try {
      await register(username, password);
      router.push("/login");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1 className="auth-brand-logo" style={{ fontSize: "2rem", background: "linear-gradient(to right, #6c5ce7, #00cec9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "0.5rem" }}>
            🎧 MeloDex
          </h1>
          <p className="subtitle">Create your account</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input className="input" value={username} onChange={e => setUsername(e.target.value)} placeholder="Pick a username" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Create a password" required />
          </div>
          {err && <p style={{ color: "var(--danger)", fontSize: 13, marginBottom: 8 }}>{err}</p>}
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Signing up..." : "Sign up"}
          </button>
        </form>
        <p className="auth-link">
          Already have an account? <Link href="/login" style={{ background: "linear-gradient(to right, #6c5ce7, #00cec9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontWeight: "bold" }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
