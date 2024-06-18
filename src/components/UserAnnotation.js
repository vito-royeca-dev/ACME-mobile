import MapboxGL, { MarkerView } from '@rnmapbox/maps';
import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { useLocation } from '../hooks/useLocation';

export const UserAnnotation = () => {
  let location = useLocation();
  const userLocationGeoJSON = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: location,
        },
        properties: {},
      },
    ],
  };

  return (
    <>
      {location[0] && location[1] && (
        <MapboxGL.ShapeSource id="userLocationSource" shape={userLocationGeoJSON}>
          <MarkerView
            id="userLocationMarker"
            coordinate={location}
            allowOverlap={true}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.markerContainer}>
              <View>
                <Text style={styles.markerText}>📍</Text>
              </View>
            </View>
          </MarkerView>
        </MapboxGL.ShapeSource>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerText: {
    color: '#FFFFFF',
    fontSize: 30,
  },
});

export default memo(UserAnnotation);
