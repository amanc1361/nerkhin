import React, { useEffect, useState } from "react";
import Map, { Marker, Popup } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import CustomMarker from "./CustomMarker"; // Updated import path
import { ViewStateChangeEvent } from "react-map-gl/mapbox";

interface MarkerState {
  longitude: number;
  latitude: number;
}

interface MapComponentProps {
  setMarker: React.Dispatch<React.SetStateAction<MarkerState>>;
  marker: MarkerState;
}

const MapComponent: React.FC<MapComponentProps> = ({ setMarker, marker }) => {
  const [viewState, setViewState] = useState<MarkerState & { zoom: number }>({
    longitude: 45.8853,
    latitude: 35.9969,
    zoom: 15,
  });

  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (marker?.longitude && marker?.latitude) {
      setViewState((prevState) => ({
        ...prevState,
        longitude: marker.longitude,
        latitude: marker.latitude,
      }));
    }
  }, [marker]);

  const handleMapClick = (event: mapboxgl.MapMouseEvent) => {
    const { lngLat } = event;
    setMarker({
      longitude: lngLat.lng,
      latitude: lngLat.lat,
    });
    setShowPopup(true);
  };

  const handleMove = (evt: ViewStateChangeEvent) => {
    setViewState(evt.viewState);
  };

  return (
    // <Map
    //   {...viewState}
    //   style={{ width: "100%", height: "100%", borderRadius: "10px" }}
    //   mapStyle="mapbox://styles/mapbox/streets-v11"
    //   onMove={handleMove}
    //   mapboxAccessToken="pk.eyJ1IjoiaGVzdDEyMyIsImEiOiJja28wZWhscjUwZXpvMm9tdnV0NDhtYjM1In0.UuZF95SWdyCnerb0xORO6A"
    //   onClick={(e)=>handleMapClick}
    // >
      <Map width={"100%"} height={"100%"}
      onTouchMove={(e)=>handleMove}
      style={{ width: "100%", height: "100%", borderRadius: "10px" }}
      mapStyle={"mapbox://styles/mapbox/streets-v11"}
      mapboxApiAccessToken="pk.eyJ1IjoiaGVzdDEyMyIsImEiOiJja28wZWhscjUwZXpvMm9tdnV0NDhtYjM1In0.UuZF95SWdyCnerb0xORO6A"
      onClick={(e)=>handleMapClick}     >
      <Marker longitude={marker.longitude} latitude={marker.latitude}>
        <CustomMarker size={30} />
      </Marker>
      {showPopup && (
        <Popup longitude={marker.longitude} latitude={marker.latitude} onClose={() => setShowPopup(false)}>
          آدرس فروشگاه خود را مشخص نمائید.
        </Popup>
      )}
    </Map>
  );
};

export default MapComponent;
