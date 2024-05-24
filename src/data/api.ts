import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  CancelTokenStatic,
  InternalAxiosRequestConfig
} from 'axios';
import { storage } from '../../App.tsx';
import base64 from 'base-64';
import { APIError, APIResponse } from './types/common.types';

const TIMEOUT = 10000;

class API {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      timeout: TIMEOUT,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        let serverHost = storage.getString('server_address') || '';
        const username = storage.getString('username') || '';
        const accessKey = storage.getString('access_key') || '';
        const token = base64.encode(`${username}:${accessKey}`);

        if (
          !serverHost.toLowerCase().startsWith('http://') &&
          !serverHost.toLowerCase().startsWith('https://')
        ) {
          serverHost = 'https://' + serverHost;
        }

        config.headers.Authorization = `Basic ${token}`;
        config.url = serverHost + config.url;

        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  public cancelToken(): CancelTokenStatic {
    return axios.CancelToken;
  }

  public isCancelled(error: unknown): boolean {
    return axios.isCancel(error);
  }

  public createSuccessResponse<T>(axiosResponse: AxiosResponse<T>) {
    const apiResponse: APIResponse<T> = {
      success: true,
      status: axiosResponse.status,
      data: axiosResponse.data
    };

    return apiResponse;
  }

  public createErrorResponse<T>(error: unknown) {
    const apiError: APIError = {
      status: undefined,
      errorMessage: undefined,
      hasFieldErrors: false,
      fieldErrors: {}
    };

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<unknown, any>;

      if (axiosError.response?.status) {
        apiError.status = axiosError.response.status;

        if (axiosError.response.status === 400) {
          if (axiosError.response?.data) {
            const errors = (
              error as AxiosError<
                | {
                    errors:
                      | { [field: string]: { msg: string } }
                      | Array<string>
                      | { error: string };
                  }
                | undefined
              >
            ).response?.data?.errors;

            if (error) {
              if (typeof errors === 'object' && !Array.isArray(errors)) {
                for (const field in errors as {
                  [field: string]: { msg: string };
                }) {
                  const fieldError = (errors as { [field: string]: { msg: string } })[field];

                  apiError.fieldErrors[field] = fieldError.msg;

                  if (!apiError.hasFieldErrors) {
                    apiError.hasFieldErrors = true;
                  }
                }
              } else if (Array.isArray(errors)) {
                apiError.errorMessage = (errors as Array<string>)[0];
              }
            }
          }
        }
      }
    }

    const apiResponse: APIResponse<T> = {
      success: false,
      status: apiError.status || -1,
      data: undefined as unknown as T,
      error: apiError
    };

    return apiResponse;
  }

  public request<T>(config: AxiosRequestConfig): Promise<APIResponse<T>> {
    return new Promise((resolve) => {
      this.client
        .request<T, AxiosResponse<T>>(config)
        .then((response) => {
          resolve(this.createSuccessResponse<T>(response));
        })
        .catch((error) => {
          resolve(this.createErrorResponse<T>(error));
        });
    });
  }

  public get<T>(url: string, config?: AxiosRequestConfig): Promise<APIResponse<T>> {
    return new Promise((resolve) => {
      this.client
        .get<T, AxiosResponse<T>>(url, config)
        .then((response) => {
          resolve(this.createSuccessResponse<T>(response));
        })
        .catch((error) => {
          resolve(this.createErrorResponse<T>(error));
        });
    });
  }

  public options<T>(url: string, config?: AxiosRequestConfig): Promise<APIResponse<T>> {
    return new Promise((resolve) => {
      this.client
        .options<T, AxiosResponse<T>>(url, config)
        .then((response) => {
          resolve(this.createSuccessResponse<T>(response));
        })
        .catch((error) => {
          resolve(this.createErrorResponse<T>(error));
        });
    });
  }

  public delete<T>(url: string, config?: AxiosRequestConfig): Promise<APIResponse<T>> {
    return new Promise((resolve) => {
      this.client
        .delete<T, AxiosResponse<T>>(url, config)
        .then((response) => {
          resolve(this.createSuccessResponse<T>(response));
        })
        .catch((error) => {
          resolve(this.createErrorResponse<T>(error));
        });
    });
  }

  public head<T>(url: string, config?: AxiosRequestConfig): Promise<APIResponse<T>> {
    return new Promise((resolve) => {
      this.client
        .head<T, AxiosResponse<T>>(url, config)
        .then((response) => {
          resolve(this.createSuccessResponse<T>(response));
        })
        .catch((error) => {
          resolve(this.createErrorResponse<T>(error));
        });
    });
  }

  public post<T, B>(url: string, data?: B, config?: AxiosRequestConfig): Promise<APIResponse<T>> {
    return new Promise((resolve) => {
      this.client
        .post<T, AxiosResponse<T>, B>(url, data, config)
        .then((response) => {
          resolve(this.createSuccessResponse<T>(response));
        })
        .catch((error) => {
          resolve(this.createErrorResponse<T>(error));
        });
    });
  }

  public put<T, B>(url: string, data?: B, config?: AxiosRequestConfig): Promise<APIResponse<T>> {
    return new Promise((resolve) => {
      this.client
        .put<T, AxiosResponse<T>, B>(url, data, config)
        .then((response) => {
          resolve(this.createSuccessResponse<T>(response));
        })
        .catch((error) => {
          resolve(this.createErrorResponse<T>(error));
        });
    });
  }

  public patch<T, B>(url: string, data?: B, config?: AxiosRequestConfig): Promise<APIResponse<T>> {
    return new Promise((resolve) => {
      this.client
        .patch<T, AxiosResponse<T>, B>(url, data, config)
        .then((response) => {
          resolve(this.createSuccessResponse<T>(response));
        })
        .catch((error) => {
          resolve(this.createErrorResponse<T>(error));
        });
    });
  }
}

const api = new API();

export default api;
