"use client";
import { useState, useEffect, useCallback } from "react";
import { useAuth, API } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from "recharts";

const COLORS = ["#6c5ce7", "#a29bfe", "#00cec9", "#feca57", "#ff6b6b", "#fd79a8", "#55efc4", "#74b9ff"];

interface Album {
  id: number;
  title: string;
  artistName: string;
  genre: string;
  releaseDate: string;
  trackCount: number;
  userRating: number | null;
}

export default function AnalyticsPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [insight, setInsight] = useState("");
  const [insightLoading, setInsightLoading] = useState(false);

  useEffect(() => {
    if (!token) router.replace("/login");
  }, [token, router]);

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/api/library`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlbums(await res.json());
    } catch { /* ignore */ }
    setLoading(false);
  }, [token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const fetchInsight = async () => {
    setInsightLoading(true);
    try {
      const res = await fetch(`${API}/api/library/insights`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      // Handle both mock and real AI response formats
      if (data.insight) {
        setInsight(data.insight);
      } else if (data.candidates) {
        setInsight(data.candidates[0]?.content?.parts?.[0]?.text || "No insight available.");
      } else {
        setInsight(JSON.stringify(data));
      }
    } catch {
      setInsight("Failed to fetch insights. Try again later.");
    }
    setInsightLoading(false);
  };

  // Chart data
  const genreData = Object.entries(
    albums.reduce((acc: Record<string, number>, a) => {
      acc[a.genre || "Unknown"] = (acc[a.genre || "Unknown"] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const artistData = Object.entries(
    albums.reduce((acc: Record<string, number>, a) => {
      acc[a.artistName] = (acc[a.artistName] || 0) + 1;
      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name: name.length > 15 ? name.slice(0, 15) + "…" : name, count }));

  const yearData = Object.entries(
    albums.reduce((acc: Record<string, number>, a) => {
      const yr = a.releaseDate?.split("-")[0] || "Unknown";
      acc[yr] = (acc[yr] || 0) + 1;
      return acc;
    }, {})
  )
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([year, count]) => ({ year, count }));

  const trackBins = [
    { range: "1-5", min: 1, max: 5 },
    { range: "6-10", min: 6, max: 10 },
    { range: "11-15", min: 11, max: 15 },
    { range: "16-20", min: 16, max: 20 },
    { range: "21+", min: 21, max: 999 },
  ];
  const histData = trackBins.map(bin => ({
    range: bin.range,
    count: albums.filter(a => a.trackCount >= bin.min && a.trackCount <= bin.max).length,
  }));

  if (!token) return null;

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="page-header">
          <h1>Analytics</h1>
          <p>Insights about your saved music library</p>
        </div>

        {/* AI Insight */}
        <div className="insight-card">
          <h3><span style={{ background: "linear-gradient(to right, #6c5ce7, #00cec9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontSize: "24px", marginRight: "8px" }}>♪</span><span style={{ background: "linear-gradient(to right, #6c5ce7, #00cec9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Music Taste Insights</span></h3>
          {insight ? (
            <p style={{ color: "#b0b0be", lineHeight: 1.8, fontSize: 15 }}>{insight}</p>
          ) : (
            <div>
              <p style={{ marginBottom: 12, color: "#8b8b9e" }}>Get AI-powered insights into your favorite genres, artists, and listening patterns.</p>
              <button className="btn btn-primary" onClick={fetchInsight} disabled={insightLoading || albums.length === 0}>
                {insightLoading ? "Analyzing..." : albums.length === 0 ? "Add albums first" : "Generate Insight"}
              </button>
            </div>
          )}
        </div>

        {loading && <div className="loading-center"><div className="spinner" /></div>}

        {!loading && albums.length === 0 && (
          <div className="empty-state">
            <h3>No data yet</h3>
            <p>Save some albums to see analytics</p>
          </div>
        )}

        {!loading && albums.length > 0 && (
          <div className="charts-grid">
            {/* Genre Pie */}
            <div className="card chart-card">
              <h3>Genre Distribution</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={genreData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                    {genreData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Artist Bar */}
            <div className="card chart-card">
              <h3>Top Artists</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={artistData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: "#8b8b9e", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#8b8b9e" }} allowDecimals={false} />
                  <Tooltip cursor={{ fill: "transparent" }} contentStyle={{ background: "#12121a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                  <Bar dataKey="count" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Releases by Year Line */}
            <div className="card chart-card">
              <h3>Releases by Year</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={yearData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="year" tick={{ fill: "#8b8b9e", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#8b8b9e" }} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "#12121a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                  <Line type="monotone" dataKey="count" stroke="#00cec9" strokeWidth={2} dot={{ fill: "#00cec9" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Track Count Histogram */}
            <div className="card chart-card">
              <h3>Track Count Distribution</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={histData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="range" tick={{ fill: "#8b8b9e" }} />
                  <YAxis tick={{ fill: "#8b8b9e" }} allowDecimals={false} />
                  <Tooltip cursor={{ fill: "transparent" }} contentStyle={{ background: "#12121a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                  <Bar dataKey="count" fill="#e056fd" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
