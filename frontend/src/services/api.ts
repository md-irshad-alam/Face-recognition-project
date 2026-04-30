/**
 * Centralized API client with interceptor-like behavior.
 * Handles base URL, auth tokens, and common response patterns.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

class ApiClient {
  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = new URL(`${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`);
    
    if (options.params) {
      Object.entries(options.params).forEach(([key, val]) => url.searchParams.append(key, val));
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    const headers = new Headers(options.headers);
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    // Default Content-Type if body is not FormData
    if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const config: RequestInit = {
      ...options,
      headers
    };

    try {
      const response = await fetch(url.toString(), config);
      
      // Handle non-2xx responses
      if (!response.ok) {
        if (response.status === 401) {
          // Automatic logout on token expiry, but don't redirect if already on login
          if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            const currentPath = window.location.pathname + window.location.search;
            localStorage.removeItem('token');
            window.location.href = `/login?callbackUrl=${encodeURIComponent(currentPath)}`;
          }
        }
        const errorData = await response.json().catch(() => ({ message: 'An error occurred' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json() as T;
    } catch (error: any) {
      console.error(`[API Error] ${endpoint}:`, error);
      throw error;
    }
  }

  get<T>(endpoint: string, options?: RequestOptions) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T>(endpoint: string, body?: any, options?: RequestOptions) {
    const isFormData = body instanceof FormData;
    return this.request<T>(endpoint, { 
      ...options, 
      method: 'POST', 
      body: isFormData ? body : JSON.stringify(body) 
    });
  }

  put<T>(endpoint: string, body?: any, options?: RequestOptions) {
    const isFormData = body instanceof FormData;
    return this.request<T>(endpoint, { 
      ...options, 
      method: 'PUT', 
      body: isFormData ? body : JSON.stringify(body) 
    });
  }

  delete<T>(endpoint: string, options?: RequestOptions) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  // Helper for FormData (e.g. photos)
  postForm<T>(endpoint: string, formData: FormData, options?: RequestOptions) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: formData
    });
  }
}

export const api = new ApiClient();
