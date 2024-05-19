import React, { useRef, useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { MagnifyingGlassIcon } from 'react-native-heroicons/outline';

const SearchBar = ({onChange, showSearch, toggleSearch}) => {
    const inputRef = useRef(null);

  return (
    <View style={[styles.container, {backgroundColor: showSearch? 'rgba(255, 255, 255, 0.2)': 'transparent'}]}>
        {
            showSearch ? (
                <TextInput
                  ref={inputRef}
                  style={styles.input}
                  placeholder="Search City"
                  placeholderTextColor="lightgray"
                  onChangeText={onChange}
                />
            ) : null
        }
      <TouchableOpacity style={styles.button} onPress={() => {
            toggleSearch(!showSearch);
            if (!showSearch) {
                setTimeout(() => {
                  if (inputRef.current) {
                    inputRef.current.focus();
                  }
                }, 100); // Delay to ensure input is rendered before focus
              }
        }} >
        <MagnifyingGlassIcon color="white" size={20} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 30,
    paddingHorizontal: 10,
    marginVertical: 10,
    height: '7%',
    marginHorizontal: 16,
    justifyContent: 'flex-end'
  },
  input: {
    flex: 1,
    color: 'white',
    paddingVertical: 5,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  button: {
    padding: 10,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});

export default SearchBar;
