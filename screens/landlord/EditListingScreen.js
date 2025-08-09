import React, { useEffect, useState } from 'react';
import {
  View, 
  Text, 
  TextInput, 
  Button, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  TouchableOpacity, 
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { firebaseDB, firebaseStorage } from '../../config/FirebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

export default function EditListingScreen({ route, navigation }) {
  const { listingId } = route.params;

  const [form, setForm] = useState({
    address: '',
    postalCode: '',
    town: '',
    province: '',
    propertyType: '',
    price: '',
    description: '',
  });

  const [image, setImage] = useState(null);
  const [imageURL, setImageURL] = useState(null);
  const [amenities, setAmenities] = useState([]);

  const amenitiesOptions = ['Hydro', 'Gas', 'WiFi', 'None'];

  useEffect(() => {
    const loadListing = async () => {
      try {
        const snap = await getDoc(doc(firebaseDB, 'properties', listingId));
        if (snap.exists()) {
          const data = snap.data();
          setForm({
            address: data.address || '',
            postalCode: data.postalCode || '',
            town: data.town || '',
            province: data.province || '',
            propertyType: data.propertyType || '',
            price: data.price || '',
            description: data.description || '',
          });
          setImageURL(data.image || null);
          setAmenities(data.amenities || []);
        }
      } catch (err) {
        console.error('Load listing error:', err);
        Alert.alert('Error loading listing data.');
      }
    };

    loadListing();
  }, [listingId]);

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleAmenityToggle = (amenity) => {
    if (amenities.includes(amenity)) {
      setAmenities(amenities.filter(a => a !== amenity));
    } else {
      setAmenities([...amenities, amenity]);
    }
  };

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
    if (!image) return imageURL;

    try {
      const filename = image.substring(image.lastIndexOf('/') + 1);
      const imageRef = ref(firebaseStorage, `propertyImages/${filename}`);

      const response = await fetch(image);
      const blob = await response.blob();

      const snapshot = await uploadBytesResumable(imageRef, blob);
      const downloadURL = await getDownloadURL(snapshot.ref);

      return downloadURL;
    } catch (err) {
      console.error('Image upload failed:', err);
      return imageURL;
    }
  };

  const handleSave = async () => {
    try {
      const uploadedURL = await uploadImage();

      await updateDoc(doc(firebaseDB, 'properties', listingId), {
        ...form,
        amenities,
        image: uploadedURL,
        updatedAt: new Date()
      });
      Alert.alert('Success', 'Listing updated!');
      navigation.goBack();
    } catch (err) {
      console.error('Save error:', err);
      Alert.alert('Error saving changes');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      <Text style={styles.header}>Edit Listing</Text>
    <ScrollView contentContainerStyle={styles.container}>

      {[
        { label: 'Address', key: 'address' },
        { label: 'Postal Code', key: 'postalCode' },
        { label: 'Town/City', key: 'town' },
        { label: 'Province', key: 'province' },
        { label: 'Property Type', key: 'propertyType' },
        { label: 'Price (CAD)', key: 'price', keyboardType: 'numeric' },
      ].map(({ label, key, keyboardType }) => (
        <View key={key} style={{ marginBottom: 10 }}>
          <Text style={styles.label}>{label}</Text>
          <TextInput
            style={styles.input}
            value={form[key]}
            onChangeText={(val) => handleChange(key, val)}
            keyboardType={keyboardType || 'default'}
          />
        </View>
      ))}

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        value={form.description}
        multiline
        onChangeText={(val) => handleChange('description', val)}
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

      <Button title="Change Image" onPress={pickImage} />
      {(image || imageURL) && (
        <Image source={{ uri: image || imageURL }} style={styles.imagePreview} />
      )}

      <View style={{ marginTop: 20 }}>
        <Button title="Save Changes" onPress={handleSave} color="#10ac84" />
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
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
    marginBottom: 4,
    color: '#576574'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10
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
    color: '#4B89AC',
  }

});

