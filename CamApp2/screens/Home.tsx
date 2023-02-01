import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {Link} from '@react-navigation/native';

export default function Home() {
  return (
    <View style={styles.sectionContainer}>
      <TouchableOpacity style={styles.startCamera}>
        <Link to={{screen: 'Camera'}}>
          <Text style={styles.mainText}>Start Camera</Text>
        </Link>
      </TouchableOpacity>
      <TouchableOpacity style={styles.startCamera}>
        <Link to={{screen: 'Print'}}>
          <Text style={styles.mainText}>Checkout</Text>
        </Link>
      </TouchableOpacity>
      <TouchableOpacity style={styles.startCamera}>
        <Link to={{screen: 'Login'}}>
          <Text style={styles.mainText}>Login</Text>
        </Link>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  startCamera: {
    width: 130,
    borderRadius: 20,
    backgroundColor: '#14274e',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    margin: 10,
  },
});
