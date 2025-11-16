// src/api/auth.js
import axios from 'axios';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { getStoredAuth, storeAuth, removeAuth } from '../utils/storage';

const BASE = '<PUT_YOUR_BACKEND_URL_HERE>'; // e.g. https://securityguard-6dj0.onrender.com

function getHeaders(deviceId, extra={}) {
  // You can add an attestation token header here if implemented
  return {
    'Content-Type': 'application/json',
    'x-device-id': deviceId || '',
    'x-app-attest': '', // placeholder
    ...extra
  };
}

export async function loginPhone(phone, deviceId) {
  // Calls backend /check (or your login endpoint)
  const res = await axios.post(`${BASE}/check`, { phone }, { headers: getHeaders(deviceId) });
  return res.data; // expects { ok, token, role? } per backend
}

export async function fetchWithAuth(path, authObj, body, method='GET') {
  const headers = getHeaders(authObj.deviceId);
  if (authObj?.token) headers['Authorization'] = `Bearer ${authObj.token}`;
  const url = `${BASE}${path}`;
  try {
    const r = await axios({ url, method, data: body, headers });
    return r.data;
  } catch (err) {
    // handle 401 -> try refresh token flow (not fully implemented here)
    throw err;
  }
}

export async function storeLogin(data, deviceId) {
  // data expected: { ok:true, token, role, userId, expiresAt, refreshToken? }
  const obj = { ...data, deviceId };
  await storeAuth(obj);
  return obj;
}

export async function logout() {
  await removeAuth();
}
