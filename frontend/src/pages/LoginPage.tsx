import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  loginSchema,
  type LoginFormData,
} from "../features/auth/auth.schemas";

export function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  function onSubmit(
    data: LoginFormData
  ) {
    console.log(data);
  }

  return (
    <div>
      <h1>Login</h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
      >
        <div>
          <input
            type="email"
            placeholder="Email"
            {...register("email")}
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
            {...register("password")}
          />

          {errors.password && (
            <p>
              {errors.password.message}
            </p>
          )}
        </div>

        <button type="submit">
          Login
        </button>
      </form>
    </div>
  );
}