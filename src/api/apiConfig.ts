import { API_BASE_URL } from "./axiosConfig";

const API_IAM_URL = "https://thinkweb.mpstechnologies.com";
const API_ENDPOINTS = {
  auth: {
    signup: `${API_BASE_URL}/v1/auth/signup`,
    login: `${API_BASE_URL}/v1/auth/authenticate`,
  },
  user: {
    me: `${API_BASE_URL}/v1/users/me`,
    address: `${API_BASE_URL}/v1/users/address`,
  },
  customer: {
    fetch: `${API_BASE_URL}/getSearchedCustomersWithTwoActiveRecentOrderCodes?pubId=6&page=0&size=50`,
  },
  config: {
    save: `${API_BASE_URL}/v1/config/save`,
    update: `${API_BASE_URL}/v1/config/update`,
    setOcMapping: `${API_BASE_URL}/v1/ocmapping/saveUpdate`,
  },
  journal: {
    fetch: `${API_BASE_URL}/getSearchedCustomersWithTwoActiveRecentOrderCodes?pubId=6&page=0&size=50`,
    fetchPricing: `${API_BASE_URL}/v1/pricing/calculate`,
  },
  cart: {
    set: `${API_BASE_URL}/v1/cart/items`,
    updateCartItemQuantity: `${API_BASE_URL}/v1/cart/items`,
    delete: `${API_BASE_URL}/v1/cart/items`,
    address: `${API_BASE_URL}/v1/cart/address`,
  },
  order: {
    place: `${API_BASE_URL}/v1/place/orders`,
  },
  payment: {
    pay: `${API_BASE_URL}/v1/payment/pay`,
  },
  entityData: `${API_BASE_URL}/v1/data/fetch`,
  location: {
    countries:
      "https://raw.githubusercontent.com/dr5hn/countries-states-cities-database/master/json/countries.json",
    geoDataByZipCode: `${API_IAM_URL}/getGeoDataByZipCode`,
  },
};

export default API_ENDPOINTS;
