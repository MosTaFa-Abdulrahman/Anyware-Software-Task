import axios from "axios";

const BASE_URL = "http://localhost:8080/api/";

export const makeRequest = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

export const axiosBaseQuery =
  ({ baseUrl } = { baseUrl: "" }) =>
  async ({ url, method, data, params }) => {
    try {
      const result = await makeRequest({
        url: baseUrl + url,
        method,
        data,
        params,
      });
      return { data: result.data };
    } catch (axiosError) {
      const err = axiosError;
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      };
    }
  };
