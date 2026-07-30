"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useRef, useState } from "react";

export default function Navbar() {
  const path = usePathname();
  const { user, logout } = useAuth();
  
  const [indicator, setIndicator] = useState({ left: 0, width: 0, opacity: 0 });
  const linksRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const prevIndexRef = useRef<number>(-1);

  useEffect(() => {
    const paths = ["/search", "/library", "/analytics"];
    const index = paths.indexOf(path);
    
    if (index !== -1 && linksRef.current[index]) {
      const el = linksRef.current[index];
      const newLeft = el.offsetLeft;
      const newWidth = el.offsetWidth;
      
      const prevIndex = prevIndexRef.current;
      if (prevIndex !== -1 && prevIndex !== index && indicator.opacity === 1) {
        const prevEl = linksRef.current[prevIndex];
        if (prevEl) {
          const oldLeft = prevEl.offsetLeft;
          const oldRight = oldLeft + prevEl.offsetWidth;
          const newRight = newLeft + newWidth;

          if (index > prevIndex) {
            // Moving Right: Stretch to the right
            setIndicator({ left: oldLeft, width: newRight - oldLeft, opacity: 1 });
          } else {
            // Moving Left: Stretch to the left
            setIndicator({ left: newLeft, width: oldRight - newLeft, opacity: 1 });
          }

          // Shrink to the new target
          setTimeout(() => {
            setIndicator({ left: newLeft, width: newWidth, opacity: 1 });
          }, 150);
        }
      } else {
        setIndicator({ left: newLeft, width: newWidth, opacity: 1 });
      }
      
      prevIndexRef.current = index;
    } else {
      setIndicator(prev => ({ ...prev, opacity: 0 }));
      prevIndexRef.current = -1;
    }
  }, [path]);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-brand">
          <span>🎧 MeloDex</span>
        </div>
        <div className="navbar-links" style={{ position: "relative", height: "64px", alignItems: "center" }}>
          <Link ref={el => { linksRef.current[0] = el; }} href="/search" className={path === "/search" ? "active" : ""}>Search</Link>
          <Link ref={el => { linksRef.current[1] = el; }} href="/library" className={path === "/library" ? "active" : ""}>Library</Link>
          <Link ref={el => { linksRef.current[2] = el; }} href="/analytics" className={path === "/analytics" ? "active" : ""}>Analytics</Link>
          
          <div style={{
            position: "absolute",
            bottom: "-1px",
            left: indicator.left,
            width: indicator.width,
            height: "2px",
            background: "linear-gradient(to right, #6c5ce7, #00cec9)",
            opacity: indicator.opacity,
            transition: "all 0.15s ease-out",
            borderRadius: "2px",
            pointerEvents: "none"
          }} />

          <button onClick={logout} title="Logout" style={{ marginLeft: "12px" }}>
            {user} ↗
          </button>
        </div>
      </div>
    </nav>
  );
}
