import axios from "axios";
// import { setLoading } from "@/utils/globalSpinner";

export const API_BASE_URL = 'https://think365.mpstechnologies.com/think365setupucp' ;

const api = axios.create({
  baseURL: API_BASE_URL + "/api",
  responseType: "json",
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

const configureInterceptors = () => {
  api.interceptors.request.use(
    (config) => {
      // setLoading(true);
      const token = localStorage.getItem("access_token");
      if (token) {
        config.headers["token"] = `${token}`;
        config.headers["userid"] = localStorage.getItem("user_id");
        config.headers["username"] = localStorage.getItem("user_name");
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
        (error.response.status === 401 ||
          error.response.status === 403 ||
          error.response.status === 500) &&
        error?.request?.responseURL !== "/"
      ) {
        // localStorage.removeItem("access_token");
        // if (typeof window !== "undefined") {
        //   window.location.href = `/?redirectUrl=${encodeURIComponent(
        //     window.location.href
        //   )}`;
        // }
      }
      return Promise.reject(error);
    }
  );

  return api;
};

configureInterceptors();

export default api;
