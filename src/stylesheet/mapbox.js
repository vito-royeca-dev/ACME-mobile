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
    bottom: 30,
    left: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 10,
    borderRadius: 5,
  },
  zoomControls: {
    position: 'absolute',
    bottom: 50,
    right: 10,
    flexDirection: 'column',
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
});