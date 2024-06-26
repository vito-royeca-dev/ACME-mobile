import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    height: '100%',
    width: '100%',
  },
  map: {
    flex: 1,
  },
  location: {
    position: 'absolute',
    top: 90,
    left: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 10,
    borderRadius: 5,
  },
  zoomControls: {
    position: 'absolute',
    bottom: 70,
    right: 10,
    flexDirection: 'column',
    zIndex: 3,
  },
  zoomButton: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center',
  },
  zoomText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  toggleButton: {
    position: 'absolute',
    top: 100,
    left: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    padding: 10,
    elevation: 2,
    opacity: 0.7
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});