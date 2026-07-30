"use client";
import { useState, useEffect, useCallback } from "react";
import { useAuth, API } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";

interface Album {
  collectionId: number;
  collectionName: string;
  artistName: string;
  primaryGenreName: string;
  releaseDate: string;
  trackCount: number;
  artworkUrl100: string;
  collectionPrice: number;
}

export default function SearchPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Album[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);
  const [savedMap, setSavedMap] = useState<Record<number, number>>({});

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedQuery = sessionStorage.getItem("searchQuery");
      if (savedQuery) setQuery(savedQuery);
      
      const savedResults = sessionStorage.getItem("searchResults");
      if (savedResults) {
        try { setResults(JSON.parse(savedResults)); } catch {}
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("searchQuery", query);
      sessionStorage.setItem("searchResults", JSON.stringify(results));
    }
  }, [query, results]);

  useEffect(() => {
    if (!token) {
      router.replace("/login");
      return;
    }
    fetch(`${API}/api/library`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(r => r.json())
    .then(data => {
      const map: Record<number, number> = {};
      data.forEach((a: any) => map[a.appleCatalogId] = a.id);
      setSavedMap(map);
    })
    .catch(() => {});
  }, [token, router]);

  // Debounced search
  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/search?query=${encodeURIComponent(q)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = JSON.parse(await res.text());
      setResults(data.results || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const timer = setTimeout(() => doSearch(query), 400);
    return () => clearTimeout(timer);
  }, [query, doSearch]);

  const saveAlbum = async (album: Album) => {
    try {
      const res = await fetch(`${API}/api/library`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          appleCatalogId: album.collectionId,
          title: album.collectionName,
          artistName: album.artistName,
          genre: album.primaryGenreName,
          releaseDate: album.releaseDate?.split("T")[0],
          trackCount: album.trackCount,
          artworkUrl: album.artworkUrl100?.replace("100x100", "600x600"),
        }),
      });
      if (res.ok) {
        const savedData = await res.json();
        setSavedMap(prev => ({ ...prev, [album.collectionId]: savedData.id }));
        showToast("Added to library!", "success");
      } else {
        showToast("Failed to save", "error");
      }
    } catch {
      showToast("Error saving album", "error");
    }
  };

  const unsaveAlbum = async (album: Album) => {
    const dbId = savedMap[album.collectionId];
    if (!dbId) return;
    try {
      const res = await fetch(`${API}/api/library/${dbId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setSavedMap(prev => {
          const newMap = { ...prev };
          delete newMap[album.collectionId];
          return newMap;
        });
        showToast("Removed from library", "success");
      } else {
        showToast("Failed to remove", "error");
      }
    } catch {
      showToast("Error removing album", "error");
    }
  };

  const showToast = (msg: string, type: string) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  if (!token) return null;

  return (
    <>
      <Navbar />
      <div className="container">
        <div style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center", paddingBottom: "2rem" }}>
          <div className="page-header" style={{ paddingBottom: "24px" }}>
            <h1>Find your favourite</h1>
            <p>Discover albums, save your favorites, and build your personal music library</p>
          </div>
          <div className="search-bar" style={{ position: "relative" }}>
            <span className="search-icon" style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>
            <input
              className="input"
              style={{ paddingLeft: "44px" }}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search for albums, artists..."
              autoFocus
            />
          </div>
        </div>

        {loading && <div className="loading-center"><div className="spinner" /></div>}

        {!loading && results.length === 0 && query.length > 1 && (
          <div className="empty-state">
            <h3>No results found</h3>
            <p>Try a different search term</p>
          </div>
        )}



        <div className="grid-albums">
          {results.map(album => (
            <div className="album-card" key={album.collectionId}>
              <img
                src={album.artworkUrl100?.replace("100x100", "300x300")}
                alt={album.collectionName}
                loading="lazy"
              />
              <div className="album-card-info">
                <h3>{album.collectionName}</h3>
                <p>{album.artistName}</p>
              </div>
              <div className="album-card-actions">
                {savedMap[album.collectionId] ? (
                  <button 
                    className="btn btn-sm" 
                    style={{ background: "white", color: "black", borderColor: "white" }} 
                    onClick={(e) => {
                      e.stopPropagation();
                      unsaveAlbum(album);
                    }}
                  >
                    ✔ Saved
                  </button>
                ) : (
                  <button 
                    className="btn btn-primary btn-sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      saveAlbum(album);
                    }}
                  >
                    + Save
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
    </>
  );
}
