import React, { useEffect, useState } from 'react';
import {
  View, 
  Text, 
  Button, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  TouchableOpacity
  } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { firebaseAuth, firebaseDB } from '../../config/FirebaseConfig';
import {
  collection, query, where, getDocs, doc, updateDoc, getDoc
} from 'firebase/firestore';

export default function ViewRequestsScreen({ navigation }) {
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    try {
      const uid = firebaseAuth.currentUser.uid;

      // Step 1: Fetch all properties for this landlord
      const propertySnapshot = await getDocs(
        query(collection(firebaseDB, 'properties'), where('uid', '==', uid))
      );
      const properties = propertySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const propertyIds = properties.map(p => p.id);

      // Step 2: Fetch all requests for these properties
      const requestSnapshot = await getDocs(collection(firebaseDB, 'requests'));
      const allRequests = requestSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(req => propertyIds.includes(req.propertyId));

      setRequests(allRequests);
    } catch (err) {
      console.error('Error fetching requests:', err);
    }
  };

  const updateRequestStatus = async (id, status) => {
    try {
      await updateDoc(doc(firebaseDB, 'requests', id), { status });
      Alert.alert(`Request ${status}`);
      fetchRequests();
    } catch (err) {
      console.error('Error updating request:', err);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchRequests);
    return unsubscribe;
  }, [navigation]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.header}>View Requests</Text>
        
        <ScrollView style={styles.container}>    
            {requests.length === 0 ? (
                <Text style={styles.empty}>No requests yet.</Text>
            ) : (
                
                requests.map((req) => (
                <View key={req.id} style={styles.card}>
                    <Text style={styles.text}>Property ID: {req.propertyId}</Text>
                    <Text style={styles.text}>Tenant ID: {req.tenantId}</Text>
                    <Text style={styles.status}>Status: {req.status}</Text>
              {req.status === 'pending' && (
                <View style={styles.buttonRow}>
                  <Button title="Approve" onPress={() => updateRequestStatus(req.id, 'approved')} color="#10ac84" />
                  <Button title="Deny" onPress={() => updateRequestStatus(req.id, 'denied')} color="#e74c3c" />
                </View>
            )}
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

  headerRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 20 
  },

  header: { 
    fontSize: 22, 
    fontWeight: '700', 
    marginLeft: 10, 
    color: '#222f3e' 
  },

  empty: { 
    textAlign: 'center', 
    marginTop: 30, 
    color: '#999' 
  },

  card: {
    backgroundColor: '#f1f2f6',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    elevation: 2
  },

  text: { 
    color: '#333', 
    marginBottom: 5 
  },

  status: { 
    fontStyle: 'italic', 
    color: '#2980b9', 
    marginBottom: 10 
  },

  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },

  backButton: {
    paddingHorizontal: 15,
    paddingVertical: 10
  },

  backText: {
    fontSize: 18,
    color: '#10ac84'
  }
});
