import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet
} from 'react-native';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import { firebaseAuth, firebaseDB } from '../config/FirebaseConfig';
import { userAuthentication } from '../config/userAuthentication';

export default function TenantHomeScreen({ navigation }) {
  const { user } = userAuthentication();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const fetchUserName = async () => {
      if (user) {
        try {
          const docRef = doc(firebaseDB, 'users', user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const { name } = docSnap.data();
            setUserName(name);
          }
        } catch (error) {
          console.log('Error fetching tenant name:', error);
        }
      }
    };

    fetchUserName();
  }, [user]);

  const handleLogout = () => {
    signOut(firebaseAuth);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Welcome{userName ? `, ${userName}` : ''}!</Text>
      <Text style={styles.subtitle}>You're logged in as a tenant.</Text>
      
      <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('AccountInfo')}>
        <Text style={styles.buttonText}>My Account</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
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

  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#222f3e',
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 16,
    color: '#576574',
    marginBottom: 30,
  },

  actionButton: {
    backgroundColor: '#10ac84',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
  },

  logoutButton: {
    backgroundColor: '#ee5253',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  }
});
