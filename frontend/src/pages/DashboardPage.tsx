import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import { DashboardLayout } from "../layouts/DashboardLayout";

import {
  useQuery,
  useQueryClient,
  useMutation,
  keepPreviousData,
} from "@tanstack/react-query";

import {
  getUrls,
  deleteUrl,
  getUrlStats,
} from "../features/urls/urls.api";

import type { Url, UrlStatus } from "../features/urls/urls.types";
import { env } from "../config/env";

import { copyToClipboard } from "../utils/copy";
import { useToastContext } from "../context/ToastContext";
import { StatCards } from "../components/dashboard/StatCards";
import { CreateUrlBar } from "../components/dashboard/CreateUrlBar";
import { UrlToolbar } from "../components/dashboard/UrlToolbar";
import { PaginationControls } from "../components/dashboard/PaginationControls";
import { EditUrlModal } from "../components/dashboard/EditUrlModal";
import { useDebounce } from "../hooks/useDebounce";

export function DashboardPage() {
  const { showToast } = useToastContext();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL state extraction (deep-linking & refresh persistence)
  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const currentPage = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  const rawStatus = searchParams.get("status");
  const currentStatus: UrlStatus | "all" =
    rawStatus === "active" || rawStatus === "expiring" || rawStatus === "archived"
      ? rawStatus
      : "all";
  const urlSearch = searchParams.get("search") || "";

  // Local input for immediate keystroke feedback
  const [searchInput, setSearchInput] = useState(urlSearch);

  // 400ms debounce to shield network & PostgreSQL pool
  const debouncedSearch = useDebounce(searchInput, 400);

  // Track external searchParam updates (e.g. browser back/forward) during render without cascading effects
  const [prevUrlSearch, setPrevUrlSearch] = useState(urlSearch);
  if (prevUrlSearch !== urlSearch) {
    setPrevUrlSearch(urlSearch);
    if (urlSearch !== debouncedSearch.trim()) {
      setSearchInput(urlSearch);
    }
  }

  // Synchronize debounced search to URL search params with history replacement
  useEffect(() => {
    const trimmed = debouncedSearch.trim();
    if (trimmed !== urlSearch) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (trimmed) {
            next.set("search", trimmed);
          } else {
            next.delete("search");
          }
          next.delete("page"); // Reset-to-page-1 invariant
          return next;
        },
        { replace: true }
      );
    }
  }, [debouncedSearch, urlSearch, setSearchParams]);

  // Main paginated URLs query
  const {
    data,
    isLoading,
    isFetching,
    isPlaceholderData,
    error,
  } = useQuery({
    queryKey: [
      "urls",
      {
        search: debouncedSearch.trim() || undefined,
        status: currentStatus === "all" ? undefined : currentStatus,
        page: currentPage,
        limit: 10,
      },
    ],
    queryFn: () =>
      getUrls({
        search: debouncedSearch.trim() || undefined,
        status: currentStatus === "all" ? undefined : currentStatus,
        page: currentPage,
        limit: 10,
      }),
    placeholderData: keepPreviousData,
  });

  // Overview portfolio stats query
  const { data: statsData, isLoading: isStatsLoading } = useQuery({
    queryKey: ["urls", "stats"],
    queryFn: getUrlStats,
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingUrl, setEditingUrl] = useState<Url | null>(null);

  const deleteUrlMutation = useMutation({
    mutationFn: deleteUrl,
    onMutate: (id) => {
      setDeletingId(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["urls"],
      });
      showToast("success", "Short URL deleted successfully.");
    },
    onSettled: () => {
      setDeletingId(null);
    },
  });

  const handleStatusChange = (newStatus: UrlStatus | "all") => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (newStatus !== "all") {
        next.set("status", newStatus);
      } else {
        next.delete("status");
      }
      next.delete("page"); // Reset-to-page-1 invariant
      return next;
    });
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (newPage > 1) {
        next.set("page", String(newPage));
      } else {
        next.delete("page");
      }
      return next;
    });
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("search");
      next.delete("status");
      next.delete("page");
      return next;
    });
  };

  async function handleCopy(shortCode: string, id: string) {
    try {
      const shortUrl = `${env.SHORT_URL_BASE}/${shortCode}`;
      await copyToClipboard(shortUrl);
      setCopiedId(id);
      showToast("info", "Link copied to clipboard!");

      setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    } catch {
      showToast("error", "Failed to copy URL.");
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteUrlMutation.mutateAsync(id);
    } catch {
      showToast("error", "Failed to delete short URL.");
    }
  }

  const hasActiveFilters = Boolean(debouncedSearch.trim() || currentStatus !== "all");

  if (error) {
    return (
      <DashboardLayout>
        <p className="text-red-600 dark:text-red-400">Something went wrong.</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Dashboard
        </h2>
      </div>

      {/* Summary Stat Cards */}
      <StatCards stats={statsData?.data} isLoading={isStatsLoading} />

      {/* Modern URL Creation Bar with Expandable Vanity Slug Drawer */}
      <CreateUrlBar />

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            My URLs
          </h3>
          {data?.pagination && data.pagination.total > 0 && (
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {data.pagination.total} total {data.pagination.total === 1 ? "link" : "links"}
            </span>
          )}
        </div>

        {/* Interactive Search, Filter & Status Toolbar */}
        <UrlToolbar
          search={searchInput}
          onSearchChange={setSearchInput}
          status={currentStatus}
          onStatusChange={handleStatusChange}
          isFetching={isFetching}
        />

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-2xl border border-slate-200/60 bg-slate-100/60 p-5 dark:border-slate-800/60 dark:bg-slate-900/40"
              />
            ))}
          </div>
        ) : data?.data.length === 0 ? (
          hasActiveFilters ? (
            /* Context-Aware Filter Empty State */
            <div className="rounded-2xl border border-dashed border-slate-300/80 bg-white/50 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/40 p-10 text-center transition-colors">
              <div className="mb-3 text-4xl">🔍</div>
              <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                No matching links found
              </h4>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {debouncedSearch
                  ? `No links matched "${debouncedSearch}"`
                  : `No links found with status "${currentStatus}"`}
              </p>
              <button
                type="button"
                onClick={handleClearFilters}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            /* First-Time User Empty State */
            <div className="rounded-2xl border border-dashed border-slate-300/80 bg-white/50 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/40 p-12 text-center transition-colors">
              <div className="mb-4 text-5xl">🔗</div>
              <h4 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                No URLs Yet
              </h4>
              <p className="mt-2 text-slate-500 dark:text-slate-400">
                Create your first short URL using the form above.
              </p>
            </div>
          )
        ) : (
          /* Paginated URL Cards List with Smooth Zero-CLS Transition */
          <div
            className={`transition-opacity duration-200 ${
              isPlaceholderData ? "opacity-60 pointer-events-none" : "opacity-100"
            }`}
          >
            <ul className="space-y-4">
              {data?.data.map((url) => {
                const displaySlug = url.customAlias || url.shortCode;
                const shortUrl = `${env.SHORT_URL_BASE}/${displaySlug}`;

                return (
                  <li
                    key={url.id}
                    className="card-hover rounded-2xl border border-slate-200/80 bg-white/85 p-5 shadow-xs backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/85 transition-colors duration-200"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <a
                          href={shortUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex items-center gap-1.5 break-all text-lg font-semibold text-blue-600 transition hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                          title="Open short link in new tab"
                        >
                          <span>
                            {env.SHORT_URL_BASE.replace(/^https?:\/\//, "")}/
                            <span className="font-bold text-slate-900 dark:text-slate-100">
                              {displaySlug}
                            </span>
                          </span>
                          <svg
                            className="h-4 w-4 shrink-0 opacity-60 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>

                        {url.customAlias && (
                          <span
                            className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-600 ring-1 ring-inset ring-blue-700/10 select-none dark:bg-blue-950/50 dark:text-blue-300 dark:ring-blue-400/20"
                            title={`Fallback system code: ${url.shortCode}`}
                          >
                            vanity alias
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingUrl(url)}
                          title="Edit short link"
                          className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                        >
                          <svg
                            className="h-3.5 w-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                          </svg>
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopy(displaySlug, url.id)}
                          className="shrink-0 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                        >
                          {copiedId === url.id ? "Copied!" : "Copy"}
                        </button>
                      </div>
                    </div>

                    <p className="mt-3 break-all text-sm text-slate-500 dark:text-slate-400">
                      {url.originalUrl}
                    </p>

                    <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-800/60">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                        <p>
                          Clicks:{" "}
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {url.clicks}
                          </span>
                        </p>
                        {Boolean(url.createdAt) && (
                          <>
                            <span className="text-slate-300 dark:text-slate-700">·</span>
                            <span
                              className="inline-flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500"
                              title={`Created: ${new Date(url.createdAt).toLocaleString()}`}
                            >
                              <svg
                                className="h-3.5 w-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              <span>
                                {new Date(url.createdAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}{" "}
                                at{" "}
                                {new Date(url.createdAt).toLocaleTimeString("en-US", {
                                  hour: "numeric",
                                  minute: "2-digit",
                                  hour12: true,
                                })}
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
                        {deletingId === url.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* Pagination Controls */}
            {data?.pagination && (
              <PaginationControls
                currentPage={data.pagination.page}
                totalPages={data.pagination.totalPages}
                totalItems={data.pagination.total}
                limit={data.pagination.limit}
                onPageChange={handlePageChange}
                isPlaceholderData={isPlaceholderData}
              />
            )}
          </div>
        )}
      </section>

      {/* Edit URL Modal */}
      <EditUrlModal
        url={editingUrl}
        isOpen={Boolean(editingUrl)}
        onClose={() => setEditingUrl(null)}
      />
    </DashboardLayout>
  );
}
