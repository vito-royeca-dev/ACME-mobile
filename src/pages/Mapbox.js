import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import MapboxGL from '@rnmapbox/maps'; // Import from '@rnmapbox/maps' for older versions

import Zones from '../components/Zones';
import Tunnels from '../components/Tunnels';
import SelectedTunnels from '../components/SelectedTunnels';

import { useMapData } from '../hooks/useMapData';
import { useCamera } from '../hooks/useCamera';
import { useViewinfo } from '../hooks/useViewInfo';

import { MAP_PK_TOKEN } from '../constants';
import { styles } from '../stylesheet/mapbox';

const MapboxScreen = () => {
  const [selectedLocation, setSelectedLocation] = useState();
  const {tunnelInfos, zones} = useMapData();
  const {viewInfo, handleCameraChange} = useViewinfo();
  const {cameraRef, handleZoomIn, handleZoomOut} = useCamera();
  useEffect(() => {
    MapboxGL.setAccessToken(MAP_PK_TOKEN);
  }, []);

  return (
    <View style={styles.root}>
      <View style={styles.container}>
        <MapboxGL.MapView
          style={styles.map}
          scrollEnabled={true}
          zoomEnabled={true}
          rotateEnabled={true}
          onPress={(info) => { setSelectedLocation(info.geometry.coordinates) }}
          onCameraChanged={ handleCameraChange }
        >
          <MapboxGL.Camera
            ref={cameraRef}
          />
          <Tunnels tunnels={tunnelInfos} />
          <Zones zones={zones}/>
          <SelectedTunnels endCoords={selectedLocation} tunnels={tunnelInfos} zones={zones} />
        </MapboxGL.MapView>
        <View style={styles.location}>
          <Text>Lat: {viewInfo.latitude.toFixed(1)} | Lng: {viewInfo.longitude.toFixed(2)} | Zoom: {viewInfo.zoomLevel.toFixed(2)}</Text>
        </View>
        <View style={styles.zoomControls}>
          <TouchableOpacity style={styles.zoomButton} onPress={() => {handleZoomIn(viewInfo.zoomLevel)}}>
            <Text style={styles.zoomText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.zoomButton} onPress={() => handleZoomOut(viewInfo.zoomLevel)}>
            <Text style={styles.zoomText}>-</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default MapboxScreen;