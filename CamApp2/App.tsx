import React, {useState, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import Home from './screens/Home';
import Signup from './screens/Signup';
import Login from './screens/Login';
import ResetPassword from './screens/ResetPassword';
import PrintPhotos from './screens/PrintPhotos';
import Cam from './screens/Camera';
import {StripeProvider} from '@stripe/stripe-react-native';
import {STRIPE_PUBLISHABLE_KEY} from '@env';
import auth from '@react-native-firebase/auth';
import {View, Text} from 'react-native';
import {store, persistor} from './redux/store';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
// import {Camera, CameraPermissionStatus} from 'react-native-vision-camera';

type StackParamList = {
  Home: {user: string};
  Signup: {user: string; password: string};
  Login: {user: string; password: string};
  Print: undefined;
  Camera: undefined;
};

const Stack = createStackNavigator<StackParamList>();

export default function App(): JSX.Element {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();
  // const [cameraPermission, setCameraPermission] =
  //   useState<CameraPermissionStatus>();
  // const [microphonePermission, setMicrophonePermission] =
  //   useState<CameraPermissionStatus>();

  // Handle user state changes
  function onAuthStateChanged(u: any) {
    setUser(u);
    if (initializing) {
      setInitializing(false);
    }
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // useEffect(() => {
  //   Camera.getCameraPermissionStatus().then(setCameraPermission);
  //   Camera.getMicrophonePermissionStatus().then(setMicrophonePermission);
  // }, []);

  if (initializing) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }

  // if (cameraPermission == null || microphonePermission == null) {
  //   // still loading
  //   return null;
  // }

  return (
    <Provider store={store}>
      <PersistGate loading={<Text>Loading...</Text>} persistor={persistor}>
        <StripeProvider
          publishableKey={STRIPE_PUBLISHABLE_KEY}
          merchantIdentifier="merchant.com.camapp">
          <NavigationContainer>
            <Stack.Navigator screenOptions={{headerShown: false}}>
              {!user ? (
                <>
                  <Stack.Screen name="Login" component={Login} />
                  <Stack.Screen name="Signup" component={Signup} />
                  <Stack.Screen name="Reset" component={ResetPassword} />
                </>
              ) : (
                <>
                  <Stack.Screen name="Home" component={Home} />
                  <Stack.Screen name="Print" component={PrintPhotos} />
                  <Stack.Screen name="Camera" component={Cam} />
                </>
              )}
            </Stack.Navigator>
          </NavigationContainer>
        </StripeProvider>
      </PersistGate>
    </Provider>
  );
}
