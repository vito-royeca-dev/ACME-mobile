import React, { useEffect, useState } from 'react';
import MapboxGL from '@rnmapbox/maps';
import { getRoute } from '../lib/apis';
export const Tunnel = ({ startCoords, endCoords, lineColor = '#FF0000', opacity = 1, id = 1 }) => {
  const [routeCoords, setRouteCoords] = useState([]);

  useEffect(() => {
    const fetchRoute = async () => {
      const routes = await getRoute(startCoords, endCoords);
      if (routes?.length > 0) {
        setRouteCoords(routes[0].geometry.coordinates);
      }
    };

    fetchRoute();
  }, []); // Depend on coordinates to refetch when they change

  return (
    <>
      {routeCoords?.length > 0 && (
        <MapboxGL.ShapeSource
          id={`routeSource-${id}`} // Ensure unique ID for each instance
          key={`routeSource-${id}`} // Force re-render on route change
          shape={{
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: routeCoords
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
