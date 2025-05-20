import { useMutation } from "@tanstack/react-query";
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
    const name = firstName + lastName;
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Signup failed");
    }

    return response.json();
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
      router.push("/messages");
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
      router.push("/messages");
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
    signup: signupMutation.mutate,
    signupStatus: signupMutation.isPending,
    signupError: signupMutation.error,
  };
}
