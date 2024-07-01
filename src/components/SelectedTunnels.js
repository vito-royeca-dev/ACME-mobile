import React, { memo, useEffect, useState, useRef } from 'react';
import MapboxGL from '@rnmapbox/maps';

import { calculateCredits } from '../utils/mapbox';
import { getTwoRoute } from '../lib/apis';

const SelectedTunnels = 
({ 
  endCoords, 
  tunnels, 
  zones, 
  setRouteInfo, 
  setRouteInfo1, 
  setEnteredZones,
  location,
  enteredZoneIndexes
}) => 
{
  const [routeCoords, setRouteCoords] = useState([]);
  const [routeCoords1, setRouteCoords1] = useState([]);
  const [animationProgress, setAnimationProgress] = useState(0);
  const animationFrameId = useRef(null);

  useEffect(() => {
    const enteredZones = zones.filter(({_id} ) => enteredZoneIndexes.includes(_id));
    setEnteredZones(enteredZones)
  }, [JSON.stringify(enteredZoneIndexes), JSON.stringify(zones)]);

  useEffect(() => {
    const fetchRoute = async () => {
      const routes = await getTwoRoute(location, endCoords);
      if (!routes || routes?.length === 0) return;
      
      const [data1, data2] = routes;
      if (!data1) {
        setRouteInfo(null);
        setRouteInfo1(null);
        setRouteCoords([]);
        setRouteCoords1([]);
        return;
      }

      setRouteCoords(data1.coords);
      setRouteInfo({
        distance: data1.distance,
        duration: data1.duration,
        credits: calculateCredits(data1.coords, zones, tunnels),
      });

      if (!data2) {
        setRouteInfo1(null);
        setRouteCoords1([]);
        return;
      }

      setRouteCoords1(data2.coords);
      setRouteInfo1({
        distance: data2.distance,
        duration: data2.duration,
        credits: calculateCredits(data2.coords, zones, tunnels),
      });

      setAnimationProgress(0);
    };

    if (location?.length === 2 && endCoords?.length === 2) {
      fetchRoute();
    }
  }, [endCoords]);

  useEffect(() => {
    if (routeCoords.length > 0 || routeCoords1.length > 0) {
      const animateLine = () => {
        setAnimationProgress(progress => {
          if (progress < 1) {
            animationFrameId.current = requestAnimationFrame(animateLine);
            return progress + 0.01; // Adjust the increment to control speed
          } else {
            cancelAnimationFrame(animationFrameId.current);
            return 1;
          }
        });
      };

      animationFrameId.current = requestAnimationFrame(animateLine);
      return () => cancelAnimationFrame(animationFrameId.current);
    }
  }, [routeCoords, routeCoords1]);

  const createAnimatedLineLayer = (id, coordinates, color) => (
    <MapboxGL.ShapeSource
      id={id}
      key={id}
      shape={{
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates,
        },
      }}
    >
      <MapboxGL.LineLayer
        id={`layer-${id}`}
        style={{
          lineColor: color,
          lineWidth: [
            'interpolate',
            ['linear'],
            ['zoom'],
            5, 3,     // At zoom level 5, the line width will be 2
            10, 7,   // At zoom level 10, the line width will be 12
            15, 10,   // At zoom level 15, the line width will be 20
            20, 70
          ],
          lineOpacity: 0.5,
          lineDasharray: [animationProgress, 1 - animationProgress],
        }}
      />
    </MapboxGL.ShapeSource>
  );

  return (
    <>
      {routeCoords?.length > 0 && createAnimatedLineLayer('routeSource-selected-1', routeCoords, '#FF0000')}
      {routeCoords1?.length > 0 && createAnimatedLineLayer('routeSource-selected-2', routeCoords1, '#0000ff')}
    </>
  );
};

export default memo(SelectedTunnels);