import axios from "axios"
import { useAuthStore } from "@/store/AuthStore"

const axiosClient = axios.create({
  baseURL: "/api",
  withCredentials: true
})

if (typeof window !== "undefined") {
  axiosClient.interceptors.request.use(
    (config) => {
      const token = useAuthStore.getState().userInfo?.access
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // Automatically refresh token on 401 and retry the original request
  axiosClient.interceptors.response.use(
    (response) => response, // Just return the response if it's successful
    async (error) => {
      const originalRequest = error.config;

      // Check if the error is due to an expired access token
      const isUnauthorized = error.response?.status === 401;
      const isUnauthorizedMessage = error.response?.data?.detail === "Token has expired. Please log in again.";
      const isFirstRetry = !originalRequest._retry;

      // const refreshToken = useAuthStore.getState().userInfo?.refresh

      if (isUnauthorized && isUnauthorizedMessage && isFirstRetry) {
        originalRequest._retry = true; // Prevent infinite loops

        try {

          // Use refresh token to get a new access token
          const refreshResponse = await axios.post(
            `${import.meta.env.VITE_API_PROXY_TARGET}/refresh_token/`,
            {
              // token: refreshToken
            }
          );

          const newAccessToken = refreshResponse.data.access;
          console.log("new accesstoken=",refreshResponse.data)

          // Save the new access token securely
          // useAuthStore.getState().updateAccessToken(newAccessToken);

          // Update the Authorization header for the original request
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          // Retry the original request with the new token
          return axiosClient(originalRequest);
        } catch (refreshError) {

          // useAuthStore.getState().clearUserInfo()
          window.location.href = "/login"
          return Promise.reject(refreshError); // Always return this
          
        }
      }else if(error.response?.status === 400 && error.response?.data?.message === "Invalid or expired token"){
        // useAuthStore.getState().clearUserInfo()
        window.location.href = "/login";
      }

      // If the error is not due to a 401 or retry fails
      return Promise.reject(error); // Always return this
    }
  );
}

export { axiosClient }
