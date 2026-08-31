import { ApiError } from '../types/index.js';

// Base URL configurável. Em desenvolvimento no Vite com proxy integrado usa /api,
// ou pode ser apontado para http://localhost:7000/api ou a URL do backend Java.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export class ApiException extends Error {
  public status: number;

  constructor(apiError: ApiError) {
    super(apiError.message);
    this.name = 'ApiException';
    this.status = apiError.status;
  }
}

export async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }
  headers.set('Accept', 'application/json');

  const config: RequestInit = {
    ...options,
    headers
  };

  try {
    const response = await fetch(url, config);

    // Se a resposta for 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorPayload: ApiError = {
        status: response.status,
        message: data.message || `Erro HTTP ${response.status}: ${response.statusText}`
      };
      throw new ApiException(errorPayload);
    }

    return data as T;
  } catch (err: any) {
    if (err instanceof ApiException) {
      throw err;
    }
    // Erro de rede ou indisponibilidade
    const networkError: ApiError = {
      status: 0,
      message: err.message || 'Falha na conexão com o servidor REST.'
    };
    throw new ApiException(networkError);
  }
}
