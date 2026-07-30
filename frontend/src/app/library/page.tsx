"use client";
import { useState, useEffect, useCallback } from "react";
import { useAuth, API } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";

interface SavedAlbum {
  id: number;
  appleCatalogId: number;
  title: string;
  artistName: string;
  genre: string;
  releaseDate: string;
  trackCount: number;
  artworkUrl: string;
  userRating: number | null;
  userNotes: string | null;
}

export default function LibraryPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [albums, setAlbums] = useState<SavedAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<SavedAlbum | null>(null);
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);

  useEffect(() => {
    if (!token) router.replace("/login");
  }, [token, router]);

  const fetchAlbums = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/api/library`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlbums(await res.json());
    } catch { /* ignore */ }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    fetchAlbums();
  }, [fetchAlbums]);

  const deleteAlbum = async (id: number) => {
    await fetch(`${API}/api/library/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setAlbums(prev => prev.filter(a => a.id !== id));
    showToast("Removed from library", "success");
  };

  const openEdit = (album: SavedAlbum) => {
    setEditing(album);
    setRating(album.userRating || 0);
    setNotes(album.userNotes || "");
  };

  const saveEdit = async () => {
    if (!editing) return;
    await fetch(`${API}/api/library/${editing.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userRating: rating, userNotes: notes }),
    });
    setAlbums(prev =>
      prev.map(a => a.id === editing.id ? { ...a, userRating: rating, userNotes: notes } : a)
    );
    setEditing(null);
    showToast("Album updated!", "success");
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
        <div className="page-header">
          <h1>Your Collection</h1>
          <p>{albums.length} album{albums.length !== 1 ? "s" : ""} saved</p>
        </div>

        {loading && <div className="loading-center"><div className="spinner" /></div>}

        {!loading && albums.length === 0 && (
          <div className="empty-state">
            <h3>Your collection is empty</h3>
            <p>Start discovering albums and build your personal music library.</p>
          </div>
        )}

        <div className="grid-albums">
          {albums.map(album => (
            <div className="album-card" key={album.id}>
              <img
                src={album.artworkUrl || "/placeholder.png"}
                alt={album.title}
                loading="lazy"
              />
              <button 
                className="bookmark-remove-btn"
                onClick={(e) => { e.stopPropagation(); deleteAlbum(album.id); }}
                title="Remove from library"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                </svg>
              </button>
              <div className="album-card-info">
                <h3>{album.title}</h3>
                <p>{album.artistName}</p>
                {album.userRating ? (
                  <p style={{ color: "var(--warning)", fontSize: 12, marginTop: 4 }}>
                    {"★".repeat(album.userRating)}{"☆".repeat(5 - album.userRating)}
                  </p>
                ) : (
                  <p style={{ color: "var(--warning)", fontSize: 12, marginTop: 4 }}>
                    Rate ☆
                  </p>
                )}
              </div>
              <div className="album-card-actions">
                <button className="btn btn-primary btn-sm" onClick={() => openEdit(album)}>Edit</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Edit: {editing.title}</h2>
            <div className="form-group">
              <label>Rating</label>
              <div className="stars">
                {[1, 2, 3, 4, 5].map(i => (
                  <button key={i} className={i <= rating ? "filled" : ""} onClick={() => setRating(i)} style={{ fontSize: "36px", background: "none", border: "none", cursor: "pointer", color: "#feca57", padding: "0 4px", lineHeight: 1 }}>
                    {i <= rating ? "★" : "☆"}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Notes</label>
              <textarea
                className="input"
                rows={3}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Add personal notes about this album..."
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveEdit}>Save</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}
    </>
  );
}
