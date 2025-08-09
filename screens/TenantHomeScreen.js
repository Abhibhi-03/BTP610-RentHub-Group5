import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Image,
  Alert,
  FlatList,
} from 'react-native';
import {
  doc, getDoc, collection, getDocs, addDoc, deleteDoc, setDoc,
  query, where
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { firebaseAuth, firebaseDB } from '../config/FirebaseConfig';
import { userAuthentication } from '../config/userAuthentication';

export default function TenantHomeScreen({ navigation }) {
  const { user } = userAuthentication();
  const [userName, setUserName] = useState('');
  const [properties, setProperties] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);

  // Header name
  useEffect(() => {
    const fetchUserName = async () => {
      if (!user) return;
      try {
        const snap = await getDoc(doc(firebaseDB, 'users', user.uid));
        if (snap.exists()) {
          const { name } = snap.data();
          setUserName(name || '');
        }
      } catch (err) {
        console.log('Error fetching tenant name:', err);
      }
    };
    fetchUserName();
  }, [user]);

  // Properties
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const qs = await getDocs(collection(firebaseDB, 'properties'));
        const data = qs.docs.map(d => ({ id: d.id, ...d.data() }));
        setProperties(data);
      } catch (err) {
        console.log('Error fetching properties:', err);
      }
    };
    fetchProperties();
  }, []);

  const fetchSentRequests = useCallback(async () => {
    if (!user) return;
    try {
      const snap = await getDocs(
        query(collection(firebaseDB, 'rentalRequests'), where('tenantId', '==', user.uid))
      );
      const myReqs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setSentRequests(myReqs);
    } catch (err) {
      console.log('Error loading requests:', err);
    }
  }, [user]);

  // Refresh requests whenever screen focuses
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchSentRequests);
    return unsubscribe;
  }, [navigation, fetchSentRequests]);

  const getRequestFor = (propertyId) =>
    sentRequests.find(r => r.propertyId === propertyId);

  const handleSendRequest = async (propertyId) => {
    if (getRequestFor(propertyId)) {
      Alert.alert('Request already sent.');
      return;
    }
    try {
      await addDoc(collection(firebaseDB, 'rentalRequests'), {
        tenantId: user.uid,
        propertyId,
        status: 'pending',
        requestedAt: new Date(),
      });
      Alert.alert('Request sent to landlord! 📩');
      fetchSentRequests(); // refresh list after action
    } catch (err) {
      console.log('Send request failed:', err);
      Alert.alert('Error', 'Try again.');
    }
  };

  const handleWithdrawRequest = async (propertyId) => {
    const req = getRequestFor(propertyId);
    if (!req) return;

    if (req.status !== 'pending') {
      Alert.alert('Request is already decided.');
      return;
    }

    Alert.alert('Withdraw Request', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Withdraw',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(firebaseDB, 'rentalRequests', req.id));
            Alert.alert('Request withdrawn.');
            fetchSentRequests(); // refresh list after action
          } catch (err) {
            console.error('Withdraw failed:', err);
            Alert.alert('Error withdrawing request.');
          }
        }
      }
    ]);
  };

  const handleAddToShortlist = async (propertyId) => {
    try {
      const ref = doc(firebaseDB, 'users', user.uid, 'shortlist', propertyId);
      await setDoc(ref, { propertyId, addedAt: new Date() });
      Alert.alert('⭐ Shortlisted', 'Added to shortlist.');
    } catch (err) {
      console.error('Shortlist error:', err);
      Alert.alert('Error', 'Could not add.');
    }
  };

  const handleLogout = () => {
    signOut(firebaseAuth);
  };

  const renderCard = ({ item }) => {
    const req = getRequestFor(item.id);
    const status = req?.status; // 'pending' | 'approved' | 'denied' | undefined

    return (
      <TouchableOpacity onPress={() => navigation.navigate('PropertyDetailScreen', { property: item })}>
        <View style={styles.card}>
          {item.image && (
            <Image source={{ uri: item.image }} style={styles.propertyImage} />
          )}
          <Text style={styles.cardAddress}>📍 {item.address}</Text>
          <Text style={styles.cardPrice}>💰 ${item.price}/month</Text>
          
          {status === 'approved' && (
            <View style={[styles.requestButton, styles.approvedButton]}>
              <Text style={styles.requestButtonText}>✅ Approved</Text>
            </View>
          )}
          {status === 'denied' && (
            <View style={[styles.requestButton, styles.deniedButton]}>
              <Text style={styles.requestButtonText}>❌ Denied</Text>
            </View>
          )}

          {/* Action buttons */}
          {!req && (
            <TouchableOpacity
              style={styles.requestButton}
              onPress={() => handleSendRequest(item.id)}
            >
              <Text style={styles.requestButtonText}>📩 Request to Rent</Text>
            </TouchableOpacity>
          )}

          {status === 'pending' && (
            <TouchableOpacity
              style={styles.withdrawButton}
              onPress={() => handleWithdrawRequest(item.id)}
            >
              <Text style={styles.withdrawButtonText}>🗑️ Withdraw Request</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.shortlistButton}
            onPress={() => handleAddToShortlist(item.id)}
          >
            <Text style={styles.shortlistButtonText}>⭐ Shortlist</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top header row */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('AccountInfo')}>
          <Text style={styles.iconText}>👤</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Welcome{userName ? `, ${userName}` : ''}!</Text>

        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('MyShortlist')}>
          <Text style={styles.iconText}>⭐</Text>
        </TouchableOpacity>
      </View>

      {/* Listings */}
      <FlatList
        data={properties}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Bottom fixed row */}
      <View style={styles.footerRow}>
        <TouchableOpacity style={styles.mapButton} onPress={() => navigation.navigate('MapScreen')}>
          <Text style={styles.mapButtonText}>🗺️ Map View</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Reuse your existing styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 23,
    fontWeight: '700',
    color: '#222f3e',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: '#576574',
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#e7e8eeff',
    padding: 15,
    marginVertical: 10,
    width: '100%',
    borderRadius: 8,
  },
  propertyImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: 12,
  },
  cardAddress: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222f3e',
    marginBottom: 4,
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: '500',
    color: '#576574',
  },
  requestButton: {
    backgroundColor: '#1F4A80',
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 10,
    alignItems: 'center',
  },
  requestButtonText: {
    color: '#E0E0E0',
    fontSize: 15,
    fontWeight: '600',
  },
  shortlistButton: {
    backgroundColor: '#329B85',
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 8,
    alignItems: 'center',
  },
  shortlistButtonText: {
    color: '#E0E0E0',
    fontSize: 15,
    fontWeight: '600',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  iconButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  iconText: {
    fontSize: 20,
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    marginTop: 10,
  },
  logoutButton: {
    backgroundColor: '#C05C5C',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutText: {
    color: '#F7F7F7',
    fontSize: 16,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginTop: 20,
    gap: 46,
  },

  mapButton: {
    backgroundColor: '#1F4A80',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    //flex: 1,
    alignItems: 'center',
  },
  mapButtonText: {
    color: '#F7F7F7',
    fontSize: 16,
    fontWeight: '600',
  },
  approvedButton: {
    backgroundColor: '#2ecc71', 
    marginTop: 8,
  },

  deniedButton: {
    backgroundColor: '#e74c3c',
    marginTop: 8,
  },

  withdrawButton: {
    backgroundColor: '#9A6B34',
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 8,
    alignItems: 'center',
  },
  withdrawButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },

});