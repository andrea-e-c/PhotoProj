import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {Link} from '@react-navigation/native';
import auth from '@react-native-firebase/auth';

export default function Home() {
  const user = auth().currentUser;

  const logout = () => {
    auth()
      .signOut()
      .then(() => console.log('user signed out'));
  };

  return (
    <View style={styles.sectionContainer}>
      {user ? (
        <Text style={styles.welcome}>Welcome {user.email}</Text>
      ) : (
        <Text>Welcome!</Text>
      )}
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
      <TouchableOpacity style={styles.startCamera} onPress={logout}>
        <Text style={styles.mainText}>Log out</Text>
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
  welcome: {
    fontSize: 20,
    color: '#14274e',
    padding: 20,
    fontWeight: 600,
    textAlign: 'center',
  },
});
