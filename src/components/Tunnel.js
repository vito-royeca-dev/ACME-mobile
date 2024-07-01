import React from 'react';
import MapboxGL from '@rnmapbox/maps';

export const Tunnel = ({ coordinates, lineColor = '#FF0000', opacity = 1, id = 1 }) => {
  // console.log(coordinates);  
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
              lineWidth: [
                'interpolate',
                ['linear'],
                ['zoom'],
                5, 5,     // At zoom level 5, the line width will be 2
                10, 12,   // At zoom level 10, the line width will be 12
                15, 20,   // At zoom level 15, the line width will be 20
                20, 100
              ],
              lineOpacity: Number(opacity),
            }}
          />
        </MapboxGL.ShapeSource>
      )}
    </>
  );
};
