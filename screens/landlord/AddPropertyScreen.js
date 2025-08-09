import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { firebaseAuth, firebaseDB, firebaseStorage } from '../../config/FirebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable } from "firebase/storage";
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';

import * as FileSystem from 'expo-file-system';

export default function AddPropertyScreen({ navigation }) {
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [town, setTown] = useState('');
  const [province, setProvince] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [imageURL, setImageURL] = useState(null);
  const [amenities, setAmenities] = useState([]);

  const amenitiesOptions = ['Hydro', 'Gas', 'WiFi', 'None'];

  const provinces = [
    'Alberta',
    'British Columbia',
    'Manitoba',
    'New Brunswick',
    'Newfoundland and Labrador',
    'Nova Scotia',
    'Ontario',
    'Prince Edward Island',
    'Quebec',
    'Saskatchewan'
  ];

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };
  
  const uploadImage = async () => {
    if (!image) return null;

    try {
        const filename = image.substring(image.lastIndexOf('/') + 1);
        const storageRef = ref(firebaseStorage, `propertyImages/${filename}`);

        const response = await fetch(image);
        const blob = await response.blob();

        const snapshot = await uploadBytesResumable(storageRef, blob);
        const downloadURL = await getDownloadURL(snapshot.ref);

        return downloadURL;
    } catch (err) {
        console.error('Image upload failed:', err);
        return null;
    }
};

  const handleAmenityToggle = (amenity) => {
    if (amenities.includes(amenity)) {
      setAmenities(amenities.filter(a => a !== amenity));
    } else {
      setAmenities([...amenities, amenity]);
    }
  };

  const handleAddProperty = async () => {
    if (!address || !postalCode || !town || !province || !propertyType || !price) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to geocode the address.');
        return;
      }

      const fullAddress = `${address}, ${postalCode}, ${town}, ${province}`;
      const geoResults = await Location.geocodeAsync(fullAddress);

      if (geoResults.length === 0) {
        Alert.alert('Geocoding Failed', 'Unable to get location from address.');
        return;
      }

      const { latitude, longitude } = geoResults[0];
      const uid = firebaseAuth.currentUser.uid;
      const uploadedImageURL = await uploadImage();

      await addDoc(collection(firebaseDB, 'properties'), {
        uid,
        address,
        postalCode,
        town,
        province,
        propertyType,
        description,
        amenities,
        price,
        latitude,
        longitude,
        image: uploadedImageURL || null,
        isListed: true, // default state is 'listed'
        createdAt: new Date(),
      });

      Alert.alert('Success', 'Property added successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Error saving property:', error);
      Alert.alert('Error', 'Something went wrong. Please try again');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.header}>Add Property</Text>
      <ScrollView contentContainerStyle={styles.container}>
 

        <Text style={styles.label}>Street Address*</Text>
        <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder="123 Main St" />

        <Text style={styles.label}>Postal Code*</Text>
        <TextInput style={styles.input} value={postalCode} onChangeText={setPostalCode} placeholder="A1A 1A1" />

        <Text style={styles.label}>Town/City*</Text>
        <TextInput style={styles.input} value={town} onChangeText={setTown} placeholder="Toronto" />

        <Text style={styles.label}>Province*</Text>
        <View style={styles.pickerWrapper}>
          <Picker selectedValue={province} onValueChange={(val) => setProvince(val)}>
            <Picker.Item label="Select Province" value="" />
            {provinces.map((p) => <Picker.Item key={p} label={p} value={p} />)}
          </Picker>
        </View>

        <Text style={styles.label}>Property Type*</Text>
        <TextInput style={styles.input} value={propertyType} onChangeText={setPropertyType} placeholder="e.g. Condo, Apartment" />

        <Text style={styles.label}>Price (CAD)*</Text>
        <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="e.g. 1500" />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, { height: 100 }]}
          multiline
          value={description}
          onChangeText={setDescription}
          placeholder="Write some details..."
        />

        <Text style={styles.label}>Select Amenities</Text>
        <View style={styles.amenityContainer}>
          {amenitiesOptions.map((a) => (
            <TouchableOpacity
              key={a}
              style={[styles.amenityPill, amenities.includes(a) && styles.amenitySelected]}
              onPress={() => handleAmenityToggle(a)}
            >
              <Text style={{ color: amenities.includes(a) ? '#fff' : '#10ac84' }}>{a}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button title="Pick Property Image" onPress={pickImage} />
        {image && <Image source={{ uri: image }} style={styles.imagePreview} />}

        <View style={{ marginVertical: 20 }}>
          <Button title="Submit Property" onPress={handleAddProperty} color="#10ac84" />
        </View>
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
  label: {
    fontWeight: 'bold',
    marginTop: 15,
    color: '#576574'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginTop: 5
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginTop: 5
  },
  amenityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10
  },
  amenityPill: {
    borderWidth: 1,
    borderColor: '#10ac84',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    margin: 5,
  },
  amenitySelected: {
    backgroundColor: '#10ac84',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    marginVertical: 10,
    borderRadius: 10,
    borderColor: '#ccc',
    borderWidth: 1
  },

  backButton: {
    paddingHorizontal: 15,
  },

  backText: {
    fontSize: 18,
    color: '#4B89AC'
  }
});
