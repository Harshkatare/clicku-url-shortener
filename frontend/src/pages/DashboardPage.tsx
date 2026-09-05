import { useEffect, useState } from "react";

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

  useEffect(() => {
  if (!alert) {
    return;
  }

  const timer = setTimeout(() => {
    setAlert(null);
  }, 3000);

  return () => clearTimeout(timer);
}, [alert]);

  const onSubmit = async (data: CreateUrlFormData) => {
    try {
      await createUrlMutation.mutateAsync(data);
    } catch {
        setAlert({
          type: "error",
          message: "Failed to create short URL.",
        });
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
    } catch {
        setAlert({
          type: "error",
          message: "Failed to copy URL.",
        });
      }
  }

  async function handleDelete(
    id: string
  ) {
    try {
      await deleteUrlMutation.mutateAsync(id);
    } catch {
        setAlert({
          type: "error",
          message: "Failed to delete short URL.",
        });
      }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <p className="text-gray-600 dark:text-slate-300">Loading...</p>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <p className="text-red-600 dark:text-red-400">Something went wrong.</p>
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

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Dashboard
        </h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-xs backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/80 transition-colors duration-200">
        <h3 className="mb-4 text-xl font-semibold text-slate-900 dark:text-slate-100">Create Short URL</h3>

        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex-1">
            <input
              type="url"
              placeholder="https://example.com"
              {...register("originalUrl")}
              className="w-full h-12 rounded-xl border border-slate-300 bg-white px-4 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-blue-900/50 transition-colors duration-200"
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
            className="h-12 rounded-xl bg-blue-600 px-6 font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            {createUrlMutation.isPending ? "Creating..." : "Create"}
          </button>
        </div>
      </form>

      <section className="mt-8">
        <h3 className="mb-4 text-xl font-semibold text-slate-900 dark:text-slate-100">My URLs</h3>

        {data?.data.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300/80 bg-white/50 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/40 p-12 text-center transition-colors">
            <div className="mb-4 text-5xl">🔗</div>

            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">No URLs Yet</h3>

            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Create your first short URL using the form above.
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {data?.data.map((url) => (
              <li key={url.id} className="card-hover rounded-2xl border border-slate-200/80 bg-white/85 p-5 shadow-xs backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/85 transition-colors duration-200">
                <div className="flex items-center justify-between gap-4">
                  <a
                    href={`${env.SHORT_URL_BASE}/${url.shortCode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-1.5 break-all text-lg font-semibold text-blue-600 transition hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                    title="Open short link in new tab"
                  >
                    <span>
                      {env.SHORT_URL_BASE.replace(/^https?:\/\//, "")}/<span className="font-bold text-slate-900 dark:text-slate-100">{url.shortCode}</span>
                    </span>
                    <svg className="h-4 w-4 shrink-0 opacity-60 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>

                  <button
                    type="button"
                    onClick={() => handleCopy(url.shortCode, url.id)}
                    className="shrink-0 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                  >
                    {copiedId === url.id ? "Copied!" : "Copy"}
                  </button>
                </div>

                <p className="mt-3 break-all text-sm text-slate-500 dark:text-slate-400">
                  {url.originalUrl}
                </p>

                <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-800/60">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    <p>
                      Clicks: <span className="font-semibold text-slate-700 dark:text-slate-300">{url.clicks}</span>
                    </p>
                    {Boolean(url.createdAt) && (
                      <>
                        <span className="text-slate-300 dark:text-slate-700">·</span>
                        <span
                          className="inline-flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500"
                          title={`Created: ${new Date(url.createdAt).toLocaleString()}`}
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>
                            {new Date(url.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} at {new Date(url.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
                          </span>
                        </span>
                      </>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(url.id)}
                    disabled={deletingId === url.id}
                    className="shrink-0 rounded-xl border border-red-200 bg-red-50 px-3.5 py-1.5 text-xs font-semibold text-red-600 shadow-xs transition hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300 dark:hover:bg-red-900/60 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
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
