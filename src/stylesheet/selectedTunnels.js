import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  infoContainer: {
    position: 'absolute',
    top: 50,
    right: 10,
  },
  infoBox1: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    opacity: 0.7,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#FF0000"
  },
  infoBox2: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    opacity: 0.7,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "blue"
  },
  messagesContainer: {
    position: 'absolute',
    bottom: 30,
    left: 10,
    right: 10,
    opacity: 0.7,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
  },
  message: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
});