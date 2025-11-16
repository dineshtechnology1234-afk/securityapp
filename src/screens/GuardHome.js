import React, { useContext, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import * as Location from 'expo-location';
import { AuthContext } from '../../App';
import { fetchWithAuth } from '../api/auth';
import io from 'socket.io-client';

let socket;

export default function GuardHome() {
  const { auth, setAuth } = useContext(AuthContext);
  const [locationStarted, setLocationStarted] = useState(false);

  useEffect(() => {
    socket = io('https://securityguard-6dj0.onrender.com', { transports: ['websocket'] });
    socket.on('connect', () => console.log('socket connected', socket.id));
    return () => socket?.disconnect();
  }, []);

  async function startLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Permission required');
    setLocationStarted(true);

    Location.watchPositionAsync({ accuracy: Location.Accuracy.Balanced, timeInterval: 15000, distanceInterval: 10 }, (loc) => {
      const lat = loc.coords.latitude, lng = loc.coords.longitude;
      fetchWithAuth('/location/update', auth, { guardId: auth.userId, lat, lng }, 'POST').catch(e => console.log(e));
      socket.emit('location:update', { guardId: auth.userId, lat, lng });
    });
  }

  async function punch(type) {
    try {
      const r = await fetchWithAuth('/attendance/punch', auth, { guardId: auth.userId, punchType: type }, 'POST');
      Alert.alert('Punch', JSON.stringify(r));
    } catch (e) {
      Alert.alert('Error', e.message || 'Server error');
    }
  }

  function logout() {
    setAuth(null);
  }

  return (
    <View style={{flex:1,padding:20}}>
      <Text style={{fontSize:20,fontWeight:'700'}}>Guard Dashboard</Text>

      <TouchableOpacity onPress={() => punch('IN')} style={{marginTop:20,background:'#10b981',padding:14,borderRadius:8}}>
        <Text style={{color:'#fff',textAlign:'center'}}>Punch IN</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => punch('OUT')} style={{marginTop:12,background:'#ef4444',padding:14,borderRadius:8}}>
        <Text style={{color:'#fff',textAlign:'center'}}>Punch OUT</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={startLocation} style={{marginTop:12,background:'#2563eb',padding:14,borderRadius:8}}>
        <Text style={{color:'#fff',textAlign:'center'}}>{locationStarted ? 'Location running' : 'Start Location Sharing'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={logout} style={{marginTop:40,background:'#111827',padding:12,borderRadius:8}}>
        <Text style={{color:'#fff',textAlign:'center'}}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
