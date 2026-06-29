import { DashboardLayout } from "../layouts/DashboardLayout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  createUrlSchema,
  type CreateUrlFormData,
} from "../features/urls/urls.schemas";

import { createUrl } from "../features/urls/urls.api";

export function DashboardPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateUrlFormData>({
    resolver: zodResolver(createUrlSchema),
  });

  const onSubmit = async (data: CreateUrlFormData) => {
    try {
      const response = await createUrl(data);
  
      console.log(response);
  } catch (error) {
      console.error(error);
  }
  };

  return (
    <DashboardLayout>
      <h2 className="mb-6 text-3xl font-bold">
        Welcome back!
      </h2>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded border p-6"
      >
        <h3 className="mb-4 text-xl font-semibold">
          Create Short URL
        </h3>

        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="url"
              placeholder="https://example.com"
              {...register("originalUrl")}
              className="w-full rounded border px-4 py-2"
            />

            {errors.originalUrl && (
              <p className="mt-2 text-sm text-red-500">
                {errors.originalUrl.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="rounded bg-blue-600 px-4 py-2 text-white"
          >
            Create
          </button>
        </div>
      </form>

      <section className="mt-8">
        <h3 className="mb-4 text-xl font-semibold">
          My URLs
        </h3>

        <p>No shortened URLs yet.</p>
      </section>
    </DashboardLayout>
  );
}