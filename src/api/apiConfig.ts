import { API_BASE_URL } from "./axiosConfig";

const API_ENDPOINTS = {
  auth: {
    login: `${API_BASE_URL}/auth/login`,
  },
  customer: {
    fetch: `${API_BASE_URL}/getSearchedCustomersWithTwoActiveRecentOrderCodes?pubId=6&page=0&size=50`,
  },
  entityData: `${API_BASE_URL}/generic/fetchEntityData`,
};

export default API_ENDPOINTS;
