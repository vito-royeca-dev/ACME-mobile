import React, { useEffect, useRef } from 'react';
import { View, Image, ImageBackground, Animated, TouchableOpacity, Text } from 'react-native';

import { signIn } from '../lib/apis';
import { styles } from '../stylesheet/login';

const LoginScreen = ({ onLogin }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <ImageBackground source={require('../assets/background.jpg')} style={styles.background}>
      <View style={styles.overlay}>
        <Animated.View style={{ ...styles.container, opacity: fadeAnim }}>
          <TouchableOpacity style={styles.googleButton} onPress={() => signIn(onLogin)}>
            <Image source={require('../assets/google logo.jpg')} style={styles.googleLogo} />
            <Text style={styles.googleButtonText}>Sign in with Google</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </ImageBackground>
  );
};

export default LoginScreen;