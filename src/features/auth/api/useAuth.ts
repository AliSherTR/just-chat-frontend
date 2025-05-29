import {
  QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type LoginRequestParams = {
  email: string;
  password: string;
};

type SignUpRequestParams = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

export function useAuth() {
  const router = useRouter();
  const queyrClient = useQueryClient();
  async function loginUser({ email, password }: LoginRequestParams) {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Login failed");
      }
      const data = await response.json();
      localStorage.setItem("access_token", data.data);
      return data;
    } catch (error: any) {
      throw error;
    }
  }

  async function logoutUser() {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Logout failed");
      }
      const data = await response.json();
      return data;
    } catch (error: any) {
      throw error;
    }
  }

  async function signupUser({
    email,
    password,
    firstName,
    lastName,
  }: SignUpRequestParams) {
    const name = firstName + ` ${lastName}`;
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Signup failed");
    }

    const data = await response.json();
    console.log(data);
    localStorage.setItem("access_token", data.token.access_token);
    return data;
  }

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      toast.success(data.message, {
        style: {
          color: "white",
          backgroundColor: "green",
        },
      });
      router.replace("/chats");
    },
    onError: (error) => {
      toast.error(error.message, {
        style: {
          color: "white",
          backgroundColor: "red",
        },
      });
      return;
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: (data) => {
      toast.success(data.message, {
        style: {
          color: "white",
          backgroundColor: "green",
        },
      });
      router.push("/auth/login");
      queyrClient.removeQueries({ queryKey: ["chats"] });
    },
    onError: (error) => {
      toast.error(error.message, {
        style: {
          color: "white",
          backgroundColor: "red",
        },
      });
      return;
    },
  });

  const signupMutation = useMutation({
    mutationFn: signupUser,
    onSuccess: (data) => {
      toast.success(data.message, {
        style: {
          color: "white",
          backgroundColor: "green",
        },
      });
      router.push("/chats");
    },
    onError: (error) => {
      toast.error(error.message, {
        style: {
          color: "white",
          backgroundColor: "red",
        },
      });

      return;
    },
  });

  return {
    login: loginMutation.mutate,
    loggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    logout: logoutMutation.mutate,
    logginOut: logoutMutation.isPending,
    signup: signupMutation.mutate,
    signupStatus: signupMutation.isPending,
    signupError: signupMutation.error,
  };
}
