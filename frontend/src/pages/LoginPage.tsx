import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  loginSchema,
  type LoginFormData,
} from "../features/auth/auth.schemas";

import { login } from "../features/auth/auth.api";
import { saveToken } from "../features/auth/auth.storage";
import { AuthLayout } from "../layouts/AuthLayout";

export function LoginPage() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    try {
      const response = await login(data);

      saveToken(response.data.token);

      navigate("/dashboard");
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Login to manage your short URLs."
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-5">
          <label
            htmlFor="email"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Email
          </label>

          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500"
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
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Password
          </label>

          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500"
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
          className="mt-2 w-full rounded-xl bg-blue-600 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Login
        </button>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-blue-600 hover:underline"
          >
            Register
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}