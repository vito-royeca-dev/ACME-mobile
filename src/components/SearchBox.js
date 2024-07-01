import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, TouchableOpacity, Text, Animated } from 'react-native';
import { styles } from '../stylesheet/searchbox';
import { fetchLocations } from '../lib/apis'; // Implement this API call

const SearchBox = ({ onSelectLocation, location }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [dropdownHeight] = useState(new Animated.Value(0));

  const handleSearch = async (text) => {
    setQuery(text);
    if (text.length > 2) {
      const locations = await fetchLocations(text, location);
      setResults(locations);
      Animated.timing(dropdownHeight, {
        toValue: 300,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      setResults([]);
      Animated.timing(dropdownHeight, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  const handleSelect = (location) => {
    if (location && !isNaN(location[0]) && !isNaN(location[1])) {
      onSelectLocation(location);
      setQuery('');
      setResults([]);
      Animated.timing(dropdownHeight, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      console.error('Invalid location selected');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search for a location"
        value={query}
        onChangeText={handleSearch}
      />
      <Animated.View style={[styles.dropdown, { height: dropdownHeight }]}>
        <FlatList
          data={results}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.item} onPress={() => handleSelect(item.coordinates)}>
              <Text style={styles.itemText}>{item.address}</Text>
            </TouchableOpacity>
          )}
        />
      </Animated.View>
    </View>
  );
};

export default SearchBox;
