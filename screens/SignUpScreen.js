// screens/SignUpScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
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
      setSuccessMessage('Account created successfully!');
    } catch (err) {
      console.log(err);
      setForm({ ...form, error: err.message });
      setSuccessMessage('');
    }
  };

  return (
    
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.header}>🏠 RentHub</Text>
        <Text style={styles.subHeader}>Lets Sign up !!</Text>

        <TextInput
          style={styles.input}
          placeholder="👤 Name"
          value={form.name}
          onChangeText={(text) => setForm({ ...form, name: text })}
        />

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

        <View style={styles.roleContainer}>
          <Text style={styles.roleLabel}>I am a:</Text>
          <TouchableOpacity
            style={[styles.roleButton, form.role === 'tenant' && styles.activeRole]}
            onPress={() => setForm({ ...form, role: 'tenant' })}
          >
            <Text style={[styles.roleText, form.role === 'tenant' && styles.activeRoleText]}>Tenant</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleButton, form.role === 'landlord' && styles.activeRole]}
            onPress={() => setForm({ ...form, role: 'landlord' })}
          >
            <Text style={[styles.roleText, form.role === 'landlord' && styles.activeRoleText]}>Landlord</Text>
          </TouchableOpacity>
        </View>

        {!!form.error && <Text style={styles.errorText}>{form.error}</Text>}
        {!!successMessage && <Text style={styles.successText}>{successMessage}</Text>}

        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
          <Text style={styles.buttonText}>🚀 Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('SignInScreen')}>
          <Text style={styles.bottomText}>
            Already have an account? <Text style={{ color: '#10ac84' }}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  scrollContainer: {
    paddingHorizontal: 25,
    paddingTop: 40,
    paddingBottom: 10,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: '#4B89AC',
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222f3e',
    textAlign: 'center',
    marginBottom: 10,
    paddingTop:30,
    
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
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  roleLabel: {
    fontSize: 22,
    marginRight: 10,
    color: '#222f3e',
  },
  roleButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: '#4B89AC',
    borderRadius: 8,
    marginRight: 10,
  },
  roleText: {
    fontSize: 16,
    color: '#4B89AC',
    fontWeight: '600',
  },
  activeRole: {
    backgroundColor: '#4B89AC',
  },
  activeRoleText: {
    color: '#fff',
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
  bottomText: {
    marginTop: 20,
    color: '#576574',
    fontSize: 15,
    textAlign: 'center',
  },
});