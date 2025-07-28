import React, { useEffect, useState } from 'react';
import {
  View, 
  Text,
  TextInput, 
  Button, 
  Alert, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { firebaseAuth, firebaseDB } from '../config/FirebaseConfig';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { updateEmail, updatePassword, deleteUser, signOut } from 'firebase/auth';

export default function AccountInfoScreen({ navigation }) {
  const user = firebaseAuth.currentUser;
  const [name, setName] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const docSnap = await getDoc(doc(firebaseDB, 'users', user.uid));
        if (docSnap.exists()) {
          setName(docSnap.data().name || '');
        }
      } catch (err) {
        console.error('Error fetching user:', err);
      }
    };

    fetchUserData();
  }, []);

  const handleUpdate = async () => {
    try {
      // Update email
      if (email !== user.email) {
        await updateEmail(user, email);
      }

      // Update password
      if (newPassword) {
        await updatePassword(user, newPassword);
      }

      // Update Firestore
      await updateDoc(doc(firebaseDB, 'users', user.uid), { name, email });

      Alert.alert('Updated successfully!');
    } catch (err) {
      console.error('Update failed:', err);
      Alert.alert('Update failed', err.message);
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete your account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await deleteDoc(doc(firebaseDB, 'users', user.uid));
            await deleteUser(user);
            await signOut(firebaseAuth);
            Alert.alert('Account deleted');
            // navigation.navigate('SignUpScreen'); 
            // navigation.replace("SignUpScreen");
            } catch (err) {
            console.error('Delete failed:', err);
            Alert.alert('Delete failed', err.message);
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
        <Text style={styles.header}>Edit My Account</Text>
      <ScrollView contentContainerStyle={styles.container}>


        <Text style={styles.label}>Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} />

        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" />

        <Text style={styles.label}>New Password</Text>
        <TextInput style={styles.input} value={newPassword} onChangeText={setNewPassword} secureTextEntry />

        <View style={{ marginVertical: 20 }}>
          <Button title="Save Changes" onPress={handleUpdate} color="#10ac84" />
        </View>

        <Button title="Delete Account" color="#e74c3c" onPress={handleDeleteAccount} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    padding: 20 },
  
  header: {
    fontSize: 24,
    fontWeight: '700',
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

  backButton: {
    paddingHorizontal: 15,
  },

  backText: {
    fontSize: 18,
    color: '#10ac84',
  }
});
