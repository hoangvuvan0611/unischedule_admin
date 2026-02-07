import axios from 'axios';
export const RESPONSE_STATUS_401 = 401;
export const REF_HOME = "/";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json"
  }
});

// Interceptor request -> Gan thong tin token neu co
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("LOCALSTORAGE_ACCESS_TOKEN");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Interceptors response
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === RESPONSE_STATUS_401) {
      // loi het token
      localStorage.removeItem("LOCALSTORAGE_ACCESS_TOKEN");
      window.location.href = REF_HOME;
    }
    return Promise.reject(error);
  }
);

export default apiClient;
