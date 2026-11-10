
import { useCallback, useState } from "react";
import axios, { type AxiosRequestConfig } from "axios";
import { useNavigate } from "react-router-dom";

import axiosInstance from "@/lib/axios";

let logoutInProgress = false;

export function useAxios<T>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const request = useCallback(
    async (config: AxiosRequestConfig): Promise<T | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await axiosInstance.request<T>(config);

        setData(response.data);
        return response.data;
      } catch (err: unknown) {
        let message = "Something went wrong.";

        if (axios.isAxiosError(err)) {
          const responseData = err.response?.data as
            | { detail?: string; message?: string }
            | undefined;

          message =
            responseData?.detail ||
            responseData?.message ||
            err.message ||
            message;

          // Handle unauthorized responses globally.
          if (
            err.response?.status === 401 &&
            config.url !== "/api/auth/logout" &&
            !logoutInProgress
          ) {
            logoutInProgress = true;

            try {
              await axiosInstance.get("/api/auth/logout");
            } catch (logoutError) {
              console.error("Logout request failed:", logoutError);
            } finally {
              logoutInProgress = false;
              navigate("/auth/login", { replace: true });
            }
          }
        }

        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [navigate]
  );

  return { data, loading, error, request };
}
