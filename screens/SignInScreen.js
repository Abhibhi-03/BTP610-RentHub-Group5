import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { firebaseAuth } from '../config/FirebaseConfig';

const SignInScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    email: '',
    password: '',
    error: '',
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSignIn = async () => {
    const { email, password } = form;

    if (!email || !password) {
      setForm({ ...form, error: 'Email and Password are required.' });
      return;
    }

    try {
      setLoading(true);
      await signInWithEmailAndPassword(firebaseAuth, email, password);
      setForm({ ...form, error: '' });
      setSuccessMessage('Login successful. Redirecting...');
    } catch (err) {
      console.log(err);
      setForm({ ...form, error: err.message });
      setSuccessMessage('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.navigate('SignUpScreen')}
        style={styles.backButton}>
        <Text style={styles.backText}>← Back to Sign Up</Text>
      </TouchableOpacity>
      <Text style={styles.header}>RentHub</Text>
      <Text style={styles.header}>Sign In</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={form.email}
        onChangeText={(text) => setForm({ ...form, email: text })}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        autoCapitalize="none"
        value={form.password}
        onChangeText={(text) => setForm({ ...form, password: text })}
      />

      {!!form.error && <Text style={styles.errorText}>{form.error}</Text>}
      {!!successMessage && <Text style={styles.successText}>{successMessage}</Text>}
      {loading && <ActivityIndicator style={{ marginTop: 10 }} color="#10ac84" />}

      <TouchableOpacity style={styles.button} onPress={handleSignIn}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default SignInScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    backgroundColor: '#fff',
  },
  backButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  
  backText: {
    fontSize: 18,
    color: '#10ac84',
  },
  
  header: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 20,
    color: '#222f3e',
    alignSelf: 'center',
  },
  input: {
    borderColor: '#1dd1a1',
    borderWidth: 2,
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
    marginVertical: 10,
    fontSize: 16,
  },
  button: {
    marginTop: 25,
    backgroundColor: '#10ac84',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  errorText: {
    color: 'red',
    marginTop: 10,
    fontSize: 14,
    textAlign: 'center',
  },
  successText: {
    color: 'green',
    marginTop: 10,
    fontSize: 14,
    textAlign: 'center',
  },
});
