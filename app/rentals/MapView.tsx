"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import type { Map as LMap, Marker as LMarker } from "leaflet";
import ListingCard, { type CardListing } from "@/app/components/ListingCard";

type MapListing = CardListing & { lat: number; lng: number; saved?: boolean };

const pinLabel = (n: number) => (n >= 1000 ? `₱${Math.round(n / 100) / 10}k` : `₱${n}`);

export default function MapView({ listings }: { listings: MapListing[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapObj = useRef<LMap | null>(null);
  const markers = useRef<Map<string, LMarker>>(new Map());
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !mapRef.current || mapObj.current) return;

      const map = L.map(mapRef.current, { scrollWheelZoom: true });
      mapObj.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const bounds: [number, number][] = [];
      for (const l of listings) {
        const icon = L.divIcon({
          className: "price-pin-icon",
          html: `<span class="price-pin">${pinLabel(Number(l.monthlyRent))}</span>`,
          iconSize: [0, 0],
        });
        const marker = L.marker([l.lat, l.lng], { icon }).addTo(map);
        marker.bindPopup(
          `<a href="/rentals/${l.id}" target="_blank" rel="noopener noreferrer" class="map-popup"><strong>${l.title}</strong><br/>${l.city} · ${l.barangay} · ${pinLabel(Number(l.monthlyRent))}/mo</a>`,
          { closeButton: false }
        );
        marker.on("mouseover", () => setActiveId(l.id));
        marker.on("click", () => setActiveId(l.id));
        markers.current.set(l.id, marker);
        bounds.push([l.lat, l.lng]);
      }

      map.setView([12.8797, 121.774], 5); // start zoomed out over the country
      setTimeout(() => {
        map.invalidateSize();
        if (bounds.length) map.flyToBounds(bounds, { padding: [60, 60], maxZoom: 14, duration: 1.15 });
      }, 220);
    })();

    return () => {
      cancelled = true;
      if (mapObj.current) { mapObj.current.remove(); mapObj.current = null; }
      markers.current.clear();
    };
  }, [listings]);

  useEffect(() => {
    markers.current.forEach((marker, id) => {
      const el = marker.getElement()?.querySelector(".price-pin");
      if (el) el.classList.toggle("active", id === activeId);
      marker.setZIndexOffset(id === activeId ? 1000 : 0);
    });
  }, [activeId]);

  return (
    <div className="map-split">
      <div className="map-list">
        {listings.map((l) => (
          <div
            key={l.id}
            className={`map-list-item${activeId === l.id ? " active" : ""}`}
            onMouseEnter={() => setActiveId(l.id)}
            onMouseLeave={() => setActiveId(null)}
          >
            <ListingCard l={l} saved={!!l.saved} savePath="/rentals?view=map" />
          </div>
        ))}
      </div>
      <div className="map-canvas-wrap">
        <div className="map-approx-note">📍 Locations are approximate to protect keyholders&apos; privacy.</div>
        <div className="map-canvas" ref={mapRef} />
      </div>
    </div>
  );
}
