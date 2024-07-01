import React, { useEffect} from 'react';
import { View, Text, Modal, TouchableOpacity, FlatList, Animated } from 'react-native';
import MapboxGL from '@rnmapbox/maps';

import { styles } from "../stylesheet/styleSelectorModal";

const styleURLs = Object.keys(MapboxGL.StyleURL).map(key => ({
  label: key,
  url: MapboxGL.StyleURL[key]
}));

const StyleSelectorModal = ({ visible, onClose, onSelect }) => {
  const opacity = new Animated.Value(0);

  useEffect(() => {
    if (visible) {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.overlay, { opacity }]}>
        <View style={styles.modal}>
          <Text style={styles.title}>Select Map Style</Text>
          <FlatList
            data={styleURLs}
            keyExtractor={(item) => item.url}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.item}
                onPress={() => {
                  onSelect(item.url);
                  onClose();
                }}
              >
                <Text style={styles.itemText}>{item.label}</Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
};

export default StyleSelectorModal;
