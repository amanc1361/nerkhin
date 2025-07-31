import React from "react";

interface CustomMarkerProps {
  size?: number;
}

const CustomMarker: React.FC<CustomMarkerProps> = ({ size = 60 }) => {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontSize: size,
      }}
    >
      <span>📍</span>
    </div>
  );
};

export default CustomMarker;
