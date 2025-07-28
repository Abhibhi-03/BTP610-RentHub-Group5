// screens/SignUpScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { firebaseAuth, firebaseDB } from '../config/FirebaseConfig';

const SignUpScreen = ({ navigation }) => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'tenant',
    error: '',
  });

  const [successMessage, setSuccessMessage] = useState('');

  const handleSignUp = async () => {
    const { name, email, password, role } = form;

    if (!name || !email || !password) {
      setForm({ ...form, error: 'All fields are required!' });
      return;
    }

    try {
      const result = await createUserWithEmailAndPassword(firebaseAuth, email, password);
      const uid = result.user.uid;

      await setDoc(doc(firebaseDB, 'users', uid), {
        name,
        email,
        role,
      });

      setForm({ ...form, error: '' });
      setSuccessMessage('Account created successfully. Redirecting...');
    } catch (err) {
      console.log(err);
      setForm({ ...form, error: err.message });
      setSuccessMessage('');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>RentHub</Text>
      <Text style={styles.header}>Create Account</Text>

      <TextInput
        style={styles.input}
        placeholder="Name"
        value={form.name}
        onChangeText={(text) => setForm({ ...form, name: text })}
      />

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

      <View style={styles.roleContainer}>
        <Text style={styles.roleLabel}>I am a:</Text>
        <TouchableOpacity
          style={[styles.roleButton, form.role === 'tenant' && styles.activeRole]}
          onPress={() => setForm({ ...form, role: 'tenant' })}
        >
          <Text style={styles.roleText}>Tenant</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.roleButton, form.role === 'landlord' && styles.activeRole]}
          onPress={() => setForm({ ...form, role: 'landlord' })}
        >
          <Text style={styles.roleText}>Landlord</Text>
        </TouchableOpacity>
      </View>

      {!!form.error && <Text style={styles.errorText}>{form.error}</Text>}
      {!!successMessage && <Text style={styles.successText}>{successMessage}</Text>}

      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('SignInScreen')}>
        <Text style={{ marginTop: 15, color: '#576574' }}>
          Already have an account? Sign In
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    backgroundColor: '#fff',
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
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  roleLabel: {
    fontSize: 16,
    marginRight: 10,
  },
  roleButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#10ac84',
    borderRadius: 5,
    marginRight: 10,
  },
  activeRole: {
    backgroundColor: '#10ac84',
  },
  roleText: {
    color: '#000',
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
