import { axiosPrivate } from "./axios";
import axios from "./axios";

function useAxiosInstance() {
  axiosPrivate.interceptors.request.use(
    async (config: any) => {
      const response = await axios.get("/api/accessToken", {
        withCredentials: true,
      });

      if (response?.data && config.headers) {
        config.headers["Authorization"] = `Bearer ${response?.data}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  axiosPrivate.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // If token expired (example for 401 Unauthorized)
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Get new token from refresh endpoint
          const response = await axios.get("/api/accessToken", {
            withCredentials: true,
          });

          originalRequest.headers["Authorization"] = `Bearer ${response?.data}`;
          return axiosPrivate(originalRequest);
        } catch (refreshError) {
          // Redirect to login or handle logout
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
  return axiosPrivate;
}

export default useAxiosInstance;
