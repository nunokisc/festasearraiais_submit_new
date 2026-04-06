"use client";

// =============================================================
// MapModal.tsx
// Leaflet-powered map picker for lat/lon.
// Replaces the Google Maps modal from the legacy PHP form.
// Functional contract is identical: user picks a point → lat/lon
// fields are populated.
//
// Uses react-leaflet (already in website_new stack).
// =============================================================

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

// Lazy-load Leaflet (SSR incompatible)
const MapWithNoSSR = dynamic(() => import("./LeafletPicker"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-72 bg-gray-100 rounded-lg">
      <span className="spinner" aria-hidden="true" />
      <span className="sr-only">A carregar mapa…</span>
    </div>
  ),
});

interface MapModalProps {
  lat: string;
  lon: string;
  onConfirm: (lat: string, lon: string) => void;
  onClose: () => void;
}

export function MapModal({ lat, lon, onConfirm, onClose }: MapModalProps) {
  const [pendingLat, setPendingLat] = useState(lat);
  const [pendingLon, setPendingLon] = useState(lon);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Close on overlay click
  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === overlayRef.current) onClose();
  }

  const handlePick = useCallback((newLat: number, newLon: number) => {
    setPendingLat(newLat.toFixed(6));
    setPendingLon(newLon.toFixed(6));
  }, []);

  function handleConfirm() {
    onConfirm(pendingLat, pendingLon);
    onClose();
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="Selecionar localização no mapa"
    >
      <div className="bg-white w-full max-w-2xl rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3
            className="text-base font-semibold text-[#2d373c]"
            style={{ fontFamily: "var(--font-secondary)" }}
          >
            Selecionar localização
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Fechar mapa"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Map */}
        <div className="p-4">
          <p className="text-sm text-[#6b7280] mb-3">
            Clica no mapa para marcar a localização do evento.
          </p>
          <MapWithNoSSR
            initialLat={lat ? parseFloat(lat) : 39.5}
            initialLon={lon ? parseFloat(lon) : -8.0}
            markerLat={pendingLat ? parseFloat(pendingLat) : null}
            markerLon={pendingLon ? parseFloat(pendingLon) : null}
            onPick={handlePick}
          />
        </div>

        {/* Coordinates preview */}
        {pendingLat && pendingLon && (
          <div className="px-4 pb-2">
            <p className="text-sm text-[#6b7280]">
              <span className="font-medium text-[#2d373c]">Coordenadas:</span>{" "}
              {pendingLat}, {pendingLon}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 px-4 pb-5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-[#2d373c] hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!pendingLat || !pendingLon}
            className="flex-1 px-4 py-2.5 rounded-lg bg-[#2d373c] text-white text-sm font-medium hover:bg-[#3f5057] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirmar localização
          </button>
        </div>
      </div>
    </div>
  );
}
