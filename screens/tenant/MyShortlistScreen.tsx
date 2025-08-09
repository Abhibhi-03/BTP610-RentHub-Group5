import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { firebaseDB } from '../../config/FirebaseConfig';
import { userAuthentication } from '../../config/userAuthentication';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

export default function MyShortlistScreen({ navigation }) {
  const { user } = userAuthentication();
  const [properties, setProperties] = useState([]);

  const fetchShortlistedProperties = async () => {
    try {
      const uid = user?.uid;
      if (!uid) return;

      const shortlistSnapshot = await getDocs(collection(firebaseDB, 'users', uid, 'shortlist'));
      const propertyIds = shortlistSnapshot.docs.map(doc => doc.data().propertyId);

      if (propertyIds.length === 0) {
        setProperties([]);
        return;
      }

      const allPropsSnapshot = await getDocs(collection(firebaseDB, 'properties'));
      const allProps = allPropsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const filtered = allProps.filter(p => propertyIds.includes(p.id));
      setProperties(filtered);
    } catch (error) {
      console.error('Error fetching shortlist:', error);
    }
  };

  useEffect(() => { fetchShortlistedProperties(); }, [user]);

  const handleRemoveFromShortlist = async (propertyId) => {
    try {
      const uid = user?.uid;
      if (!uid) return;

      await deleteDoc(doc(firebaseDB, 'users', uid, 'shortlist', propertyId));
      Alert.alert('Removed', 'Property removed from your shortlist.');
      fetchShortlistedProperties(); 
    } catch (error) {
      console.error('Error removing from shortlist:', error);
      Alert.alert('Error', 'Could not remove from shortlist.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>⭐ My Shortlist</Text>
      {properties.length === 0 ? (
        <Text style={styles.empty}>No List yet!</Text>
        ) : (
      <FlatList
        data={properties}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.image && (
              <Image source={{ uri: item.image }} style={styles.image} />
            )}
            <Text style={styles.address}>📍 {item.address}</Text>
            <Text style={styles.price}>💰 ${item.price}/month</Text>

            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveFromShortlist(item.id)}
            >
              <Text style={styles.removeButtonText}>🗑️ Remove</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  backButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  backText: {
    fontSize: 18,
    color: '#4B89AC',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    color: '#222f3e',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#e7e8eeff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: 10,
  },
  address: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222f3e',
  },
  price: {
    fontSize: 16,
    color: '#576574',
    marginTop: 4,
  },
  removeButton: {
    backgroundColor: '#C05C5C',
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 10,
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  empty: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#777',
  },
});
