import axios, {AxiosInstance, Cancel, CancelTokenStatic} from 'axios';
import base64 from 'base-64';
import {useStorage} from '../../App';

const authInstance: AxiosInstance = axios.create({timeout: 10000});

authInstance.interceptors.request.use(config => {
  config.url = (config.baseURL || '') + config.url;

  return config;
});

export const useAuthAxios = () => {
  const [serverHost] = useStorage<string>('server_address', '');
  const [username] = useStorage<string>('username', '');
  const [accessKey] = useStorage<string>('access_key', '');
  const token = base64.encode(`${username}:${accessKey}`);

  authInstance.defaults.headers.common.Authorization = `Basic ${token}`;
  authInstance.defaults.baseURL = serverHost;

  return authInstance;
};

export default {
  cancelToken(): CancelTokenStatic {
    return axios.CancelToken;
  },
  isCancelled(error: any): error is Cancel {
    return axios.isCancel(error);
  },
};
