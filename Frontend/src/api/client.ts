import { AUTH_STORAGE_KEY } from '../constants/storage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function getStoredAuthToken(): string | null {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }

  try {
    const storedUser = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!storedUser) {
      return null;
    }

    const parsed = JSON.parse(storedUser);
    return typeof parsed?.token === 'string' ? parsed.token : null;
  } catch (error) {
    console.warn('Unable to read auth token from storage', error);
    return null;
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const token = getStoredAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers ? (options.headers as Record<string, string>) : {}),
    };

    if (token && !headers.Authorization) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorData;
      const responseText = await response.text();

      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = responseText;
      }

      throw new ApiError(
        errorData?.message || `Request failed with status ${response.status}`,
        response.status,
        errorData
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Network request failed'
    );
  }
}

export const apiClient = {
  post: <T>(endpoint: string, data?: unknown) =>
    fetchApi<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  get: <T>(endpoint: string) =>
    fetchApi<T>(endpoint, {
      method: 'GET',
    }),
};
