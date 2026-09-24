import axios from "axios";
import { ErrorToast } from "./components/global/Toaster";
import Cookies from "js-cookie";

export const baseUrl =
  import.meta.env.VITE_API_BASE_URL  || "https://api.my-topx.com"

// Stable device ID generator and getter
export const getStableDeviceId = () => {
  try {
    let deviceId = localStorage.getItem("topx_deviceuniqueid");
    if (!deviceId) {
      if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        deviceId = `admin-web-${crypto.randomUUID()}`;
      } else {
        deviceId = `admin-web-${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36)}`;
      }
      localStorage.setItem("topx_deviceuniqueid", deviceId);
    }
    return deviceId;
  } catch {
    return "admin-web-default-browser";
  }
};

const instance = axios.create({
  baseURL: baseUrl,
  headers: {
    devicemodel: "Admin Web Panel",
    deviceuniqueid: getStableDeviceId(),
    Accept: "application/json, text/plain, */*",
  },
  timeout: 15000,
});

instance.interceptors.request.use(
  (config) => {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      ErrorToast("No internet connection. Please check your network and try again.");
      return Promise.reject(new Error("No internet connection"));
    }

    const token = Cookies.get("token");
    const deviceId = getStableDeviceId();

    config.headers = config.headers || {};
    config.headers.devicemodel = "Admin Web Panel";
    config.headers.deviceuniqueid = deviceId;
    config.headers.Accept = "application/json, text/plain, */*";

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ECONNABORTED") {
      ErrorToast("Your internet connection is slow. Please try again.");
    }

    if (error.response && error.response.status === 401) {
      Cookies.remove("token");
      Cookies.remove("user");
      // Do not navigate immediately if on login screen
      if (window.location.pathname !== "/auth/login") {
        ErrorToast("Session expired or unauthorized. Please relogin.");
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
