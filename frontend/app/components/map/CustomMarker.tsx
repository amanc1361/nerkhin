"use client";

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
        fontSize: size * 0.7,
        lineHeight: 1,
        transform: "translateY(6px)", // کمی پایین‌تر تا نوک پین طبیعی‌تر باشد
      }}
    >
      <span>📍</span>
    </div>
  );
};

export default CustomMarker;
