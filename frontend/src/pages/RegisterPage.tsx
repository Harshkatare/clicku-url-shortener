import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";

import {
  registerSchema,
  type RegisterFormData,
} from "../features/auth/auth.schemas";

import { register } from "../features/auth/auth.api";
import { AuthLayout } from "../layouts/AuthLayout";
import { PasswordStrengthMeter } from "../components/auth/PasswordStrengthMeter";
import { claimUrl } from "../features/urls/urls.api";

import {
  Alert,
  type AlertState,
} from "../components/Alert";
import { saveToken } from "../features/auth/auth.storage";

export function RegisterPage() {
  const navigate = useNavigate();

  const [alert, setAlert] = useState<AlertState | null>(null);
  const [demoCode, setDemoCode] = useState<string | null>(null);

  const {
    register: registerField,
    handleSubmit,
    watch,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const watchedPassword = watch("password") || "";

  useEffect(() => {
    const code = sessionStorage.getItem("shortlynk_demo_code");
    setDemoCode(code);
  }, []);

  useEffect(() => {
    if (!alert) return;

    const timer = setTimeout(() => {
      setAlert(null);
    }, 3000);

    return () => clearTimeout(timer);
  }, [alert]);

  async function onSubmit(
    data: RegisterFormData
  ) {
    try {
      const response = await register(data);

      if (response?.data?.token) {
        saveToken(response.data.token);

        if (demoCode) {
          try {
            await claimUrl({ shortCode: demoCode });
          } catch (claimErr) {
            console.warn("Non-blocking: Failed to claim demo link:", claimErr);
          } finally {
            sessionStorage.removeItem("shortlynk_demo_code");
          }
        }

        navigate("/dashboard");
      } else {
        navigate("/login");
      }
    } catch (err) {
      let serverMessage = "Registration failed.";
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
      title="Create Account"
      subtitle="Create an account to start shortening links."
    >
      {demoCode && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-blue-200/80 bg-blue-50/80 px-3.5 py-2.5 text-xs text-blue-700 dark:border-blue-800/60 dark:bg-blue-950/40 dark:text-blue-300">
          <span className="shrink-0 text-base">🔗</span>
          <span>
            <strong>Claim your link:</strong> We'll link your newly shortened link to your new account upon signup.
          </span>
        </div>
      )}

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-5">
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300"
          >
            Name
          </label>

          <input
            id="name"
            type="text"
            placeholder="First and last name"
            className="mt-1 h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-gray-900 placeholder:text-gray-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-blue-900/50"
            {...registerField("name")}
          />

          {errors.name && (
            <p className="mt-1 text-sm text-red-500">
              {errors.name.message}
            </p>
          )}
        </div>

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
            placeholder="you@example.com"
            autoComplete="email"
            className="mt-1 h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-gray-900 placeholder:text-gray-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-blue-900/50"
            {...registerField("email")}
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
            placeholder="At least 8 characters"
            autoComplete="new-password"
            className="mt-1 h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-gray-900 placeholder:text-gray-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-blue-900/50"
            {...registerField("password")}
          />

          {errors.password && (
            <p className="mt-1 text-sm text-red-500">
              {errors.password.message}
            </p>
          )}

          <div className="mt-2">
            <PasswordStrengthMeter password={watchedPassword} />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-3 h-12 w-full rounded-xl bg-blue-600 font-medium text-white transition hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting
            ? "Creating account..."
            : "Register"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-gray-500 dark:text-slate-400">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          Login
        </Link>
      </p>
    </AuthLayout>
  );
}