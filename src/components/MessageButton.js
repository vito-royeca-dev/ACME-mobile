// components/MessageButton.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useMessages } from '../hooks/useMessages'; // Assume a custom hook for socket connection
import { updateCredits } from '../lib/apis';
import { styles } from '../stylesheet/messageButton';

const MessageButton = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const scaleValue = useState(new Animated.Value(0))[0];
  const [messages, initializeMessages] = useMessages(); // Assume a custom hook that provides messages

  useEffect(() => {
    const messageCount = messages.length
    if (messageCount > 0) {
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }).start();
    }
  }, [messages]);

  const handlePress = () => {
    const totalCredits = messages.reduce((sum, message) => sum + message.credits, 0);
    
    setModalVisible(true);
    Animated.timing(scaleValue, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    if (totalCredits > 0) {
      updateCredits(totalCredits);
    }
  };

  const handleClose = () => {
    setModalVisible(false);
    initializeMessages();
  }

  return (
    <>
      <TouchableOpacity style={styles.messageButton} onPress={handlePress}>
        <Icon name="message" size={30} color="#fff" />
        {messages.length > 0 && (
          <Animated.View style={[styles.badge, { transform: [{ scale: scaleValue }] }]}>
            <Text style={styles.badgeText}>{messages.length}</Text>
          </Animated.View>
        )}
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleClose}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Inbox</Text>
          <FlatList
            data={messages}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.messageContainer}>
                <Text style={styles.messageTitle}>{item.title}</Text>
                <Text style={styles.messageBody}>{item.body}</Text>
              </View>
            )}
          />
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
};

export default MessageButton;
