import React, { useEffect, useState, createContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import GuardHome from './src/screens/GuardHome';
import ResidentHome from './src/screens/ResidentHome';
import SupervisorHome from './src/screens/SupervisorHome';
import { getStoredAuth } from './src/utils/storage';
import { ActivityIndicator, View } from 'react-native';

export const AuthContext = createContext();

const Stack = createNativeStackNavigator();

export default function App() {
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    (async () => {
      const s = await getStoredAuth();
      if (s) setAuth(s);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <View style={{flex:1,alignItems:'center',justifyContent:'center'}}><ActivityIndicator size="large" /></View>;
  }

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!auth ? (
            <Stack.Screen name="Login" component={LoginScreen} />
          ) : auth.role === 'GUARD' ? (
            <Stack.Screen name="GuardHome" component={GuardHome} />
          ) : auth.role === 'RESIDENT' ? (
            <Stack.Screen name="ResidentHome" component={ResidentHome} />
          ) : (
            <Stack.Screen name="SupervisorHome" component={SupervisorHome} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
}
