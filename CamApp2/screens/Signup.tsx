import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Link} from '@react-navigation/native';

export default function Signup() {
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.mainText}>Signup Page Here</Text>
      <Link to={{screen: 'Home'}}>Go home</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 92,
    paddingHorizontal: 24,
  },
  mainText: {
    color: '#000000',
    fontWeight: '700',
  },
});
