// app/[role]/account/map/MapPicker.tsx
"use client";

import { useEffect, useRef } from "react";
import mapboxgl, { Map, Marker, LngLatLike } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

/** مختصات پیش‌فرض شهر بانه */
const BANEH_CENTER = { lat: 35.9975, lng: 45.8853 } as const;

export default function MapPicker({
  lat,
  lng,
  onChange,
  height = 240,
  zoom = 12,
  className = "",
}: {
  /** مقدار فعلی عرض جغرافیایی (string برای سینک با input) */
  lat?: string;
  /** مقدار فعلی طول جغرافیایی (string برای سینک با input) */
  lng?: string;
  /** اعلام مختصات جدید به والد — همیشه به صورت string پاس می‌دهیم */
  onChange: (lat: string, lng: string) => void;
  /** ارتفاع نقشه */
  height?: number;
  /** زوم اولیه */
  zoom?: number;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const markerRef = useRef<Marker | null>(null);

  // تبدیل ورودی‌های string به عدد؛ اگر نامعتبر بود به بانه می‌افتد
  const parseCenter = (): { lat: number; lng: number } => {
    const hasLat = typeof lat === "string" && lat.trim() !== "";
    const hasLng = typeof lng === "string" && lng.trim() !== "";
    if (hasLat && hasLng) {
      const la = Number(lat);
      const lo = Number(lng);
      if (Number.isFinite(la) && Number.isFinite(lo)) return { lat: la, lng: lo };
    }
    return { ...BANEH_CENTER };
  };

  // ساخت نقشه یک بار
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const centerNow = parseCenter();
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [centerNow.lng, centerNow.lat] as LngLatLike,
      zoom,
      // برای SSR ایمن است چون "use client" داریم
    });

    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "top-right");
    map.addControl(new mapboxgl.FullscreenControl(), "top-right");
    map.addControl(new mapboxgl.GeolocateControl({ trackUserLocation: false }), "top-right");

    // مارکر اولیه
    const marker = new mapboxgl.Marker({ draggable: true })
      .setLngLat([centerNow.lng, centerNow.lat])
      .addTo(map);

    // درگ مارکر → onChange
    marker.on("dragend", () => {
      const p = marker.getLngLat();
      onChange(String(p.lat), String(p.lng));
    });

    // کلیک روی نقشه → جابجایی مارکر + onChange
    map.on("click", (e) => {
      const { lat: la, lng: lo } = e.lngLat;
      marker.setLngLat([lo, la]);
      onChange(String(la), String(lo));
    });

    mapRef.current = map;
    markerRef.current = marker;

    // اگر والد مختصات نداشت، همان اول مقدار بانه را به بالا اعلام کن
    const hasInitial = typeof lat === "string" && lat.trim() !== "" && typeof lng === "string" && lng.trim() !== "";
    if (!hasInitial) {
      onChange(String(centerNow.lat), String(centerNow.lng));
    }

    return () => {
      marker.remove();
      map.remove();
      markerRef.current = null;
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // وقتی props lat/lng از بیرون تغییر می‌کند (مثلاً با دکمه «انتخاب موقعیت فعلی»)
  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;
    if (!map || !marker) return;

    const centerNow = parseCenter();
    marker.setLngLat([centerNow.lng, centerNow.lat]);
    map.flyTo({ center: [centerNow.lng, centerNow.lat], zoom, essential: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: "100%", height }}
      aria-label="mapbox-map-picker"
    />
  );
}
