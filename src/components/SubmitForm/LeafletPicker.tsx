"use client";

// =============================================================
// LeafletPicker.tsx
// Thin Leaflet map + click handler — loaded dynamically (no SSR).
// Matches the Google Maps picker UX from the legacy PHP form.
// =============================================================

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

// Fix default marker icons (webpack/bundler strips the default URL)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface LeafletPickerProps {
  initialLat: number;
  initialLon: number;
  markerLat: number | null;
  markerLon: number | null;
  onPick: (lat: number, lon: number) => void;
}

function ClickHandler({ onPick }: { onPick: (lat: number, lon: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function LeafletPicker({
  initialLat,
  initialLon,
  markerLat,
  markerLon,
  onPick,
}: LeafletPickerProps) {
  const center: [number, number] = [initialLat, initialLon];

  return (
    <MapContainer
      center={center}
      zoom={markerLat ? 13 : 6}
      style={{ height: "300px", width: "100%", borderRadius: "0.5rem" }}
      className="z-0"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <ClickHandler onPick={onPick} />
      {markerLat !== null && markerLon !== null && (
        <Marker position={[markerLat, markerLon]} />
      )}
    </MapContainer>
  );
}
