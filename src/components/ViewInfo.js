import { memo } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';

import { styles } from '../stylesheet/mapbox';

const ViewInfo = ({viewInfo, handleZoomIn, handleZoomOut}) => {

  return (
    <>
      <View style={styles.location}>
        <Text>Lat: {viewInfo.latitude.toFixed(1)} | Lng: {viewInfo.longitude.toFixed(2)} | Zoom: {viewInfo.zoomLevel.toFixed(2)}</Text>
      </View>
      <View style={styles.zoomControls}>
        <TouchableOpacity style={styles.zoomButton} onPress={() => handleZoomIn(viewInfo.zoomLevel)}>
          <Text style={styles.zoomText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.zoomButton} onPress={() => handleZoomOut(viewInfo.zoomLevel)}>
          <Text style={styles.zoomText}>-</Text>
        </TouchableOpacity>
      </View>
    </>
  )
}

export default ViewInfo;