import axios, { AxiosResponse } from "axios";

const API_HOST = "localhost:8080";

const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
};

async function request<T>(
  method: string,
  endpoint: string,
  data: any = {},
): Promise<AxiosResponse<T>> {
  const config = {
    method: method,
    maxBodyLength: Infinity,
    url: `http://${API_HOST}${endpoint}`,
    headers: {
      authorization: `Bearer ${getCookie("userAccessToken")}`,
    },
    data: data,
  };

  return axios.request<T>(config);
}

export async function post<T>(endpoint: string, data: any) {
  return request<T>("POST", endpoint, data);
}

export async function get<T>(endpoint: string): Promise<AxiosResponse<T>> {
  return request<T>("GET", endpoint);
}

export async function del<T>(endpoint: string): Promise<AxiosResponse<T>> {
  return request<T>("DELETE", endpoint);
}

export const isErrorWithResponse = (
  err: unknown,
): err is { response: { data: { message: string } } } => {
  return typeof err === "object" && err !== null && "response" in err;
};
