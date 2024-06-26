import React, { memo, useEffect, useState } from 'react';
import { View, Text, FlatList  } from 'react-native';
import MapboxGL from '@rnmapbox/maps';

import UserAnnotation from './UserAnnotation';

import { useLocation } from '../hooks/useLocation';

import { calculateCredits, formatDistance, formatDuration } from '../utils/mapbox';
import { getRoute } from '../lib/apis';
import { styles } from '../stylesheet/selectedTunnels';

const SelectedTunnels = ({ endCoords, tunnels, zones }) => {
  const [location, enteredZoneIndexes] = useLocation(tunnels, zones);
  const [routeCoords, setRouteCoords] = useState([]);
  const [routeCoords1, setRouteCoords1] = useState([]);

  const [routeInfo, setRouteInfo] = useState(null);
  const [routeInfo1, setRouteInfo1] = useState(null);

  const enteredZones = zones.filter(({_id} ) => enteredZoneIndexes.includes(_id));

  useEffect(() => {
    const fetchRoute = async () => {
      const routes = await getRoute(location, endCoords, true);
      if (!routes || routes?.length === 0) return;
      const [data, data1] = routes;
      if (!data) {
        setRouteInfo(null);
        setRouteInfo1(null);
        setRouteCoords([]);
        setRouteCoords1([]);
        return;
      }

      setRouteCoords(data?.geometry?.coordinates);
      setRouteInfo({
        distance: formatDistance(data?.distance),
        duration: formatDuration(data?.duration),
        credits: calculateCredits(data, zones, tunnels),
      });
      if (!data1) {
        setRouteInfo1(null);
        setRouteCoords1([]);
        return;
      }

      setRouteCoords1(data1?.geometry?.coordinates);
      setRouteInfo1({
        distance: formatDistance(data1?.distance),
        duration: formatDuration(data1?.duration),
        credits: calculateCredits(data1, zones, tunnels),
      });
    };

    if (location?.length === 2 && endCoords?.length === 2) {
      fetchRoute();
    }
  }, [endCoords, JSON.stringify(location)]); // Depend on coordinates to refetch when they change

  return (
    <>
      {routeCoords?.length > 0 && (
        <>
          <MapboxGL.ShapeSource
            id="routeSource-selected-1" // Ensure unique ID for each instance
            key="routeSource-selected-1" // Force re-render on route change
            shape={{
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: routeCoords,
              },
            }}
          >
            <MapboxGL.LineLayer
              id="routeLayer-selected-1" // Ensure unique ID for each instance
              style={{
                lineColor: '#FF0000',
                lineWidth: 3,
                lineOpacity: 0.7,
              }}
            />
          </MapboxGL.ShapeSource>
        </>
      )}
      {routeCoords1?.length > 0 && (
        <>
          <MapboxGL.ShapeSource
            id="routeSource-selected-2" // Ensure unique ID for each instance
            key="routeSource-selected-2" // Force re-render on route change
            shape={{
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: routeCoords1,
              },
            }}
          >
            <MapboxGL.LineLayer
              id="routeLayer-selected-2" // Ensure unique ID for each instance
              style={{
                lineColor: '#0000ff',
                lineWidth: 3,
                lineOpacity: 0.7,
              }}
            />
          </MapboxGL.ShapeSource>
        </>
      )}
      <View style={styles.infoContainer}>
        {routeInfo && (
          <View style={styles.infoBox1}>
            <Text>Distance: {routeInfo.distance}</Text>
            <Text>ETA: {routeInfo.duration}</Text>
            <Text>Credit: {routeInfo.credits}</Text>
          </View>
        )}
        {routeInfo1 && (
          <View style={styles.infoBox2}>
            <Text>Distance: {routeInfo1.distance}</Text>
            <Text>ETA: {routeInfo1.duration}</Text>
            <Text>Credit: {routeInfo1.credits}</Text>
          </View>
        )}
      </View>
      <UserAnnotation location={location} />

      <View style={styles.messagesContainer}>
        {enteredZones.map(({message, _id}) => (
          <Text style={styles.message} key={String(_id)}>{message}</Text>
        )) }
      </View>
    </>
  );
};

export default memo(SelectedTunnels);