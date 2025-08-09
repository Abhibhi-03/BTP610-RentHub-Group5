// screens/AccountInfoScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { firebaseAuth, firebaseDB } from '../config/FirebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

export default function AccountInfoScreen({ navigation }) {
  const user = firebaseAuth.currentUser;
  const [name, setName] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [role, setRole] = useState(''); 

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!user) return;
        const snap = await getDoc(doc(firebaseDB, 'users', user.uid));
        if (snap.exists()) {
          const data = snap.data();
          setName(data.name || '');
          setRole(data.role || ''); 
        }
      } catch (err) {
        console.log('Error fetching user:', err);
      }
    };
    fetchUserData();
  }, []);

  const roleLine =
    role === 'landlord'
      ? 'You’re logged in as a landlord.'
      : role === 'tenant'
      ? 'You’re logged in as a tenant.'
      : 'Role not set.';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.header}>My Account</Text>
      <Text style={styles.roleBadge}>{roleLine}</Text>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>Name</Text>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>{name || '-'}</Text>
        </View>

        <Text style={styles.label}>Email</Text>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>{email || '-'}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: '#222f3e',
    marginBottom: 6,
  },
  roleBadge: {
    textAlign: 'center',
    color: '#576574',
    marginBottom: 14,
    fontSize: 15,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 15,
    color: '#576574',
  },
  infoBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginTop: 5,
    backgroundColor: '#f5f6fa',
  },
  infoText: {
    fontSize: 16,
    color: '#222f3e',
  },
  backButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  backText: {
    fontSize: 18,
    color: '#4B89AC',
  },
});
