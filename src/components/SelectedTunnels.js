import React, { memo, useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import { getRoute } from '../lib/apis';
import { useLocation } from '../hooks/useLocation';

const SelectedTunnels = ({ endCoords }) => {
  const [routeCoords, setRouteCoords] = useState([]);
  const location = useLocation();
  const [routeInfo, setRouteInfo] = useState({ distance: 0, duration: 0 });
  const id = "2";

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const { coordinates } = await getRoute(location, endCoords);
        setRouteCoords(coordinates);
      } catch (error) {
        console.error('Error fetching route:', error);
      }
    };
    fetchRoute();
  }, [location, endCoords]); // Depend on coordinates to refetch when they change

  return (
  <>
      {routeCoords?.length > 0 ? (
        <MapboxGL.ShapeSource
          id='routeSource-seleted-1' // Ensure unique ID for each instance
          key='routeSource-seleted-1' // Force re-render on route change
          shape={{
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: routeCoords
            }
          }}
        >
          <MapboxGL.LineLayer
            id='routeLayer-seleted-1' // Ensure unique ID for each instance
            style={{
              lineColor: '#FF0000',
              lineWidth: 3,
              lineOpacity: 0.7,
            }}
          />
        </MapboxGL.ShapeSource>
      ) : null}
      {routeCoords.length > 0 && (
        <MapboxGL.PointAnnotation
          id={`routeInfoAnnotation-${id}`}
          coordinate={routeCoords[Math.floor(routeCoords.length / 2)]} // Place the annotation at the midpoint of the route
        >
          <View style={{ backgroundColor: 'white', padding: 5, borderRadius: 5 }}>
            <Text>Distance: {formatDistance(routeInfo.distance)}</Text>
            <Text>Duration: {formatDuration(routeInfo.duration)}</Text>
          </View>
        </MapboxGL.PointAnnotation>
      )}
    </>
  );
};

export default memo(SelectedTunnels);