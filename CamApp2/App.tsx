/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import Home from './screens/Home';
import Signup from './screens/Signup';
import Login from './screens/Login';
import PrintPhotos from './screens/PrintPhotos';
import Camera from './screens/Camera';

type StackParamList = {
  Home: undefined;
  Signup: {user: string; password: string};
  Login: {user: string; password: string};
  Print: undefined;
  Camera: undefined;
};

const Stack = createStackNavigator<StackParamList>();

export default function App(): JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{headerShown: false}}
        initialRouteName="Home">
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Print" component={PrintPhotos} />
        <Stack.Screen name="Camera" component={Camera} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
