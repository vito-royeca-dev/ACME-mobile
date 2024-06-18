import { useState } from "react";

export const useViewinfo = () => {
  const [viewInfo, setViewInfo] = useState({ latitude: 38.90, longitude: -77.03, zoomLevel: 3.00 }); // Default location
 
  const handleCameraChange = (params) => {
    setViewInfo({
      longitude: params.properties.center[0],
      latitude: params.properties.center[1],
      zoomLevel: params.properties.zoom,
    });
  }

  return {viewInfo, handleCameraChange};
}