import Constants from "expo-constants";

export const getApiUrl = () => {
    // 1. Check for explicit env variable (Production)
    if (process.env.EXPO_PUBLIC_API_URL) {
        return process.env.EXPO_PUBLIC_API_URL;
    }

    // 2. Fallback to local development IP (Development)
    const localhost = Constants.expoConfig?.hostUri?.split(":")[0] || "localhost";
    return `http://${localhost}:8080`;
};

export const API_URL = getApiUrl();
