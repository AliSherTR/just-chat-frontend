import { useEffect, useState } from "react";

export const useToken = () => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Only access localStorage on the client-side
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("access_token");
      setToken(storedToken);
    }
  }, []);

  return {
    token,
  };
};
