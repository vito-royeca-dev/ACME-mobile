import React from 'react';
import MapboxGL from '@rnmapbox/maps';

export const Tunnel = ({ coordinates, lineColor = '#FF0000', opacity = 1, id = 1 }) => {
  return (
    <>
      {coordinates?.length > 0 && (
        <MapboxGL.ShapeSource
          id={`routeSource-${id}`}
          key={`routeSource-${id}`}
          shape={{
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates,
            }
          }}
        >
          <MapboxGL.LineLayer
            id={`routeLayer-${id}`}
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
