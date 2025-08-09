import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { firebaseAuth, firebaseDB } from '../../config/FirebaseConfig';
import { userAuthentication } from '../../config/userAuthentication';

export default function LandlordHomeScreen({ navigation }) {
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
          console.log('Error fetching user name:', error);
        }
      }
    };

    fetchUserName();
  }, [user]);

  const handleLogout = () => {
    signOut(firebaseAuth);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Top header */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.navigate('AccountInfo')}>
          <Text style={styles.profileIcon}>👤</Text>
        </TouchableOpacity>
        <Text style={styles.header}>🏠 RentHub</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AddPropertyScreen')}>
          <Text style={styles.addIcon}>➕</Text>
        </TouchableOpacity>
      </View>

      {/* Scrollable content */}
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.welcome}>Welcome{userName ? `, ${userName}` : ''}!</Text>
        <Text style={styles.subHeader}>You’re logged in as a landlord.</Text>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('MyListings')}>
          <Text style={styles.buttonText}>📋 My Listings</Text>
        </TouchableOpacity>
        
      </ScrollView>

      <View style={styles.footerRow}>
        
        <TouchableOpacity style={styles.footerButton} onPress={handleLogout}>
          <Text style={styles.footerButtonText}>🚪 Sign Out</Text>
        </TouchableOpacity>

        
        <TouchableOpacity style={styles.footerButton} onPress={() => navigation.navigate('ViewRequests')}>
          <Text style={styles.footerButtonText}>📬 Requests</Text>
        </TouchableOpacity>
      </View>


    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#fff',
  },
  profileIcon: {
    fontSize: 26,
  },
  addIcon: {
    fontSize: 26,
    color: '#4B89AC',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4B89AC',
    textAlign: 'center',
  },
  container: {
    paddingHorizontal: 25,
    paddingTop: 20,
    paddingBottom: 80, 
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  welcome: {
    fontSize: 24,
    fontWeight: '600',
    color: '#222f3e',
    textAlign: 'center',
    marginBottom: 4,
  },
  subHeader: {
    fontSize: 16,
    color: '#576574',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#4B89AC',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  footer: {
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  logoutButton: {
    backgroundColor: '#C05C5C',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
  },
  logoutText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },

  footerButton: {
    backgroundColor: '#C05C5C',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },

  footerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },


});
