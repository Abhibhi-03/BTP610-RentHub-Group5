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

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const docSnap = await getDoc(doc(firebaseDB, 'users', user.uid));
        if (docSnap.exists()) {
          setName(docSnap.data().name || '');
        }
      } catch (err) {
        console.error('Error fetching user:', err);
      }
    };

    fetchUserData();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.header}>My Account</Text>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>Name</Text>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>{name}</Text>
        </View>

        <Text style={styles.label}>Email</Text>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>{email}</Text>
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
    marginBottom: 20,
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
