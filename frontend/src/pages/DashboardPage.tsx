import { useState, useEffect, useRef, useCallback } from "react";
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

import { useToastContext } from "../context/ToastContext";
import { StatCards } from "../components/dashboard/StatCards";
import { CreateUrlBar } from "../components/dashboard/CreateUrlBar";
import { UrlToolbar } from "../components/dashboard/UrlToolbar";
import { PaginationControls } from "../components/dashboard/PaginationControls";
import { EditUrlModal } from "../components/dashboard/EditUrlModal";
import { UrlCard } from "../components/dashboard/UrlCard";
import { useDebounce } from "../hooks/useDebounce";

export function DashboardPage() {
  const { showToast, removeToast } = useToastContext();
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

  const [editingUrl, setEditingUrl] = useState<Url | null>(null);

  // Latency-Safe 5-Second Deletion Manager
  const [pendingDeletionIds, setPendingDeletionIds] = useState<Set<string>>(new Set());
  const pendingDeletionsRef = useRef<
    Map<string, { timeoutId: ReturnType<typeof setTimeout>; toastId: number }>
  >(new Map());
  const isMountedRef = useRef(true);
  const removeToastRef = useRef(removeToast);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    removeToastRef.current = removeToast;
  }, [removeToast]);

  const deleteUrlMutation = useMutation({
    mutationFn: deleteUrl,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["urls"],
      });
      queryClient.invalidateQueries({
        queryKey: ["urls", "stats"],
      });
    },
  });

  const handleDeleteRequest = useCallback(
    (url: Url) => {
      const displaySlug = url.customAlias || url.shortCode;

      // Clear any prior pending deletion for this ID if re-triggered
      const existing = pendingDeletionsRef.current.get(url.id);
      if (existing) {
        clearTimeout(existing.timeoutId);
        removeToast(existing.toastId);
      }

      // 1. Optimistically hide card from UI
      setPendingDeletionIds((prev) => new Set(prev).add(url.id));

      // 2. Define Undo callback
      const onUndo = () => {
        const entry = pendingDeletionsRef.current.get(url.id);
        if (!entry) return;
        clearTimeout(entry.timeoutId);
        pendingDeletionsRef.current.delete(url.id);
        setPendingDeletionIds((prev) => {
          const next = new Set(prev);
          next.delete(url.id);
          return next;
        });
        showToast("success", `Restored "${displaySlug}".`);
      };

      // 3. Schedule commit deletion after 5000ms
      const timeoutId = setTimeout(async () => {
        pendingDeletionsRef.current.delete(url.id);
        try {
          await deleteUrlMutation.mutateAsync(url.id);
        } catch {
          if (isMountedRef.current) {
            showToast("error", `Failed to delete "${displaySlug}".`);
          }
        } finally {
          if (isMountedRef.current) {
            setPendingDeletionIds((prev) => {
              const next = new Set(prev);
              next.delete(url.id);
              return next;
            });
          }
        }
      }, 5000);

      // 4. Dispatch 5-second undo toast & register entry in ref map
      const toastId = showToast("info", `Deleted "${displaySlug}".`, onUndo, 5000);
      pendingDeletionsRef.current.set(url.id, { timeoutId, toastId });
    },
    [deleteUrlMutation, showToast, removeToast]
  );

  // Unmount Flush Effect: cancel timeouts, dismiss floating toasts, and flush deletions immediately
  useEffect(() => {
    const pendingDeletions = pendingDeletionsRef.current;
    return () => {
      pendingDeletions.forEach(({ timeoutId, toastId }, id) => {
        clearTimeout(timeoutId);
        removeToastRef.current(toastId);
        deleteUrl(id).catch(console.error);
      });
      pendingDeletions.clear();
    };
  }, []);

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

  const handlePageChange = useCallback(
    (newPage: number) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (newPage > 1) {
          next.set("page", String(newPage));
        } else {
          next.delete("page");
        }
        return next;
      });
    },
    [setSearchParams]
  );

  // Multi-Condition Pagination Fallback Effect
  useEffect(() => {
    if (!isPlaceholderData && data?.pagination && currentPage > 1) {
      if (data.pagination.total === 0) {
        handlePageChange(1);
      } else if (
        data.pagination.totalPages > 0 &&
        currentPage > data.pagination.totalPages
      ) {
        handlePageChange(data.pagination.totalPages);
      }
    }
  }, [isPlaceholderData, data?.pagination, currentPage, handlePageChange]);

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

  const hasActiveFilters = Boolean(debouncedSearch.trim() || currentStatus !== "all");

  // Visible URLs filtered against pending deletion buffer
  const visibleUrls = data?.data.filter((u) => !pendingDeletionIds.has(u.id)) ?? [];

  // Inhibit empty state flash if an item is currently in the 5-second pending deletion window
  const showEmptyState =
    !isLoading &&
    visibleUrls.length === 0 &&
    pendingDeletionIds.size === 0;

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
        ) : showEmptyState ? (
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
              {visibleUrls.map((url) => (
                <UrlCard
                  key={url.id}
                  url={url}
                  onEdit={setEditingUrl}
                  onDelete={handleDeleteRequest}
                  onQrClick={(u) =>
                    showToast(
                      "info",
                      `QR Studio for "${u.customAlias || u.shortCode}" coming in v0.7.0`
                    )
                  }
                />
              ))}
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
