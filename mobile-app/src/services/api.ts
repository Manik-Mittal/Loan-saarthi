import Constants from "expo-constants";
import axios from "axios";

const getExpoHost = (): string | null => {
  const hostUri =
    (Constants.expoConfig as any)?.hostUri ||
    (Constants as any)?.manifest2?.extra?.expoGo?.debuggerHost ||
    (Constants as any)?.manifest?.debuggerHost;

  if (!hostUri || typeof hostUri !== "string") {
    return null;
  }

  return hostUri.split(":")[0] || null;
};

const getBaseURL = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (envUrl) return envUrl;

  const host = getExpoHost();
  if (host) return `http://${host}:5001/api`;

  return "http://127.0.0.1:5001/api";
};

export const API = axios.create({
  baseURL: getBaseURL(),
  timeout: 15000,
});
