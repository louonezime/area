import axios from "axios";
import Cookies from "js-cookie";
import { get } from "./requests";
import { OAuthResponse, token } from "./_lib/types";

export async function handleOAuth(provider: string) {
  try {
    const uri = await get<OAuthResponse>(
      `/oauth/${provider}/init?redirect=http://localhost:8081/explore`,
    );
    return uri.data.redirectUrl;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`${provider} Connection Failure:`, error.message);
    } else {
      console.error(`An unexpected error occurred with ${provider}`, error);
    }
  }
}

export async function handleOAuthRedirection(provider: string, search: string) {
  try {
    const response = await get<token>(
      `/oauth/${provider}/callback?code=${search}&redirect=http://localhost:8081/explore`,
    );
    const accessToken = response.data;
    Cookies.set("userAccessToken", accessToken.access_token, {
      expires: 7,
      path: "/",
    });
    console.log(`${provider} connection succeeded!`);
    return 0;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`${provider} Connection Failure:`, error.message);
    } else {
      console.error(`An unexpected error occurred with ${provider}:`, error);
    }
    return -1;
  }
}
