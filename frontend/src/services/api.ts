/**
 * Centralized API client with interceptor-like behavior.
 * Handles base URL, auth tokens, and common response patterns.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.visio.school';
// const BASE_URL = 'http://127.0.0.1:8000';

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

class ApiClient {
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  private subscribeTokenRefresh(cb: (token: string) => void) {
    this.refreshSubscribers.push(cb);
  }

  private onTokenRefreshed(token: string) {
    this.refreshSubscribers.map(cb => cb(token));
    this.refreshSubscribers = [];
  }

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
      headers,
      credentials: 'include' // Crucial for HTTP-only cookies
    };

    try {
      const response = await fetch(url.toString(), config);
      
      // Handle non-2xx responses
      if (!response.ok) {
        if (response.status === 401 && endpoint !== '/auth/login' && endpoint !== '/auth/refresh') {
          // Attempt refresh
          if (!this.isRefreshing) {
            this.isRefreshing = true;
            try {
              const refreshData = await this.post<any>('/auth/refresh');
              if (refreshData && refreshData.access_token) {
                localStorage.setItem('token', refreshData.access_token);
                this.isRefreshing = false;
                this.onTokenRefreshed(refreshData.access_token);
                // Retry the original request
                return this.request<T>(endpoint, options);
              }
            } catch (refreshError) {
              this.isRefreshing = false;
              // If refresh fails, redirect to login (unless it's a public page)
              if (typeof window !== 'undefined') {
                const isPublicRoute = window.location.pathname === '/login' || 
                                    window.location.pathname === '/signup' || 
                                    window.location.pathname.startsWith('/public-profile/');
                
                if (!isPublicRoute) {
                  localStorage.removeItem('token');
                  window.location.href = `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
                }
              }
              throw refreshError;
            }
          } else {
            // Wait for refresh to complete
            return new Promise((resolve) => {
              this.subscribeTokenRefresh((newToken) => {
                resolve(this.request<T>(endpoint, options));
              });
            });
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
