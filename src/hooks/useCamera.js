import { useRef } from "react";

export const useCamera = () => {
  const cameraRef = useRef(null);
  
  const handleZoomIn = (zoomLevel) => {
    const newZoomLevel = zoomLevel + 1;
    cameraRef.current?.zoomTo(newZoomLevel, 500);
  };
  
  const handleZoomOut = (zoomLevel) => {
    const newZoomLevel = zoomLevel - 1;
    cameraRef.current?.zoomTo(newZoomLevel, 500);
  };

  return {cameraRef, handleZoomIn, handleZoomOut}
}