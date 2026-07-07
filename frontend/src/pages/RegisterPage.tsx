import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  registerSchema,
  type RegisterFormData,
} from "../features/auth/auth.schemas";

import { register } from "../features/auth/auth.api";
import { AuthLayout } from "../layouts/AuthLayout";

export function RegisterPage() {
  const navigate = useNavigate();

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(
      registerSchema
    ),
  });

  async function onSubmit(
    data: RegisterFormData
  ) {
    try {
      await register(data);

      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Create your ClickU account."
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-5">
          <label
            htmlFor="name"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Name
          </label>

          <input
            id="name"
            type="text"
            placeholder="Enter your name"
            className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500"
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
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Email
          </label>

          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500"
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
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Password
          </label>

          <input
            id="password"
            type="password"
            placeholder="Create a password"
            className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500"
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
          className="mt-2 w-full rounded-xl bg-blue-600 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Register
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
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