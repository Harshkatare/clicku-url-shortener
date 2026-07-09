import { useState } from "react";

import { DashboardLayout } from "../layouts/DashboardLayout";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

import {
  createUrlSchema,
  type CreateUrlFormData,
} from "../features/urls/urls.schemas";

import { 
    createUrl, 
    getUrls,
    deleteUrl,
} from "../features/urls/urls.api";

import { env } from "../config/env";

import { copyToClipboard } from "../utils/copy";

import { 
    Alert,
    type AlertState,
  } from "../components/Alert";

export function DashboardPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUrlFormData>({
    resolver: zodResolver(createUrlSchema),
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["urls"],
    queryFn: getUrls,
  });

  const queryClient = useQueryClient();

  const createUrlMutation = useMutation({
    mutationFn: createUrl,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["urls"],
      });

      reset();

      setAlert({
        type: "success",
        message: "Short URL created successfully.",
      });
    },
  });

  const deleteUrlMutation = useMutation({
    mutationFn: deleteUrl,
  
    onMutate: (id) => {
      setDeletingId(id);
    },
  
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["urls"],
      });
      setAlert({
        type: "success",
        message: "Short URL deleted successfully.",
      });
    },
  
    onSettled: () => {
      setDeletingId(null);
    },
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [alert, setAlert] =
  useState<AlertState | null>(null);

  const onSubmit = async (data: CreateUrlFormData) => {
    try {
      await createUrlMutation.mutateAsync(data);
    } catch (error) {
      setAlert({
        type: "error",
        message: "Failed to create short URL.",
      });
      
      console.error(error);
    }
  };

  async function handleCopy(shortCode: string, id: string) {
    try {
      const shortUrl = `${env.SHORT_URL_BASE}/${shortCode}`;

      await copyToClipboard(shortUrl);

      setCopiedId(id);

      setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleDelete(
    id: string
  ) {
    try {
      await deleteUrlMutation.mutateAsync(id);
    } catch (error) {
      setAlert({
        type: "error",
        message: "Failed to delete short URL.",
      });
      
      console.error(error);
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <p>Loading...</p>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <p>Something went wrong.</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
        />
      )}

      <h2 className="mb-6 text-3xl font-bold">Dashboard</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-xl font-semibold">Create Short URL</h3>

        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex-1">
            <input
              type="url"
              placeholder="https://example.com"
              {...register("originalUrl")}
              className="w-full h-12 rounded-xl border border-gray-300 px-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />

            {errors.originalUrl && (
              <p className="mt-2 text-sm text-red-500">
                {errors.originalUrl.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={createUrlMutation.isPending}
            className="h-12 rounded-xl bg-blue-600 px-6 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {createUrlMutation.isPending ? "Creating..." : "Create"}
          </button>
        </div>
      </form>

      <section className="mt-8">
        <h3 className="mb-4 text-xl font-semibold">My URLs</h3>

        {data?.data.length === 0 ? (
          <div className="rounded-lg border border-dashed p-10 text-center">
            <div className="mb-4 text-3xl">🔗</div>

            <h3 className="text-xl font-semibold">No URLs Yet</h3>

            <p className="mt-2 text-gray-500">
              Create your first short URL using the form above.
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {data?.data.map((url) => (
              <li key={url.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <p className="break-all font-semibold">
                    {`${env.SHORT_URL_BASE}/${url.shortCode}`}
                  </p>

                  <button
                    type="button"
                    onClick={() => handleCopy(url.shortCode, url.id)}
                    className="rounded bg-gray-200 px-3 py-1 text-sm transition hover:bg-gray-300"
                  >
                    {copiedId === url.id ? "Copied!" : "Copy"}
                  </button>
                </div>

                <p className="mt-3 break-all text-sm text-gray-600">
                  {url.originalUrl}
                </p>

                <div className="mt-2 flex items-center justify-between">
  <p className="text-sm">
    Clicks: {url.clicks}
  </p>

  <button
    type="button"
    onClick={() => handleDelete(url.id)}
    disabled={deletingId === url.id}
    className="rounded bg-red-600 px-3 py-1 text-sm text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
  >
    {deletingId === url.id
      ? "Deleting..."
      : "Delete"}
  </button>
</div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </DashboardLayout>
  );
}
