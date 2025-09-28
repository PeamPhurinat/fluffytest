"use client";

import Link from "next/link";
import styles from "./Shell.module.css";
import { useStore } from "./Store";

export default function Topbar({ onMenu }: { onMenu: () => void }) {
  const {
    filters, setFilters,
    radiusKm, setRadiusKm,
    userLocation, setUserLocation,
  } = useStore();

  async function locateMe() {
    if (!("geolocation" in navigator)) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        console.warn("Geolocation error:", err);
      }
    );
  }

  return (
    <div className={`${styles.toolbar} py-2 px-3`}>
      <div className="d-flex gap-2 align-items-center">
        <button className="btn btn-outline-secondary d-lg-none" onClick={onMenu}>
          <i className="bi bi-list" />
        </button>

        {/* Search */}
        <div className="input-group" style={{ maxWidth: 520 }}>
          <span className="input-group-text bg-white"><i className="bi bi-search" /></span>
          <input
            className="form-control"
            placeholder="Hinted search text"
            value={filters.query}
            onChange={(e) => setFilters({ query: e.target.value })}
          />
        </div>

        {/* Radius slider + locate button */}
        <div className="ms-auto d-flex align-items-center gap-2">
          <div className="dropdown">
            <button className="btn btn-light border dropdown-toggle" data-bs-toggle="dropdown">
              {filters.status === "All" ? "All Post" : filters.status}
            </button>
            <ul className="dropdown-menu">
              {["All","Lost","Found"].map((opt) => (
                <li key={opt}>
                  <button className="dropdown-item" onClick={() => setFilters({ status: opt as any })}>
                    {opt}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="dropdown">
            <button className="btn btn-light border dropdown-toggle" data-bs-toggle="dropdown">
              {filters.species === "All" ? "All Species" : filters.species}
            </button>
            <ul className="dropdown-menu">
              {["All","Dog","Cat","Other"].map((opt) => (
                <li key={opt}>
                  <button className="dropdown-item" onClick={() => setFilters({ species: opt as any })}>
                    {opt}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Radius control */}
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-geo-alt" title="Your location set" />
            <input
              type="range"
              min={0}
              max={15}
              step={1}
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
            />
            <span className="text-muted small" style={{ width: 70, textAlign: "right" }}>
              {radiusKm} km
            </span>
            <button
              className="btn btn-outline-primary"
              title="Use my current location"
              onClick={locateMe}
            >
              <i className="bi bi-crosshair" />
            </button>
          </div>

          <button className="btn btn-outline-secondary">
            <i className="bi bi-bell" />
          </button>
          <Link href="/signin">
            <img
              src="https://i.pravatar.cc/80?img=12"
              className={`border ${styles.avatar}`}
              alt="avatar"
            />
          </Link>
        </div>
      </div>
    </div>
  );
}
