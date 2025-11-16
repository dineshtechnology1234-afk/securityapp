import React, { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { loginPhone, storeLogin } from '../api/auth';
import * as Device from 'expo-device';
import { AuthContext } from '../../App';
import rootCheck from 'react-native-root-check';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const { setAuth } = useContext(AuthContext);

  async function onLogin() {
    if (!phone) return Alert.alert('Phone required');
    const rooted = await rootCheck.isDeviceRooted();
    if (rooted) {
      return Alert.alert('Device not allowed', 'Device appears rooted/jailbroken. Contact admin.');
    }

    const deviceId = Device.osInternalBuildId || Device.androidId || Device.deviceName || Device.modelName || 'unknown-device';
    try {
      const resp = await loginPhone(phone, deviceId);
      if (!resp.ok) {
        return Alert.alert('Login failed', resp.reason || JSON.stringify(resp));
      }
      // expected resp: { ok:true, token, role, userId, expiresAt, refreshToken? }
      const stored = await storeLogin({ token: resp.token, role: resp.role || 'RESIDENT', userId: resp.userId, expiresAt: resp.expiresAt, refreshToken: resp.refreshToken }, deviceId);
      setAuth(stored);
    } catch (err) {
      Alert.alert('Error', err.message || 'Network error');
    }
  }

  return (
    <View style={{flex:1,justifyContent:'center',padding:20}}>
      <Text style={{fontSize:22,fontWeight:'700',marginBottom:10}}>GharRaksha — Login</Text>
      <TextInput value={phone} onChangeText={setPhone} placeholder="Phone number" keyboardType="phone-pad"
        style={{padding:12,background:'#fff',borderRadius:8,marginBottom:12}} />
      <TouchableOpacity onPress={onLogin} style={{background:'#0ea5e9',padding:14,borderRadius:8,alignItems:'center'}}>
        <Text style={{color:'#fff',fontWeight:'700'}}>Login / Check License</Text>
      </TouchableOpacity>
    </View>
  );
}
