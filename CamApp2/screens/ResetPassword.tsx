import React, {useState} from 'react';
import {
  Text,
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import {Link} from '@react-navigation/native';

export default function ResetPassword({navigation}: {navigation: any}) {
  const [email, setEmail] = useState('');

  const forgotPW = (em: string) => {
    auth().sendPasswordResetEmail(em);
    Alert.alert('A link to reset your password has been sent to your email.');
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <Text>Reset Password</Text>
      <Text>Please enter your email:</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.textInput}
      />
      <View style={styles.buttonStyle}>
        <TouchableOpacity
          style={styles.buttonDeisgn}
          disabled={!email}
          onPress={() => forgotPW(email)}>
          <Text style={styles.buttonText}>Reset Password</Text>
        </TouchableOpacity>
        <View style={styles.buttonDeisgn}>
          <Link to={{screen: 'Login'}}>
            <Text style={styles.buttonText}>Back to Login</Text>
          </Link>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    width: '80%',
  },
  buttonStyle: {
    marginTop: 30,
    marginLeft: 15,
    marginRight: 15,
  },
  buttonDeisgn: {
    backgroundColor: '#026efd',
    padding: 10,
    borderRadius: 20,
    margin: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
  },
});
