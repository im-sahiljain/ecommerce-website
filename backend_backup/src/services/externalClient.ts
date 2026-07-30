import axios, { AxiosInstance } from 'axios';

export const resilientApiClient: AxiosInstance = axios.create({
  timeout: 2500, // Aggressive 2.5s timeout ceiling
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

resilientApiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    if (!config) return Promise.reject(error);

    config.retryCount = config.retryCount || 0;
    const MAX_RETRIES = 2;

    if (config.retryCount < MAX_RETRIES && (error.code === 'ECONNABORTED' || (error.response && error.response.status >= 500))) {
      config.retryCount += 1;
      const delayMs = Math.pow(2, config.retryCount) * 200 + Math.random() * 50;
      console.warn(`[AXIOS RESILIENCE RETRY] Retrying ${config.url} (Attempt ${config.retryCount}) in ${delayMs.toFixed(0)}ms`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return resilientApiClient(config);
    }

    return Promise.reject(error);
  }
);
