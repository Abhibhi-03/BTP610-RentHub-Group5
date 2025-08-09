import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { collection, getDocs } from 'firebase/firestore';
import { firebaseDB } from '../../config/FirebaseConfig';

export default function MapScreen({ navigation }) {
  const [location, setLocation] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const load = async () => {
        const startTime = Date.now(); 

        try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission denied', 'Enable location to view map.');
            console.log('Location permission denied');
            return;
        }

        const current = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Highest,
        });

        setLocation(current.coords);
        console.log('User location:', current.coords);

        const snapshot = await getDocs(collection(firebaseDB, 'properties'));

        const data = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(property => property.isListed === true);

        setProperties(data);

        const duration = Date.now() - startTime;
        console.log(` Fetched ${data.length} properties in ${duration} ms`);
        console.log('Property data:', data);

        if (data.length === 0) {
            console.log('No properties matched filter');
        }
        } catch (err) {
        console.log('Error during map load:', err);
        Alert.alert('Could not load map');
        } finally {
        setLoading(false);
        }
    };

    load();
    }, []);

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.header}>🗺️ Map View of Listings Near You</Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4B89AC" />
          <Text style={{ marginTop: 10 }}>Loading map and properties...</Text>
        </View>
      ) : (
        location && (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.1,
              longitudeDelta: 0.1,
            }}
            showsUserLocation
          >
            {properties.map((property) =>
                property.latitude && property.longitude ? (
                    <Marker
                    key={property.id}
                    coordinate={{
                        latitude: property.latitude,
                        longitude: property.longitude,
                    }}
                    title={property.address || 'Rental Property'}
                    description={`$${property.price || 'N/A'}/month • ${property.propertyType || ''}`}
                    onCalloutPress={() =>
                        navigation.navigate('PropertyDetailScreen', { property })
                    }
                    />
                ) : null
                )}
          </MapView>
        )
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
  },
  backButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  backText: {
    fontSize: 18,
    color: '#4B89AC',
  },
  header: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    color: '#222f3e',
    marginBottom: 15,
    marginTop: 15,
  },
  map: {
    flex: 1,
    width: '100%',
    height: '85%',
    borderRadius: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
