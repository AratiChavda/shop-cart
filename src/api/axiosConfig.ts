import axios, { type InternalAxiosRequestConfig } from "axios";
// import { setLoading } from "@/utils/globalSpinner";

export interface CustomInternalAxiosRequestConfig
  extends InternalAxiosRequestConfig {
  skipAuth?: boolean;
}

export const API_BASE_URL =
  "https://think365.mpstechnologies.com/think365setupucp";

const api = axios.create({
  baseURL: API_BASE_URL,
  responseType: "json",
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

const configureInterceptors = () => {
  api.interceptors.request.use(
    (config: CustomInternalAxiosRequestConfig) => {
      // setLoading(true);
      if (!config.skipAuth) {
        const token = localStorage.getItem("access_token");
        if (token) {
          config.headers["Authorization"] = `Bearer ${token}`;
        }
      }

      return config;
    },
    (error) => {
      // setLoading(false);
      return Promise.reject(error);
    }
  );

  api.interceptors.response.use(
    (response) => {
      // setLoading(false);
      return response;
    },
    (error) => {
      // setLoading(false);
      if (
        error.response &&
        (error.response.status === 401 || error.response.status === 403) &&
        error?.request?.responseURL !== "/"
      ) {
        localStorage.removeItem("access_token");
        if (typeof window !== "undefined") {
          window.location.href = `/?redirectUrl=${encodeURIComponent(
            window.location.href
          )}`;
        }
      }
      return Promise.reject(error);
    }
  );

  return api;
};

configureInterceptors();

export default api;
