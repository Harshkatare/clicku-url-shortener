import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";

import {
  loginSchema,
  type LoginFormData,
} from "../features/auth/auth.schemas";

import { login } from "../features/auth/auth.api";
import { saveToken } from "../features/auth/auth.storage";
import { AuthLayout } from "../layouts/AuthLayout";

import {
  Alert,
  type AlertState,
} from "../components/Alert";

export function LoginPage() {
  const navigate = useNavigate();

  const [alert, setAlert] = useState<AlertState | null>(null);

  const {
    register,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (!alert) return;

    const timer = setTimeout(() => {
      setAlert(null);
    }, 3000);

    return () => clearTimeout(timer);
  }, [alert]);

  async function onSubmit(data: LoginFormData) {
    try {
      const response = await login(data);

      saveToken(response.data.token);

      navigate("/dashboard");
    } catch (err) {
      let serverMessage = "Invalid email or password.";
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        serverMessage = err.response.data.message;
      } else if (err instanceof Error) {
        serverMessage = err.message;
      }

      setAlert({
        type: "error",
        message: serverMessage,
      });
    }
  }

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to manage and track your shortened links."
    >
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-5">
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300"
          >
            Email
          </label>

          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            autoComplete="email"
            className="mt-1 h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-gray-900 placeholder:text-gray-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-blue-900/50"
            {...register("email")}
          />

          {errors.email && (
            <p className="mt-1 text-sm text-red-500">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="mb-5">
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300"
          >
            Password
          </label>

          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            className="mt-1 h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-gray-900 placeholder:text-gray-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-blue-900/50"
            {...register("password")}
          />

          {errors.password && (
            <p className="mt-1 text-sm text-red-500">
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-3 h-12 w-full rounded-xl bg-blue-600 font-medium text-white transition hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? "Signing in..." : "Login"}
        </button>

        <p className="mt-8 text-center text-sm text-gray-500 dark:text-slate-400">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-blue-600 hover:underline dark:text-blue-400"
          >
            Register
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}