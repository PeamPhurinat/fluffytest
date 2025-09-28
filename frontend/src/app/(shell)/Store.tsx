"use client";
import * as React from "react";

/* =======================
   Types
======================= */
export type Status = "Lost" | "Found";
export type Species = "Dog" | "Cat" | "Other";

export type Post = {
  id: string;
  name: string;
  color?: string;
  species: Species;
  breed?: string;
  location?: string;            // human-readable place
  locationLat?: number;         // map coord (optional but recommended)
  locationLng?: number;         // map coord (optional but recommended)
  status: Status;
  description?: string;
  photoUrl?: string;            // data URL or remote URL
  createdAt: string;            // ISO
};

export type Pet = {
  id: string;
  name: string;
  species: Species;
  color?: string;
  age?: string;
  breed?: string;
  photoUrl?: string;
  notes?: string;
};

export type Profile = {
  fullName?: string;
  email?: string;
  city?: string;
  phone?: string;
  radiusKm?: number;
  pushEnabled?: boolean;
};

export type LatLng = { lat: number; lng: number };

type Filters = { query: string; status: "All" | Status; species: "All" | Species };

type Store = {
  posts: Post[];
  pets: Pet[];
  profile: Profile;
  filters: Filters;

  // NEW: radius & user location (used by your Map + Topbar)
  radiusKm: number;
  setRadiusKm: (km: number) => void;
  userLocation: LatLng | null;
  setUserLocation: (pos: LatLng | null) => void;

  addPost: (p: Omit<Post, "id" | "createdAt">) => string; // returns id
  deletePost: (id: string) => void;
  markFound: (id: string) => void;
  getPost: (id: string) => Post | undefined;

  addPet: (p: Omit<Pet, "id">) => string;
  deletePet: (id: string) => void;

  setProfile: (p: Partial<Profile>) => void;
  setFilters: (f: Partial<Filters>) => void;
};

const StoreCtx = React.createContext<Store | null>(null);

/* =======================
   Defaults
======================= */
const DEFAULT_POSTS: Post[] = [
  {
    id: crypto.randomUUID?.() || String(Math.random()),
    name: "Ty",
    species: "Dog",
    status: "Found",
    location: "Kmitl",
    locationLat: 13.731, locationLng: 100.778,
    photoUrl:
      "https://images.unsplash.com/photo-1507149833265-60c372daea22?q=80&w=1200&auto=format&fit=crop",
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID?.() || String(Math.random()),
    name: "Tee",
    species: "Dog",
    status: "Lost",
    location: "Rama 3",
    locationLat: 13.695, locationLng: 100.532,
    photoUrl:
      "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=1200&auto=format&fit=crop",
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_PETS: Pet[] = [
  {
    id: crypto.randomUUID?.() || String(Math.random()),
    name: "Peam",
    species: "Dog",
    breed: "Dachshund",
    color: "Brown",
    age: "2 years",
    photoUrl:
      "https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=1200&auto=format&fit=crop",
  },
];

const DEFAULT_PROFILE: Profile = { radiusKm: 5, pushEnabled: false };
const DEFAULT_FILTERS: Filters = { query: "", status: "All", species: "All" };

/* =======================
   Provider (SSR-safe)
======================= */
export default function StoreProvider({ children }: { children: React.ReactNode }) {
  // Core state (start empty/neutral; hydrate in effect)
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [pets, setPets] = React.useState<Pet[]>([]);
  const [profile, setProfileState] = React.useState<Profile>(DEFAULT_PROFILE);
  const [filters, setFiltersState] = React.useState<Filters>(DEFAULT_FILTERS);

  // NEW: radius & user location used for filtering + map
  const [radiusKm, setRadiusKm] = React.useState<number>(DEFAULT_PROFILE.radiusKm || 0);
  const [userLocation, setUserLocation] = React.useState<LatLng | null>(null);

  // -------- Hydrate from localStorage (browser only) --------
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      setPosts(JSON.parse(localStorage.getItem("pf.posts") || "null") || DEFAULT_POSTS);
      setPets(JSON.parse(localStorage.getItem("pf.pets") || "null") || DEFAULT_PETS);
      setProfileState(JSON.parse(localStorage.getItem("pf.profile") || "null") || DEFAULT_PROFILE);
      setFiltersState(JSON.parse(localStorage.getItem("pf.filters") || "null") || DEFAULT_FILTERS);

      const savedRadius = Number(localStorage.getItem("pf.radiusKm")) || (DEFAULT_PROFILE.radiusKm ?? 0);
      setRadiusKm(savedRadius);

      const savedLoc = JSON.parse(localStorage.getItem("pf.userLocation") || "null");
      setUserLocation(savedLoc);
    } catch (e) {
      console.warn("Store hydration error:", e);
    }
  }, []);

  // -------- Persist to localStorage --------
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("pf.posts", JSON.stringify(posts));
  }, [posts]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("pf.pets", JSON.stringify(pets));
  }, [pets]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("pf.profile", JSON.stringify(profile));
  }, [profile]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("pf.filters", JSON.stringify(filters));
  }, [filters]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("pf.radiusKm", String(radiusKm));
  }, [radiusKm]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("pf.userLocation", JSON.stringify(userLocation));
  }, [userLocation]);

  // -------- Mutations --------
  const addPost: Store["addPost"] = (p) => {
    const id = crypto.randomUUID?.() || String(Math.random());
    setPosts((cur) => [{ id, createdAt: new Date().toISOString(), ...p }, ...cur]);
    return id;
  };

  const deletePost: Store["deletePost"] = (id) =>
    setPosts((cur) => cur.filter((p) => p.id !== id));

  const markFound: Store["markFound"] = (id) =>
    setPosts((cur) => cur.map((p) => (p.id === id ? { ...p, status: "Found" } : p)));

  const getPost: Store["getPost"] = (id) => posts.find((p) => p.id === id);

  const addPet: Store["addPet"] = (p) => {
    const id = crypto.randomUUID?.() || String(Math.random());
    setPets((cur) => [{ id, ...p }, ...cur]);
    return id;
  };

  const deletePet: Store["deletePet"] = (id) =>
    setPets((cur) => cur.filter((p) => p.id !== id));

  const setProfile: Store["setProfile"] = (p) =>
    setProfileState((cur) => ({ ...cur, ...p }));

  const setFilters: Store["setFilters"] = (f) =>
    setFiltersState((cur) => ({ ...cur, ...f }));

  const value: Store = {
    posts,
    pets,
    profile,
    filters,

    radiusKm,
    setRadiusKm,
    userLocation,
    setUserLocation,

    addPost,
    deletePost,
    markFound,
    getPost,

    addPet,
    deletePet,

    setProfile,
    setFilters,
  };

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

/* =======================
   Hooks
======================= */
export function useStore() {
  const ctx = React.useContext(StoreCtx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export function useFilteredPosts() {
  const { posts, filters, radiusKm, userLocation } = useStore();
  const q = filters.query.toLowerCase();

  // basic text/species/status filter
  let res = posts.filter((p) => {
    if (filters.status !== "All" && p.status !== filters.status) return false;
    if (filters.species !== "All" && p.species !== filters.species) return false;
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      (p.location || "").toLowerCase().includes(q) ||
      (p.breed || "").toLowerCase().includes(q) ||
      (p.description || "").toLowerCase().includes(q)
    );
  });

  // Optional: radius filter if we have a user location and a radius > 0
  if (userLocation && radiusKm > 0) {
    const R = 6371; // km
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const withinRadius = (lat1: number, lng1: number, lat2: number, lng2: number) => {
      const dLat = toRad(lat2 - lat1);
      const dLng = toRad(lng2 - lng1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
          Math.cos(toRad(lat2)) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c <= radiusKm;
    };

    res = res.filter((p) => {
      if (typeof p.locationLat !== "number" || typeof p.locationLng !== "number") return true; // keep if no coords
      return withinRadius(userLocation.lat, userLocation.lng, p.locationLat, p.locationLng);
    });
  }

  return res;
}

/* =======================
   Small helper
======================= */
export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
