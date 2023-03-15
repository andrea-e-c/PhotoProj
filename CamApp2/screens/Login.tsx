import React, {useState} from 'react';
import {View, Text, StyleSheet, TextInput, Button, Alert} from 'react-native';
import {Link} from '@react-navigation/native';
import auth from '@react-native-firebase/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const loginUser = (uname: string, pw: string) => {
    auth()
      .signInWithEmailAndPassword(uname, pw)
      .then(() => {
        console.log('User account created & signed in!');
      })
      .catch(error => {
        if (error.code === 'auth/invalid-email') {
          console.log('That email address is invalid!');
          Alert.alert('Error', 'That email address is invalid.');
        }

        if (error.code === 'auth/wrong-password') {
          console.log('That password is incorrect!');
          Alert.alert('Hmm, something went wrong', 'Incorrect password');
        }

        if (error.code === 'auth/user-not-found') {
          console.log('User not found');
          Alert.alert(
            'Oops',
            'That email address is not in use. Click the sign up button to create an account.',
          );
        }

        console.error(error);
        Alert.alert('Unknown Error', error);
      });
  };

  return (
    <View style={styles.container}>
      <View style={styles.Middle}>
        <Text style={styles.LoginText}>Login</Text>
      </View>
      {/* username input */}
      <View style={styles.buttonStyle}>
        <View style={styles.emailInput}>
          <TextInput
            placeholder="Username"
            value={email}
            onChangeText={setEmail}
            style={styles.textInput}
          />
        </View>
      </View>
      {/* password input */}
      <View style={styles.buttonStyleX}>
        <View style={styles.emailInput}>
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            style={styles.textInput}
            secureTextEntry
          />
        </View>
      </View>
      <View style={styles.buttonStyle}>
        <View style={styles.buttonDeisgn}>
          <Button
            disabled={!email && !password}
            onPress={() => loginUser(email, password)}
            title="Login"
          />
        </View>
      </View>
      <View>
        <Link to={{screen: 'Reset'}} style={styles.signupText}>
          <Text style={styles.signupText}>Forgot password?</Text>
        </Link>
      </View>
      <View>
        <Text style={styles.text2}>Don't have an account?</Text>
        <Link to={{screen: 'Signup'}} style={styles.signupText}>
          <Text style={styles.signupText}>Sign up</Text>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  LoginText: {
    marginTop: 100,
    fontSize: 30,
    fontWeight: 'bold',
  },
  Middle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text2: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: 5,
    fontSize: 18,
    marginTop: 20,
    color: '#14274e',
    textAlign: 'center',
  },
  signupText: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#14274e',
    textAlign: 'center',
  },
  emailInput: {
    marginTop: 10,
    marginRight: 5,
  },
  buttonStyle: {
    marginTop: 30,
    marginLeft: 15,
    marginRight: 15,
    justifyContent: 'center',
  },
  buttonStyleX: {
    marginTop: 12,
    marginLeft: 15,
    marginRight: 15,
  },
  buttonDeisgn: {
    backgroundColor: '#14274e',
    borderRadius: 10,
  },
  lineStyle: {
    flexDirection: 'row',
    marginTop: 30,
    marginLeft: 15,
    marginRight: 15,
    alignItems: 'center',
  },
  boxStyle: {
    flexDirection: 'row',
    marginTop: 30,
    marginLeft: 15,
    marginRight: 15,
    justifyContent: 'space-around',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
});
