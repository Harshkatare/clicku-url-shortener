import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  registerSchema,
  type RegisterFormData,
} from "../features/auth/auth.schemas";

import { register } from "../features/auth/auth.api";
import { AuthLayout } from "../layouts/AuthLayout";

import {
  Alert,
  type AlertState,
} from "../components/Alert";

export function RegisterPage() {
  const navigate = useNavigate();

  const [alert, setAlert] =useState<AlertState | null>(null);

  const {
    register: registerField,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

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
      await register(data);

      navigate("/login");
    } catch {
        setAlert({
          type: "error",
          message: "Registration failed.",
        });
    }
  }

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Create an account to start shortening links."
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
            htmlFor="name"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Name
          </label>

          <input
            id="name"
            type="text"
            placeholder="Enter your name"
            className="mt-1 h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-gray-900 placeholder:text-gray-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
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
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Email
          </label>

          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            autoComplete="email"
            className="mt-1 h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-gray-900 placeholder:text-gray-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
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
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Password
          </label>

          <input
            id="password"
            type="password"
            placeholder="Create a password"
            autoComplete="new-password"
            className="mt-1 h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-gray-900 placeholder:text-gray-400 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            {...registerField("password")}
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
          className="mt-3 h-12 w-full rounded-xl bg-blue-600 font-medium text-white transition hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting
            ? "Creating account..."
            : "Register"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-medium text-blue-600 hover:underline"
        >
          Login
        </Link>
      </p>
    </AuthLayout>
  );
}