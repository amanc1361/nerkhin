// components/map/MapPicker.tsx
"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import Map, {
  Marker,
  NavigationControl,
  GeolocateControl,
} from "react-map-gl/mapbox";
import { useMemo } from "react";

type Props = {
  lat?: string | number | null;
  lng?: string | number | null;
  onChange: (lat: string, lng: string) => void;
  className?: string;
  height?: number; // px
};

// مرکز پیش‌فرض (تهران)
const DEFAULT_CENTER = { lat: 35.6892, lng: 51.389 };

export default function MapPicker({
  lat,
  lng,
  onChange,
  className,
  height = 200,
}: Props) {
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

  const center = useMemo(() => {
    const la = Number(lat);
    const lo = Number(lng);
    return Number.isFinite(la) && Number.isFinite(lo)
      ? { lat: la, lng: lo }
      : DEFAULT_CENTER;
  }, [lat, lng]);

  const latNum = Number(lat);
  const lngNum = Number(lng);
  const hasPoint = Number.isFinite(latNum) && Number.isFinite(lngNum);

  return (
    <div
      className={`overflow-hidden rounded-xl ${className || ""}`}
      style={{ height }}
    >
      <Map
        mapboxAccessToken={accessToken}               // ✅ v7
        initialViewState={{
          latitude: center.lat,
          longitude: center.lng,
          zoom: 12,
        }}
        onClick={(e) => {
          const la = e.lngLat.lat;
          const lo = e.lngLat.lng;
          onChange(la.toString(), lo.toString());
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
      >
        <Marker
          latitude={hasPoint ? latNum : center.lat}
          longitude={hasPoint ? lngNum : center.lng}
          draggable
          onDragEnd={(e) => {
            const la = e.lngLat.lat;
            const lo = e.lngLat.lng;
            onChange(la.toString(), lo.toString());
          }}
        />
        <NavigationControl position="bottom-right" />  {/* ✅ v7 دارد */}
        <GeolocateControl position="bottom-right" trackUserLocation />
      </Map>
    </div>
  );
}
