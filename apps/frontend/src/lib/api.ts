// Utility for making API calls to the backend service
// This assumes you have NEXT_PUBLIC_BACKEND_URL configured

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('auth-token'); // Adjust based on your auth implementation
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Content monitoring endpoints
  async getMonitoringStatus(): Promise<
    ApiResponse<{
      activeSources: number;
      unprocessedItems: number;
      recentItems: any[];
    }>
  > {
    return this.request('/content-monitoring/status');
  }

  async triggerManualMonitor(): Promise<
    ApiResponse<{
      newItems: number;
      sources: number;
    }>
  > {
    return this.request('/content-monitoring/manual-monitor', {
      method: 'POST',
    });
  }

  async addNyaaSource(
    name: string,
    rssUrl: string
  ): Promise<ApiResponse<void>> {
    return this.request('/content-monitoring/add-nyaa-source', {
      method: 'POST',
      body: JSON.stringify({ name, rssUrl }),
    });
  }

  async testNotifications(): Promise<ApiResponse<{ telegram: boolean }>> {
    return this.request('/content-monitoring/test-notifications', {
      method: 'POST',
    });
  }
}

export const apiClient = new ApiClient(BACKEND_URL);

// Hook for using the backend API
export function useBackendApi() {
  return apiClient;
}
