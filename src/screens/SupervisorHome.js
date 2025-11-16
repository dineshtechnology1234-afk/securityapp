import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { fetchWithAuth } from '../api/auth';
import { AuthContext } from '../../App';
import io from 'socket.io-client';

let socket;

export default function SupervisorHome() {
  const { auth } = useContext(AuthContext);
  const [pending, setPending] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        // endpoint should return pending attendance for supervisor
        const r = await fetchWithAuth('/attendance/guard/' + auth.userId, auth);
        setPending(r.attendance || []);
      } catch (e) { console.log(e); }
    })();

    socket = io('https://securityguard-6dj0.onrender.com', { transports:['websocket'] });
    socket.on('attendance:status', (data) => {
      setPending(prev => prev.filter(p => p.id !== data.id));
    });

    return () => socket.disconnect();
  }, []);

  async function approve(id, approve) {
    try {
      const r = await fetchWithAuth(`/attendance/${id}/approve`, auth, { approve, supervisorId: auth.userId }, 'POST');
      Alert.alert('Done', JSON.stringify(r));
      setPending(prev => prev.filter(p => p.id !== id));
    } catch (e) { Alert.alert('Error', e.message); }
  }

  return (
    <View style={{flex:1,padding:20}}>
      <Text style={{fontSize:20,fontWeight:'700'}}>Supervisor Panel</Text>
      <FlatList data={pending} keyExtractor={i=>i.id} renderItem={({item}) => (
        <View style={{padding:12,background:'#fff',marginTop:12,borderRadius:8}}>
          <Text>Guard: {item.guardId}</Text>
          <Text>Type: {item.punchType}</Text>
          <View style={{flexDirection:'row',marginTop:8}}>
            <TouchableOpacity onPress={()=>approve(item.id, true)} style={{background:'#10b981',padding:8,borderRadius:6,marginRight:8}}><Text style={{color:'#fff'}}>Approve</Text></TouchableOpacity>
            <TouchableOpacity onPress={()=>approve(item.id, false)} style={{background:'#ef4444',padding:8,borderRadius:6}}><Text style={{color:'#fff'}}>Reject</Text></TouchableOpacity>
          </View>
        </View>
      )} />
    </View>
  );
}
