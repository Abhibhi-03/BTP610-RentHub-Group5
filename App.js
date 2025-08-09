// App.js
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { doc, getDoc } from 'firebase/firestore';

import { firebaseDB } from './config/FirebaseConfig';
import { userAuthentication } from './config/userAuthentication';

import SignUpScreen from './screens/SignUpScreen';
import SignInScreen from './screens/SignInScreen';
import LandlordHomeScreen from './screens/landlord/LandlordHomeScreen';
import TenantHomeScreen from './screens/TenantHomeScreen';
import AddPropertyScreen from './screens/landlord/AddPropertyScreen';
import MyListingsScreen from './screens/landlord/MyListingScreen';
import EditListingScreen from './screens/landlord/EditListingScreen';
import ViewRequestsScreen from './screens/landlord/ViewRequestsScreen'; 
import AccountInfoScreen from './screens/AccountInfoScreen';
import MyShortlistScreen from './screens/tenant/MyShortlistScreen';
import MapScreen from './screens/tenant/MapScreen';
import PropertyDetailScreen from './screens/tenant/PropertyDetailScreen';




import * as Location from 'expo-location';


const Stack = createNativeStackNavigator();

export default function App() {
  const { user } = userAuthentication();
  const [userRole, setUserRole] = useState(null); // "tenant" or "landlord"
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Location.requestForegroundPermissionsAsync();
  }, []);

  useEffect(() => {
    const fetchRole = async () => {
      if (user) {
        try {
          const docRef = doc(firebaseDB, 'users', user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const { role } = docSnap.data();
            setUserRole(role);
          } else {
            setUserRole(null);
          }
        } catch (err) {
          console.log('Error fetching role:', err);
          setUserRole(null);
        } finally {
          setLoading(false);
        }
      } else {
        setUserRole(null);
        setLoading(false);
      }
    };

    fetchRole();
  }, [user]);

  if (loading) return null;

  return (
    <NavigationContainer>
        <Stack.Navigator key={user?.uid || 'guest'} screenOptions={{ headerShown: false }}>
        {!userRole ? (
          <>
            <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
            <Stack.Screen name="SignInScreen" component={SignInScreen} />
          </>
        ) : userRole === 'landlord' ? (
          <Stack.Screen name="LandlordHomeScreen" component={LandlordHomeScreen} />
        ) : (
          <Stack.Screen name="TenantHomeScreen" component={TenantHomeScreen} />
        )}

        <Stack.Screen name="AddPropertyScreen" component={AddPropertyScreen} />
        <Stack.Screen name="MyListings" component={MyListingsScreen} />
        <Stack.Screen name="ViewRequests" component={ViewRequestsScreen} />
        <Stack.Screen name="EditListing" component={EditListingScreen} />
        <Stack.Screen name="AccountInfo" component={AccountInfoScreen} />
        <Stack.Screen name="MyShortlist" component={MyShortlistScreen} />
        <Stack.Screen name="MapScreen" component={MapScreen} />
        <Stack.Screen name="PropertyDetailScreen" component={PropertyDetailScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
