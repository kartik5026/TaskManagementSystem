import axios from "axios";
import { backendUrl } from "@/const/page";

const axiosInstance = axios.create({
  baseURL: backendUrl,
  withCredentials: true, // send HttpOnly cookies automatically
});

// Response interceptor to handle 401 (access token expired)
axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Check if error is 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Call refresh token API
        await axios.post(
          `${backendUrl}/users/refreshToken`,
          {}, // body empty, refresh token in cookie
          { withCredentials: true }
        );

        // Retry original request after refresh
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed → redirect to login
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
