import API_ENDPOINTS from "./apiConfig";
import api, { type CustomInternalAxiosRequestConfig } from "./axiosConfig";

export type Filter = {
  path: string;
  operator: string;
  value: string | number | boolean;
};

export type Payload = {
  class: string;
  fields: string;
  filters?: Filter[];
};

export type QueryString = {
  page?: number;
  size?: number;
  sort?: string;
};

export const register = async (payload: any) => {
  try {
    const response = await api.post(API_ENDPOINTS.auth.signup, payload);
    if (response.data?.success) {
      return response?.data;
    }
    throw response?.data;
  } catch (error: any) {
    console.error(error);
    throw error;
  }
};
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

export const fetchUserDetails = async (payload: any) => {
  try {
    const response = await api.get(API_ENDPOINTS.user.me, payload);
    if (response.data?.success) {
      return response?.data;
    }
    throw response?.data;
  } catch (error: any) {
    console.error(error);
    throw error;
  }
};

export const fetchAllCountries = async () => {
  try {
    const response = await api.get(API_ENDPOINTS.location.countries, {
      skipAuth: true,
    } as CustomInternalAxiosRequestConfig);
    if (response.data?.length) {
      return response?.data;
    }
    throw response?.data;
  } catch (error: any) {
    console.error(error);
    throw error;
  }
};

export const fetchGeoDataByZipCode = async (payload: {
  countryCode: string;
  zipCode: string;
}) => {
  try {
    const response = await api.get(
      `${API_ENDPOINTS.location.geoDataByZipCode}/${payload?.countryCode}/${payload?.zipCode}`,
      {
        skipAuth: true,
      } as CustomInternalAxiosRequestConfig
    );
    if (response?.data) {
      return response?.data;
    }
    throw response?.data;
  } catch (error: any) {
    console.error(error);
    throw error;
  }
};

export const fetchEntityData = async (
  payload: Payload,
  queryString?: QueryString
) => {
  try {
    payload = {
      ...payload,
      filters: payload?.filters
        ? payload?.filters.map((filter) => ({
            ...filter,
            value:
              typeof filter.value === "string"
                ? filter.value
                : String(filter.value),
          }))
        : [],
    };
    queryString = queryString ? queryString : { page: 0, size: 2147483647 };
    const queryParams =
      "?" +
      Object.entries(queryString)
        .map(
          ([key, value]) =>
            `${encodeURIComponent(key)}=${encodeURIComponent(
              value?.toString()
            )}`
        )
        .join("&");

    const response = await api.post(
      `${API_ENDPOINTS.entityData}${queryParams}`,
      payload
    );
    return response.data?.data;
  } catch (error: any) {
    throw error?.message;
  }
};

export const saveConfig = async (payload: any) => {
  try {
    const response = await api.post(API_ENDPOINTS.config.save, payload);
    if (response.data?.success) {
      return response?.data;
    }
    throw response?.data;
  } catch (error: any) {
    console.error(error);
    throw error;
  }
};

export const updateConfig = async (payload: any) => {
  try {
    const response = await api.put(
      `${API_ENDPOINTS.config.update}/${payload?.id}`,
      payload
    );
    if (response.data?.success) {
      return response?.data;
    }
    throw response?.data;
  } catch (error: any) {
    console.error(error);
    throw error;
  }
};

export const setOcMapping = async (payload: any) => {
  try {
    const response = await api.post(API_ENDPOINTS.config.setOcMapping, payload);
    if (response.data?.success) {
      return response?.data;
    }
    throw response?.data;
  } catch (error: any) {
    console.error(error);
    throw error;
  }
};

export const fetchPricing = async (payload: any) => {
  try {
    const response = await api.post(
      API_ENDPOINTS.journal.fetchPricing,
      payload
    );
    if (response.data?.success) {
      return response?.data;
    }
    throw response?.data;
  } catch (error: any) {
    console.error(error);
    throw error;
  }
};

export const setCartItem = async (payload: any) => {
  try {
    const response = await api.post(API_ENDPOINTS.cart.set, payload);
    if (response.data?.success) {
      return response?.data;
    }
    throw response?.data;
  } catch (error: any) {
    console.error(error);
    throw error;
  }
};

export const updateCartItemQuantity = async (payload: {
  cartItemId: number;
  quantity: number;
}) => {
  try {
    const response = await api.put(
      `${API_ENDPOINTS.cart.updateCartItemQuantity}/${payload?.cartItemId}?quantity=${payload?.quantity}`
    );
    if (response.data?.success) {
      return response?.data;
    }
    throw response?.data;
  } catch (error: any) {
    console.error(error);
    throw error;
  }
};

export const deleteCartItem = async (cartItemId: any) => {
  try {
    const response = await api.delete(
      `${API_ENDPOINTS.cart.delete}/${cartItemId}`
    );
    if (response.data?.success) {
      return response?.data;
    }
    throw response?.data;
  } catch (error: any) {
    console.error(error);
    throw error;
  }
};

export const setAddress = async (payload: any) => {
  try {
    const response = await api.post(API_ENDPOINTS.user.address, payload);
    if (response.data?.success) {
      return response?.data;
    }
    throw response?.data;
  } catch (error: any) {
    console.error(error);
    throw error;
  }
};

export const setCartAddress = async (payload: any) => {
  try {
    const response = await api.post(API_ENDPOINTS.cart.address, payload);
    if (response.data?.success) {
      return response?.data;
    }
    throw response?.data;
  } catch (error: any) {
    console.error(error);
    throw error;
  }
};

export const placeOrder = async () => {
  try {
    const response = await api.post(API_ENDPOINTS.order.place, {});
    if (response.data?.success) {
      return response?.data;
    }
    throw response?.data;
  } catch (error: any) {
    console.error(error);
    throw error;
  }
};

export const payOrder = async (payload: any) => {
  try {
    const response = await api.post(API_ENDPOINTS.payment.pay, payload);
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
