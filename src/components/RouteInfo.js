import React, { useRef, useEffect } from 'react';
import { View, Text, Animated, Easing } from 'react-native';
import { styles } from '../stylesheet/routeInfo';

const RouteInfo = ({ routeInfo, routeInfo1 }) => {
  const fadeInAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (routeInfo || routeInfo1) {
      Animated.timing(fadeInAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeInAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start();
    }
  }, [routeInfo, routeInfo1]);

  return (
    <Animated.View style={[styles.infoContainer, { opacity: fadeInAnim }]}>
      {routeInfo && (
        <View style={styles.infoBox1}>
          <Text style={styles.text}>Distance: {routeInfo.distance}</Text>
          <Text style={styles.text}>ETA: {routeInfo.duration}</Text>
          <Text style={styles.text}>Credit: {routeInfo.credits}</Text>
        </View>
      )}
      {routeInfo1 && (
        <View style={styles.infoBox2}>
          <Text style={styles.text}>Distance: {routeInfo1.distance}</Text>
          <Text style={styles.text}>ETA: {routeInfo1.duration}</Text>
          <Text style={styles.text}>Credit: {routeInfo1.credits}</Text>
        </View>
      )}
    </Animated.View>
  );
};

export default RouteInfo;
