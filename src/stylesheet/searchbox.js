// searchBox.js (styles)
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 10,
    right: 10,
    zIndex: 3,
    opacity: 0.7
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    backgroundColor: 'white',
  },
  dropdown: {
    borderColor: 'gray',
    borderWidth: 1,
    borderTopWidth: 0,
    backgroundColor: 'white',
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    overflow: 'hidden',
  },
  item: {
    padding: 10,
  },
  itemText: {
    fontSize: 16,
  },
});
