import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  // timeout:5000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log("Interceptor error triggered:", error?.response?.status);
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axiosInstance.post("/refreshtoken"); 
        processQueue(null);
        isRefreshing = false;
      
        
        await new Promise(resolve => setTimeout(resolve, 100));
      
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError);
      
        if (refreshError.response?.status === 401) {
          console.warn("Session expired. Redirecting to login.");
          // store.dispatch(logout());

          window.location.href = "/login";
        }
      
        return Promise.reject(refreshError);
      }
      
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
