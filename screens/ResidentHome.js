// src/screens/ResidentHome.js
import React, { useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Linking } from 'react-native';
import { fetchWithAuth } from '../api/auth';
import { AuthContext } from '../../App';
import io from 'socket.io-client';

let socket;

export default function ResidentHome() {
  const { auth, setAuth } = useContext(AuthContext);
  const [guards, setGuards] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetchWithAuth('/location/latest', auth);
        setGuards(r.guards || []);
      } catch (e) { console.log(e); }
    })();

    socket = io('<PUT_YOUR_BACKEND_URL_HERE>', { transports:['websocket'] });
    socket.on('guard:location', (data) => {
      // optimistic update - replace guard's last location
      setGuards(prev => {
        const i = prev.findIndex(x => x.guardId === data.guardId);
        const newItem = { guardId: data.guardId, lastLocation:{lat:data.lat,lng:data.lng,ts:new Date()} };
        if (i >= 0) { const copy = [...prev]; copy[i] = { ...copy[i], lastLocation: newItem.lastLocation }; return copy; }
        return [newItem, ...prev];
      });
    });
    return () => socket.disconnect();
  }, []);

  function callNumber(phone){
    Linking.openURL(`tel:${phone}`);
  }

  return (
    <View style={{flex:1,padding:20}}>
      <Text style={{fontSize:20,fontWeight:'700'}}>Resident Dashboard</Text>
      <FlatList data={guards} keyExtractor={i => i.guardId} renderItem={({item}) => (
        <View style={{padding:12,background:'#fff',marginTop:12,borderRadius:8}}>
          <Text style={{fontWeight:'700'}}>{item.name || item.guardId}</Text>
          <Text>Lat: {item.lastLocation?.lat || '-'} Lng: {item.lastLocation?.lng || '-'}</Text>
          {item.phone ? <TouchableOpacity onPress={() => callNumber(item.phone)} style={{marginTop:8,background:'#0ea5e9',padding:8,borderRadius:6}}><Text style={{color:'#fff'}}>Call</Text></TouchableOpacity> : null}
        </View>
      )} />
    </View>
  );
}
