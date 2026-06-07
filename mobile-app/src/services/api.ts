import axios from "axios";

const baseURL = process.env.EXPO_PUBLIC_API_URL?.trim() || "https://loan-saarthi.onrender.com/api";

export const API = axios.create({
  baseURL,
  timeout: 15000,
});
