import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  ScrollView, 
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <TouchableOpacity
          onPress={() => navigation.navigate('SignUpScreen')}
          style={styles.backButton}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        
        <Text style={styles.header}>🏠 RentHub</Text>
        <Text style={styles.subHeader}>Sign In</Text>

        <TextInput
          style={styles.input}
          placeholder="✉️ Email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={form.email}
          onChangeText={(text) => setForm({ ...form, email: text })}
        />

        <TextInput
          style={styles.input}
          placeholder="🔒 Password"
          secureTextEntry
          autoCapitalize="none"
          value={form.password}
          onChangeText={(text) => setForm({ ...form, password: text })}
        />

        {!!form.error && <Text style={styles.errorText}>{form.error}</Text>}
        {!!successMessage && <Text style={styles.successText}>{successMessage}</Text>}

        
        <TouchableOpacity style={styles.button} onPress={handleSignIn}>
          <Text style={styles.buttonText}>➡️ Sign In</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignInScreen;

const styles = StyleSheet.create({
  scrollContainer: {
    paddingHorizontal: 25,
    paddingTop: 40,
    paddingBottom: 20,
  },
  backButton: {
    marginBottom: 20,
  },
  backText: {
    fontSize: 18,
    color: '#4B89AC',
    fontWeight: '600',
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: '#4B89AC',
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 22,
    fontWeight: '600',
    color: '#222f3e',
    textAlign: 'center',
    marginBottom: 25,
  },
  input: {
    borderColor: '#4B89AC',
    borderWidth: 2,
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
    marginVertical: 10,
    fontSize: 16,
  },
  button: {
    marginTop: 25,
    backgroundColor: '#4B89AC',
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
    color: '#e74c3c',
    marginTop: 10,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  successText: {
    color: '#4B89AC',
    marginTop: 10,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
});