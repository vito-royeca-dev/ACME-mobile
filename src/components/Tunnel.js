import React from 'react';
import MapboxGL from '@rnmapbox/maps';

export const Tunnel = ({ coordinates, lineColor = '#FF0000', opacity = 1, id = 1 }) => {
  return (
    <>
      {coordinates?.length > 0 && (
        <MapboxGL.ShapeSource
          id={`routeSource-${id}`} // Ensure unique ID for each instance
          key={`routeSource-${id}`} // Force re-render on route change
          shape={{
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates,
            }
          }}
        >
          <MapboxGL.LineLayer
            id={`routeLayer-${id}`} // Ensure unique ID for each instance
            style={{
              lineColor,
              lineWidth: 3,
              lineOpacity: Number(opacity),
            }}
          />
        </MapboxGL.ShapeSource>
      )}
    </>
  );
};
