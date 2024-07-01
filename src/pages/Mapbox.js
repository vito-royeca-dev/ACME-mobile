import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import MapboxGL from '@rnmapbox/maps';

import Zones from '../components/Zones';
import Tunnels from '../components/Tunnels';
import SelectedTunnels from '../components/SelectedTunnels';
import StyleSelectorModal from '../components/StyleSelectorModal'; 
import RouteInfo from '../components/RouteInfo';
import Messages from '../components/Messages';
import SearchBox from '../components/SearchBox';
import MessageButton from '../components/MessageButton';

import { useMapData } from '../hooks/useMapData';
import { useCamera } from '../hooks/useCamera';
import { useViewinfo } from '../hooks/useViewInfo';

import { MAP_PK_TOKEN } from '../constants';
import { styles } from '../stylesheet/mapbox';
import { useLocation } from '../hooks/useLocation';

const MapboxScreen = () => {
  const [selectedLocation, setSelectedLocation] = useState();
  const [routeInfo, setRouteInfo] = useState(null);
  const [routeInfo1, setRouteInfo1] = useState(null);
  const [enteredZones, setEnteredZones] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [mapStyle, setMapStyle] = useState(MapboxGL.StyleURL.Street);
  
  const { tunnelInfos, zones } = useMapData();
  const { viewInfo, handleCameraChange } = useViewinfo();
  const { cameraRef, handleZoomIn, handleZoomOut } = useCamera();
  const [location, enteredZoneIndexes] = useLocation(tunnelInfos, zones);

  useEffect(() => {
    console.log(location, "===========");
    MapboxGL.setAccessToken(MAP_PK_TOKEN);
    location?.length === 2 && animateCameraToLocation(location);
    
  }, []);

  useEffect(() => {
    if (selectedLocation?.length === 2) animateCameraToLocation(selectedLocation)
  }, [selectedLocation])

  const animateCameraToLocation = (coords) => {
    coords?.length === 2 && cameraRef.current?.setCamera({
      centerCoordinate: coords,
      zoomLevel: 9,
    });
  };

  return (
    <View style={styles.root}>
      <SearchBox 
        onSelectLocation={setSelectedLocation} 
        location={location}/>
      <MessageButton />
      <View style={styles.container}>
        
        <MapboxGL.MapView
          style={styles.map}
          scrollEnabled={true}
          animationMode="easeTo"
          animationDuration={3000}
          zoomEnabled={true}
          rotateEnabled={true}
          styleURL={mapStyle}
          onPress={(info) => { setSelectedLocation(info.geometry.coordinates) }}
          onCameraChanged={handleCameraChange}
        >
          <TouchableOpacity style={styles.toggleButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.toggleButtonText}>🗺️</Text>
          </TouchableOpacity>
          <MapboxGL.Camera ref={cameraRef} />
          <MapboxGL.UserLocation
            requestsAlwaysUse={true}
           />
          <Tunnels tunnels={tunnelInfos} />
          <Zones zones={zones} />
          <SelectedTunnels
            endCoords={selectedLocation}
            setRouteInfo={setRouteInfo}
            setRouteInfo1={setRouteInfo1}
            setEnteredZones={setEnteredZones}
            tunnels={tunnelInfos}
            zones={zones}
            location={location}
            enteredZoneIndexes={enteredZoneIndexes}
          />
          {selectedLocation?.length === 2 && (
            <MapboxGL.PointAnnotation
              key='destinationPointAnnotation'
              id='destinationPointAnnotation'
              coordinate={selectedLocation}
            >
              <View style={{
                height: 22,
                width: 22,
                backgroundColor: 'white',
                borderRadius: 20,
                borderColor: '#F95B5B',
                borderWidth: 3,
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <View style={{
                  height: 10,
                  width: 10,
                  backgroundColor: '#F95B5B',
                  borderRadius: 10
                }} />
              </View>
            </MapboxGL.PointAnnotation>
          )}
        </MapboxGL.MapView>
        <View style={styles.zoomControls}>
          <TouchableOpacity style={styles.zoomButton} onPress={() => { handleZoomIn(viewInfo.zoomLevel) }}>
            <Text style={styles.zoomText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.zoomButton} onPress={() => handleZoomOut(viewInfo.zoomLevel)}>
            <Text style={styles.zoomText}>-</Text>
          </TouchableOpacity>
        </View>
      </View>
      <RouteInfo
        routeInfo={routeInfo}
        routeInfo1={routeInfo1}
      />
      <Messages enteredZones={enteredZones} />
      <StyleSelectorModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelect={(url) => setMapStyle(url)}
      />
    </View>
  );
};

export default MapboxScreen;