import axios from 'axios';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { storeAuth, getStoredAuth, removeAuth } from '../utils/storage';

const BASE = (Constants.expoConfig && Constants.expoConfig.extra && Constants.expoConfig.extra.backendUrl) || 'https://securityguard-6dj0.onrender.com';

function getHeaders(deviceId, extra={}) {
  return {
    'Content-Type': 'application/json',
    'x-device-id': deviceId || '',
    'x-app-attest': '',
    ...extra
  };
}

export async function loginPhone(phone, deviceId) {
  const res = await axios.post(`${BASE}/check`, { phone }, { headers: getHeaders(deviceId) });
  return res.data;
}

export async function fetchWithAuth(path, authObj, body, method='GET') {
  const headers = getHeaders(authObj.deviceId);
  if (authObj?.token) headers['Authorization'] = `Bearer ${authObj.token}`;
  const url = `${BASE}${path}`;
  try {
    const r = await axios({ url, method, data: body, headers });
    return r.data;
  } catch (err) {
    // Bubble up error
    throw err;
  }
}

export async function storeLogin(data, deviceId) {
  const obj = { ...data, deviceId };
  await storeAuth(obj);
  return obj;
}

export async function logout() {
  await removeAuth();
}
