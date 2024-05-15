type APIResponse<T> = {
  success: boolean;
  status: number;
  data: T;
  error?: APIError;
};

type APIError = {
  status?: number;
  errorMessage?: string;
  hasFieldErrors: boolean;
  fieldErrors: { [field: string]: string };
};

type APIPaging = {
  perPage: number;
  page: number;
  lastPage: number;
  count: number;
};

export type { APIResponse, APIError, APIPaging };
