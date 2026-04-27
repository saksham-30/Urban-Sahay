import { useEffect, useRef } from "react";
import { MapPin } from "lucide-react";

interface Provider {
  id: string;
  name: string;
  lat: number;
  lng: number;
  rating: number;
  verified: boolean;
}

interface LocationMapProps {
  userLocation: { lat: number; lng: number } | null;
  providers: Provider[];
}

const LocationMap = ({ userLocation, providers }: LocationMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const center = userLocation || { lat: 18.5204, lng: 73.8567 }; // Pune default

  useEffect(() => {
    if (!mapRef.current) return;

    // Inject Leaflet CSS if not already present
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // Inject Leaflet JS if not already present
    const initMap = () => {
      const L = (window as any).L;
      if (!L || !mapRef.current) return;

      // Clear previous map instance
      if ((mapRef.current as any)._leaflet_id) {
        (mapRef.current as any)._leaflet_id = null;
        mapRef.current.innerHTML = "";
      }

      const map = L.map(mapRef.current, {
        scrollWheelZoom: false,
        zoomControl: true,
        attributionControl: false,
      }).setView([center.lat, center.lng], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
      }).addTo(map);

      // User location marker (blue)
      const userIcon = L.divIcon({
        className: "",
        html: `<div style="width:18px;height:18px;background:hsl(221,83%,53%);border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });

      L.marker([center.lat, center.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup("<b>Your Location</b>");

      // Provider markers (orange/red)
      const bounds = [L.latLng(center.lat, center.lng)];

      providers.forEach((p) => {
        const color = p.verified ? "hsl(25,95%,53%)" : "hsl(0,0%,60%)";
        const providerIcon = L.divIcon({
          className: "",
          html: `<div style="position:relative;">
            <div style="width:14px;height:14px;background:${color};border:2px solid white;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.25);"></div>
          </div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });

        L.marker([p.lat, p.lng], { icon: providerIcon })
          .addTo(map)
          .bindPopup(
            `<div style="font-family:system-ui;min-width:120px;">
              <b style="font-size:13px;">${p.name}</b><br/>
              <span style="font-size:11px;color:#666;">⭐ ${p.rating} ${p.verified ? "✓ Verified" : ""}</span>
            </div>`
          );

        bounds.push(L.latLng(p.lat, p.lng));
      });

      // Fit map to show all markers
      if (bounds.length > 1) {
        map.fitBounds(L.latLngBounds(bounds), { padding: [40, 40], maxZoom: 14 });
      }
    };

    if (!(window as any).L) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      initMap();
    }
  }, [center.lat, center.lng, providers]);

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-border shadow-soft relative z-0">
      <div ref={mapRef} className="w-full h-[280px]" style={{ zIndex: 0 }} />
      <div className="bg-card px-4 py-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1 font-medium text-foreground">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
          You
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />
          Verified providers
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-gray-400 inline-block" />
          Unverified
        </span>
        <span>•</span>
        <span>{providers.length} providers nearby</span>
      </div>
    </div>
  );
};

export default LocationMap;
