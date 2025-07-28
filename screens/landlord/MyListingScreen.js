import React, { useEffect, useState } from 'react';
import {
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  Button, 
  Alert, 
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { firebaseAuth, firebaseDB } from '../../config/FirebaseConfig';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';

export default function MyListingsScreen({ navigation }) {
  const [myListings, setMyListings] = useState([]);

  const fetchListings = async () => {
    try {
      const uid = firebaseAuth.currentUser.uid;
      const q = query(collection(firebaseDB, 'properties'), where('uid', '==', uid));
      const snapshot = await getDocs(q);
      const listings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMyListings(listings);
    } catch (err) {
      console.error('Error fetching listings:', err);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchListings);
    return unsubscribe;
  }, [navigation]);

  const toggleListingStatus = async (id, currentStatus) => {
    try {
        const newStatus = !currentStatus;
        await updateDoc(doc(firebaseDB, 'properties', id), { isListed: newStatus });
        Alert.alert('Success', newStatus ? 'Property listed' : 'Property delisted');
        fetchListings();
    } catch (err) {
        console.error('Toggle listing status error:', err);
    }
  };

  const handleDelete = async (id) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this property?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(firebaseDB, 'properties', id));
            Alert.alert('Deleted');
            fetchListings();
          } catch (err) {
            console.error('Delete error:', err);
          }
        }
      }
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
       <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.header}>My Listings</Text>
        <ScrollView style={styles.container}>

        {myListings.length === 0 ? (
            <Text style={styles.empty}>You haven't added any properties yet.</Text>
        ) : (
            myListings.map(listing => (
            <View key={listing.id} style={styles.card}>
                <Text style={styles.title}>{listing.propertyType} - {listing.address}</Text>
                <Text style={styles.text}>${listing.price}</Text>
                <Text style={styles.text}>{listing.description?.slice(0, 60)}...</Text>
                <Text style={styles.status}>Status: {listing.isListed === false ? 'Not Listed' : 'Listed'}</Text>

                <View style={styles.buttonGroup}>
                <View style={styles.buttonWrapper}>
                    <Button
                    title="Edit"
                    onPress={() => navigation.navigate('EditListing', { listingId: listing.id })}
                    />
                </View>

                <View style={styles.buttonWrapper}>
                    <Button
                    title={listing.isListed === false ? 'List' : 'Delist'}
                    onPress={() => toggleListingStatus(listing.id, listing.isListed)}
                    color="#f39c12"
                    />
                </View>

                <View style={styles.buttonWrapper}>
                    <Button
                    title="Delete"
                    onPress={() => handleDelete(listing.id)}
                    color="#e74c3c"
                    />
                </View>
                </View>
            </View>
            ))
        )}
        </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff'
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
    color: '#222f3e'
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: '#555'
  },
  card: {
    padding: 15,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderColor: '#ddd',
    borderWidth: 1
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#2d3436'
  },
  text: {
    marginTop: 4,
    color: '#555'
  },
  status: {
    marginTop: 6,
    fontStyle: 'italic',
    color: '#2980b9'
  },
  buttonGroup: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  buttonWrapper: {
    flex: 1,
    marginHorizontal: 5
  },

  backButton: {
    paddingHorizontal: 15,
  },

  backText: {
    fontSize: 18,
    color: '#10ac84',
  }
});
