// screens/tenant/PropertyDetailScreen.js
import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';

export default function PropertyDetailScreen({ route, navigation }) {
  const { property } = route.params;

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      {property.image && (
        <Image source={{ uri: property.image }} style={styles.image} />
      )}

      <Text style={styles.title}>📍 {property.address}</Text>
      <Text style={styles.price}>💰 ${property.price}/month</Text>

      <Text style={styles.description}>📝 {property.description || 'No description provided.'}</Text>
      <Text style={styles.amenitiesHeading}>🏷️ Amenities:</Text>
      {Array.isArray(property.amenities) && property.amenities.length > 0 ? (
        <View style={styles.amenitiesList}>
          {property.amenities.map((amenity, index) => (
            <View key={index} style={styles.amenityPill}>
              <Text style={styles.amenityText}>{amenity}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.info}>None</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    
  },
  backButton: {
    marginBottom: 10,
    marginTop:40,
  },
  backText: {
    fontSize: 18,
    color: '#4B89AC',
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: 10,
    marginBottom: 20,
    marginTop:10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#222f3e',
  },
  price: {
    fontSize: 18,
    color: '#10ac84',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#576574',
  },
  info: {
    fontSize: 15,
    marginBottom: 8,
    color: '#576574',
  },
  amenitiesHeading: {
    fontSize: 17,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
    color: '#222f3e',
    
  },
  amenitiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    
  },
  amenityPill: {
    backgroundColor: '#10ac84',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  amenityText: {
    color: '#fff',
    fontWeight: '500',
  },
});
