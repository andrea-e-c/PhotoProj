import React, {useState} from 'react';
import {View, Text, StyleSheet, TextInput, Button, Alert} from 'react-native';
import {Link} from '@react-navigation/native';
import auth from '@react-native-firebase/auth';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const loginUser = (uname: string, pw: string) => {
    auth()
      .createUserWithEmailAndPassword(uname, pw)
      .then(() => {
        console.log('User account created & signed in!');
      })
      .catch(error => {
        if (error.code === 'auth/email-already-in-use') {
          console.log('That email address is already in use!');
          Alert.alert('User Already Exists', 'That email is already in use.');
        }

        if (error.code === 'auth/invalid-email') {
          console.log('That email address is invalid!');
          Alert.alert('Error', 'That email address is invalid.');
        }

        console.error(error);
      });
  };

  return (
    <View style={styles.container}>
      <View style={styles.Middle}>
        <Text style={styles.LoginText}>Sign Up</Text>
      </View>
      <View>
        <Link to={{screen: 'Home'}}>
          <Text style={styles.signupText}>HOME PAGE</Text>
        </Link>
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
        <Button
          style={styles.buttonDeisgn}
          disabled={!email && !password}
          onPress={() => loginUser(email, password)}
          title="Sign Up">
          SIGN UP
        </Button>
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
  },
  signupText: {
    fontWeight: 'bold',
  },
  emailInput: {
    marginTop: 10,
    marginRight: 5,
  },
  buttonStyle: {
    marginTop: 30,
    marginLeft: 15,
    marginRight: 15,
  },
  buttonStyleX: {
    marginTop: 12,
    marginLeft: 15,
    marginRight: 15,
  },
  buttonDeisgn: {
    backgroundColor: '#026efd',
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
