import axios, { AxiosInstance, CancelTokenStatic } from 'axios';
import base64 from 'base-64';
import { storage } from '../../App';
import { useMMKVStorage } from 'react-native-mmkv-storage';

const authInstance: AxiosInstance = axios.create({ timeout: 10000 });

authInstance.interceptors.request.use((config) => {
  config.url = (config.baseURL || '') + config.url;

  return config;
});

export const useAuthAxios: () => AxiosInstance = () => {
  const [serverHost] = useMMKVStorage<string>('server_address', storage, '');
  const [username] = useMMKVStorage<string>('username', storage, '');
  const [accessKey] = useMMKVStorage<string>('access_key', storage, '');
  const token = base64.encode(`${username}:${accessKey}`);

  authInstance.defaults.headers.common.Authorization = `Basic ${token}`;
  authInstance.defaults.baseURL = serverHost;

  return authInstance;
};

export default {
  cancelToken(): CancelTokenStatic {
    return axios.CancelToken;
  },
  isCancelled(error: any): boolean {
    return axios.isCancel(error);
  }
};
