import * as SecureStore from 'expo-secure-store';

const KEY_AUTH = 'securityops_auth_v1';

export async function storeAuth(obj) {
  await SecureStore.setItemAsync(KEY_AUTH, JSON.stringify(obj), { keychainAccessible: SecureStore.ALWAYS_THIS_DEVICE_ONLY });
}

export async function getStoredAuth() {
  const txt = await SecureStore.getItemAsync(KEY_AUTH);
  if (!txt) return null;
  try { return JSON.parse(txt); } catch { return null; }
}

export async function removeAuth() {
  await SecureStore.deleteItemAsync(KEY_AUTH);
}
