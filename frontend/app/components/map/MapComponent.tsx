"use client";

import React, { useEffect, useState } from "react";
import Map, { Marker, Popup } from "react-map-gl"; 
import "mapbox-gl/dist/mapbox-gl.css";
import CustomMarker from "./CustomMarker";

type MarkerState = { longitude: number; latitude: number };
type ViewState = { longitude: number; latitude: number; zoom: number };

export interface MapComponentProps {
  onPick: (m: MarkerState) => void;     // ← کال‌بک انتخاب نقطه
  marker: MarkerState;
  initialView?: Partial<ViewState>;      // ← مرکز/زوم اولیه (اختیاری)
}

const DEFAULT_CENTER: ViewState = { longitude: 45.8853, latitude: 35.9969, zoom: 15 };

const token =
  process.env.NEXT_PUBLIC_MAPBOX_TOKEN
 

const MapboxComponent: React.FC<MapComponentProps> = ({ onPick, marker, initialView }) => {
  const [viewState, setViewState] = useState<ViewState>(() => ({
    longitude: initialView?.longitude ?? DEFAULT_CENTER.longitude,
    latitude: initialView?.latitude ?? DEFAULT_CENTER.latitude,
    zoom: initialView?.zoom ?? DEFAULT_CENTER.zoom,
  }));
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (Number.isFinite(marker?.longitude) && Number.isFinite(marker?.latitude)) {
      setViewState((prev) => ({
        ...prev,
        longitude: marker.longitude,
        latitude: marker.latitude,
      }));
    }
  }, [marker?.longitude, marker?.latitude]);

  const handleMapClick = (e: any) => {
    const { lngLat } = e;
    const picked = { longitude: lngLat.lng, latitude: lngLat.lat };
    onPick(picked);              // ← فقط یک آبجکت می‌فرستیم، نه SetStateAction
    setShowPopup(true);
  };

  return (
    <Map
      // v6: width/height باید prop باشند
      style={{ width: "100%", height: "100%" }}

      // کنترل‌شده
      longitude={viewState.longitude}
      latitude={viewState.latitude}
      zoom={viewState.zoom}
      onMove={(vp: any) => {
        setViewState((prev) => ({
          longitude: vp.longitude ?? prev.longitude,
          latitude: vp.latitude ?? prev.latitude,
          zoom: vp.zoom ?? prev.zoom,
        }));
      }}
      onClick={handleMapClick}
      
      mapStyle="mapbox://styles/mapbox/streets-v11"
      mapboxAccessToken={token}   // v6: این اسم درسته
    >
      <Marker longitude={marker.longitude} latitude={marker.latitude} >
        <CustomMarker size={30} />
      </Marker>

      {showPopup && (
        <Popup
          longitude={marker.longitude}
          latitude={marker.latitude}
          onClose={() => setShowPopup(false)}
          closeButton
          closeOnClick={false}
          anchor="top"
        >
          آدرس فروشگاه خود را مشخص نمایید.
        </Popup>
      )}
    </Map>
  );
};

export default MapboxComponent;
