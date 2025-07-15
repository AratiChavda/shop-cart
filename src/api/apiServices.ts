import API_ENDPOINTS from "./apiConfig";
import api from "./axiosConfig";

export const userSignin = async (payload: any) => {
  try {
    const response = await api.post(API_ENDPOINTS.auth.login, payload);
    if (response.data?.success) {
      return response?.data;
    }
    throw response?.data;
  } catch (error: any) {
    console.error(error);
    throw error;
  }
};

export const fetchCustomers = async () => {
  try {
    const response = await api.get(API_ENDPOINTS.customer.fetch);
    return response.data;
  } catch (error: any) {
    throw error?.message;
  }
};
