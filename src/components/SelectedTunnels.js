import React, { memo, useEffect, useState } from 'react';
import MapboxGL from '@rnmapbox/maps';

import UserAnnotation from './UserAnnotation';

import { useLocation } from '../hooks/useLocation';

import { calculateCredits, formatDistance, formatDuration } from '../utils/mapbox';
import { getRoute } from '../lib/apis';

const SelectedTunnels = 
({ 
  endCoords, 
  tunnels, 
  zones, 
  setRouteInfo, 
  setRouteInfo1, 
  setEnteredZones 
}) => 
{
  const [location, enteredZoneIndexes] = useLocation(tunnels, zones);
  const [routeCoords, setRouteCoords] = useState([]);
  const [routeCoords1, setRouteCoords1] = useState([])

  useEffect(() => {
    console.log(2);
    const enteredZones = zones.filter(({_id} ) => enteredZoneIndexes.includes(_id));
    setEnteredZones(enteredZones)
  }, [JSON.stringify(enteredZoneIndexes), JSON.stringify(zones)]);

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
  }, [endCoords, JSON.stringify(location)]);

  return (
    <>
      {routeCoords?.length > 0 && (
        <>
          <MapboxGL.ShapeSource
            id="routeSource-selected-1"
            key="routeSource-selected-1"
            shape={{
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: routeCoords,
              },
            }}
          >
            <MapboxGL.LineLayer
              id="routeLayer-selected-1"
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
            id="routeSource-selected-2"
            key="routeSource-selected-2"
            shape={{
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: routeCoords1,
              },
            }}
          >
            <MapboxGL.LineLayer
              id="routeLayer-selected-2"
              style={{
                lineColor: '#0000ff',
                lineWidth: 3,
                lineOpacity: 0.7,
              }}
            />
          </MapboxGL.ShapeSource>
        </>
      )}
      <UserAnnotation location={location} />
    </>
  );
};

export default memo(SelectedTunnels);