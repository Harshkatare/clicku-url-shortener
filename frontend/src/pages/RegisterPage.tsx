import { useNavigate } from "react-router-dom";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import {
  registerSchema,
  type RegisterFormData,
} from "../features/auth/auth.schemas";

import { register } from "../features/auth/auth.api";

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
      const response =
        await register(data);

      console.log(response);

      navigate("/login");

    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div>
      <h1>Register</h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
      >
        <div>
          <input
            type="text"
            placeholder="Name"
            {...registerField("name")}
          />

          {errors.name && (
            <p>
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <input
            type="email"
            placeholder="Email"
            {...registerField("email")}
          />

          {errors.email && (
            <p>
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <input
            type="password"
            placeholder="Password"
            {...registerField("password")}
          />

          {errors.password && (
            <p>
              {errors.password.message}
            </p>
          )}
        </div>

        <button type="submit">
          Register
        </button>
      </form>
    </div>
  );
}