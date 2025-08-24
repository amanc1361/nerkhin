// components/map/MapPicker.tsx
"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import React, { useMemo, useState } from "react";
import ReactMapGL, {
  Marker,
  NavigationControl,
  GeolocateControl,
  ViewportProps,
} from "react-map-gl";

type Props = {
  lat?: string | number | null;
  lng?: string | number | null;
  onChange: (lat: string, lng: string) => void;
  className?: string;
  height?: number; // px
};

// مرکز پیش‌فرض (تهران)
const DEFAULT_CENTER = { latitude: 35.6892, longitude: 51.3890, zoom: 12 };

export default function MapPicker({
  lat,
  lng,
  onChange,
  className,
  height = 180,
}: Props) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

  const center = useMemo(() => {
    const la = Number(lat);
    const lo = Number(lng);
    if (!Number.isFinite(la) || !Number.isFinite(lo)) return DEFAULT_CENTER;
    return { latitude: la, longitude: lo, zoom: 12 };
  }, [lat, lng]);

  // ✅ تمام کلیدهای لازم ViewportProps را مقداردهی می‌کنیم
  const [viewport, setViewport] = useState<ViewportProps>(() => ({
    width: "100%",
    height,
    latitude: center.latitude,
    longitude: center.longitude,
    zoom: center.zoom,
    bearing: 0,
    pitch: 0,
    altitude: 1.5,
    maxZoom: 22,
    minZoom: 0,
    maxPitch: 85,
    minPitch: 0,
    // اگر تایپ شما فیلدهای دیگری هم خواست، اینجا مقداردهی کنید
    // transitionInterpolator, transitionDuration, transitionEasing ... (اختیاری)
  }));

  // کلیک روی نقشه → ست شدن مختصات
  const handleMapClick = (e: any) => {
    // react-map-gl v5/v6: e.lngLat = [lng, lat]
    const [lngClick, latClick] = e?.lngLat || [];
    if (typeof latClick === "number" && typeof lngClick === "number") {
      onChange(latClick.toString(), lngClick.toString());
      setViewport((v) => ({ ...v, latitude: latClick, longitude: lngClick }));
    }
  };

  // جابجایی مارکر
  const handleMarkerDragEnd = (e: any) => {
    const [lngDrag, latDrag] = e?.lngLat || [];
    if (typeof latDrag === "number" && typeof lngDrag === "number") {
      onChange(latDrag.toString(), lngDrag.toString());
      setViewport((v) => ({ ...v, latitude: latDrag, longitude: lngDrag }));
    }
  };

  // موقعیت فعلی کاربر با API خود مرورگر
  const gotoCurrentLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const la = pos.coords.latitude;
        const lo = pos.coords.longitude;
        onChange(la.toString(), lo.toString());
        setViewport((v) => ({ ...v, latitude: la, longitude: lo, zoom: 14 }));
      },
      () => {}
    );
  };

  return (
    <div className={`relative overflow-hidden rounded-xl ${className || ""}`} style={{ height }}>
      <ReactMapGL
        {...viewport}
        mapboxApiAccessToken={token}                 
        mapStyle="mapbox://styles/mapbox/streets-v11"
        onViewportChange={(next: ViewportProps) =>
          // ✅ همیشه width/height را نگه داریم تا اندازه‌ها نپرد
          setViewport((v) => ({ ...v, ...next, width: "100%", height }))
        }
        onClick={handleMapClick}
      >
        <Marker
          latitude={Number(lat) || (viewport.latitude as number)}
          longitude={Number(lng) || (viewport.longitude as number)}
          draggable
          onDragEnd={handleMarkerDragEnd}
        />

        {/* کنترل‌ها در نسخه‌های قدیمی position prop ندارند → با absolute جای‌گذاری */}
        <div style={{ position: "absolute", right: 8, bottom: 8 }}>
          <NavigationControl />
        </div>
        <div style={{ position: "absolute", right: 8, bottom: 60 }}>
          <GeolocateControl trackUserLocation />
        </div>
      </ReactMapGL>

      {/* دکمه کمکی برای ست‌کردن موقعیت فعلی (به‌دلیل تفاوت امضای onGeolocate) */}
      <button
        type="button"
        onClick={gotoCurrentLocation}
        className="absolute left-2 bottom-2 rounded-md bg-white/90 px-2 py-1 text-xs shadow"
      >
        موقعیت فعلی
      </button>
    </div>
  );
}
