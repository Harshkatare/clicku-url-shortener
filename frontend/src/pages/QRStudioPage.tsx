import { useState, useRef, useMemo, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";

import { DashboardLayout } from "../layouts/DashboardLayout";
import { getUrls } from "../features/urls/urls.api";
import { RESERVED_SLUGS } from "../features/urls/urls.schemas";
import {
  QR_RESOLUTIONS,
  DEFAULT_QR_RESOLUTION,
  DEFAULT_QR_FG_COLOR,
  DEFAULT_QR_BG_COLOR,
  SHORTLYNK_LOGO_DATA_URI,
  getShortUrlForSlug,
  extractSlug,
  downloadPng,
  downloadSvg,
  copyCanvasToClipboard,
  shareQrImage,
  canShareQr,
  type QrResolution,
} from "../features/qr/qr.utils";
import { useToastContext } from "../context/ToastContext";
import { copyToClipboard } from "../utils/copy";

const FG_PRESETS = [
  { label: "Navy", value: "#0f172a" },
  { label: "Blue", value: "#2563eb" },
  { label: "Purple", value: "#7c3aed" },
  { label: "Emerald", value: "#059669" },
  { label: "Rose", value: "#e11d48" },
];

const BG_PRESETS = [
  { label: "White", value: "#ffffff" },
  { label: "Slate", value: "#f8fafc" },
  { label: "Cream", value: "#fefce8" },
  { label: "Ice", value: "#f0f9ff" },
  { label: "Mint", value: "#f0fdf4" },
];

function validateSlug(slug: string): string | null {
  const trimmed = slug.trim();
  if (!trimmed) {
    return "Please enter a short link slug";
  }
  if (trimmed.length < 3) {
    return "Slug must be at least 3 characters";
  }
  if (trimmed.length > 50) {
    return "Slug cannot exceed 50 characters";
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return "Slug can only contain letters, numbers, hyphens, and underscores";
  }
  if (RESERVED_SLUGS.has(trimmed.toLowerCase())) {
    return "This slug is reserved for system routes";
  }
  return null;
}

function getHexLuminance(hex: string): number {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return 0;
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

export function QRStudioPage() {
  const { showToast } = useToastContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSlug = searchParams.get("slug") || "";

  // Active links list
  const {
    data: urlsData,
    isLoading: isLoadingUrls,
    isError: isErrorUrls,
    refetch: refetchUrls,
  } = useQuery({
    queryKey: ["urls", "studio-selector"],
    queryFn: () => getUrls({ limit: 50, status: "active" }),
    staleTime: 30_000,
  });
  const activeUrls = urlsData?.data ?? [];

  // Studio configuration state
  const [mode, setMode] = useState<"link" | "manual">(
    initialSlug ? "manual" : "link"
  );
  const [selectedSlug, setSelectedSlug] = useState<string>("");
  const [manualInput, setManualInput] = useState<string>(initialSlug);
  const [fgColor, setFgColor] = useState<string>(DEFAULT_QR_FG_COLOR);
  const [bgColor, setBgColor] = useState<string>(DEFAULT_QR_BG_COLOR);
  const [includeLogo, setIncludeLogo] = useState<boolean>(true);
  const [resolution, setResolution] = useState<QrResolution>(DEFAULT_QR_RESOLUTION);
  const [isCopiedLink, setIsCopiedLink] = useState(false);
  const [isCopiedImage, setIsCopiedImage] = useState(false);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sync initial slug with active links if available
  useEffect(() => {
    if (activeUrls.length > 0 && !selectedSlug) {
      if (initialSlug) {
        const found = activeUrls.find(
          (u) => (u.customAlias || u.shortCode) === initialSlug
        );
        if (found) {
          setSelectedSlug(initialSlug);
          setMode("link");
        } else {
          setManualInput(initialSlug);
          setMode("manual");
        }
      } else {
        const firstSlug = activeUrls[0].customAlias || activeUrls[0].shortCode;
        setSelectedSlug(firstSlug);
      }
    }
  }, [activeUrls, initialSlug, selectedSlug]);

  // Determine active slug and validation
  const effectiveSlug = useMemo(() => {
    if (mode === "link") {
      return selectedSlug;
    }
    return extractSlug(manualInput);
  }, [mode, selectedSlug, manualInput]);

  const slugError = useMemo(() => {
    if (mode === "manual") {
      return validateSlug(effectiveSlug);
    }
    return null;
  }, [mode, effectiveSlug]);

  const isUnmatchedSlug = useMemo(() => {
    if (mode !== "manual" || !effectiveSlug || slugError) return false;
    return !activeUrls.some(
      (u) =>
        (u.customAlias || u.shortCode).toLowerCase() ===
        effectiveSlug.toLowerCase()
    );
  }, [mode, effectiveSlug, slugError, activeUrls]);

  const autocompleteSuggestions = useMemo(() => {
    if (mode !== "manual") return [];
    const query = extractSlug(manualInput).trim().toLowerCase();
    if (!query) return [];

    const hasExactMatch = activeUrls.some(
      (u) => (u.customAlias || u.shortCode).toLowerCase() === query
    );
    if (hasExactMatch) return [];

    return activeUrls
      .filter((u) => {
        const slug = (u.customAlias || u.shortCode).toLowerCase();
        return slug.includes(query) && slug !== query;
      })
      .slice(0, 6);
  }, [mode, manualInput, activeUrls]);

  const selectedUrlObj = useMemo(() => {
    if (mode === "link" && selectedSlug) {
      return (
        activeUrls.find(
          (u) => (u.customAlias || u.shortCode) === selectedSlug
        ) ?? null
      );
    }
    return null;
  }, [mode, selectedSlug, activeUrls]);

  const shortUrl = useMemo(() => {
    return effectiveSlug ? getShortUrlForSlug(effectiveSlug) : "";
  }, [effectiveSlug]);

  const isLowContrast = useMemo(() => {
    return Math.abs(getHexLuminance(fgColor) - getHexLuminance(bgColor)) < 0.3;
  }, [fgColor, bgColor]);

  // Sync URL query param when slug changes
  const updateSlugParam = (newSlug: string) => {
    if (newSlug) {
      setSearchParams({ slug: newSlug }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  const handleDownloadPng = async () => {
    if (!canvasRef.current || !effectiveSlug || slugError) return;
    try {
      await downloadPng(
        canvasRef.current,
        `shortlynk-qr-${effectiveSlug}-${resolution}px.png`,
        resolution
      );
      showToast("success", `PNG (${resolution}px) downloaded`);
    } catch {
      showToast("error", "Failed to download PNG QR code");
    }
  };

  const handleDownloadSvg = () => {
    if (!svgRef.current || !effectiveSlug || slugError) return;
    try {
      downloadSvg(svgRef.current, `shortlynk-qr-${effectiveSlug}.svg`);
      showToast("success", "SVG vector QR code downloaded");
    } catch {
      showToast("error", "Failed to download SVG QR code");
    }
  };

  const handleCopyImage = async () => {
    if (!canvasRef.current || !effectiveSlug || slugError) return;
    try {
      await copyCanvasToClipboard(canvasRef.current);
      setIsCopiedImage(true);
      setTimeout(() => setIsCopiedImage(false), 2000);
      showToast("success", "QR code image copied to clipboard");
    } catch {
      showToast("error", "Failed to copy QR code image");
    }
  };

  const handleCopyShortUrl = async () => {
    if (!shortUrl) return;
    const ok = await copyToClipboard(shortUrl);
    if (ok) {
      setIsCopiedLink(true);
      setTimeout(() => setIsCopiedLink(false), 2000);
      showToast("success", "Short link copied to clipboard");
    }
  };

  const isShareSupported = canShareQr();

  const handleShare = async () => {
    if (!canvasRef.current || !effectiveSlug || slugError) return;
    try {
      await shareQrImage(
        canvasRef.current,
        `shortlynk-qr-${effectiveSlug}.png`
      );
      showToast("success", "QR code shared");
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }
      showToast("error", "Failed to share QR code");
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              QR Code Studio
            </h1>
            <p className="mt-1 min-w-0 text-sm text-slate-500 dark:text-slate-400">
              Customize, preview, and download print-ready QR codes for any short link.
            </p>
          </div>
          <Link
            to="/dashboard"
            className="inline-flex shrink-0 items-center text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Studio Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Controls Column (7 cols) */}
          <div className="min-w-0 space-y-6 lg:col-span-7">
            {/* Link Selector Card */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                1. Select Destination Link
              </h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Choose one of your existing short links or input a manual alias.
              </p>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setMode("link")}
                  className={`flex-1 rounded-xl py-2 px-3 text-xs font-medium transition cursor-pointer ${
                    mode === "link"
                      ? "bg-blue-600 text-white shadow-2xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  }`}
                >
                  My Active Links ({activeUrls.length})
                </button>
                <button
                  type="button"
                  onClick={() => setMode("manual")}
                  className={`flex-1 rounded-xl py-2 px-3 text-xs font-medium transition cursor-pointer ${
                    mode === "manual"
                      ? "bg-blue-600 text-white shadow-2xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  }`}
                >
                  Manual Slug Entry
                </button>
              </div>

              {mode === "link" ? (
                <div className="mt-4 min-w-0 max-w-full">
                  {isLoadingUrls ? (
                    <div className="h-10 rounded-xl bg-slate-100 animate-pulse dark:bg-slate-800" />
                  ) : isErrorUrls ? (
                    <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
                      <span>Failed to load active links.</span>
                      <button
                        type="button"
                        onClick={() => refetchUrls()}
                        className="rounded-lg border border-red-200 bg-white px-2.5 py-1 font-medium text-red-700 hover:bg-red-50 dark:border-red-800 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900 cursor-pointer"
                      >
                        Retry
                      </button>
                    </div>
                  ) : activeUrls.length > 0 ? (
                    <select
                      value={selectedSlug}
                      onChange={(e) => {
                        setSelectedSlug(e.target.value);
                        updateSlugParam(e.target.value);
                      }}
                      className="w-full max-w-full min-w-0 truncate rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-2xs transition focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white cursor-pointer"
                    >
                      {activeUrls.map((url) => {
                        const slug = url.customAlias || url.shortCode;
                        const displayUrl =
                          url.originalUrl.length > 40
                            ? `${url.originalUrl.slice(0, 40)}…`
                            : url.originalUrl;
                        return (
                          <option key={url.id} value={slug}>
                            {slug} — {displayUrl}
                          </option>
                        );
                      })}
                    </select>
                  ) : (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      No active links found. Switch to manual slug entry or create one in your dashboard.
                    </p>
                  )}
                </div>
              ) : (
                <div className="mt-4">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Slug or Short Link
                  </label>
                  <div className="flex rounded-xl border border-slate-300 bg-white shadow-2xs focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 dark:border-slate-700 dark:bg-slate-800">
                    <span className="inline-flex shrink-0 items-center px-3 text-xs text-slate-400 border-r border-slate-200 dark:border-slate-700 select-none">
                      shortlynk.in/
                    </span>
                    <input
                      type="text"
                      value={manualInput}
                      onChange={(e) => {
                        setManualInput(e.target.value);
                        const clean = extractSlug(e.target.value);
                        updateSlugParam(clean);
                      }}
                      placeholder="custom-slug"
                      className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden dark:text-white"
                    />
                  </div>
                  {slugError ? (
                    <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                      {slugError}
                    </p>
                  ) : isUnmatchedSlug ? (
                    <p className="mt-1.5 text-xs text-amber-700 dark:text-amber-400">
                      No active link uses this slug — scans will lead to a not-found page.
                    </p>
                  ) : null}

                  {autocompleteSuggestions.length > 0 && (
                    <div className="mt-2.5 rounded-xl border border-slate-200 bg-white p-1 shadow-2xs dark:border-slate-800 dark:bg-slate-950">
                      <span className="block px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Suggestions from active links
                      </span>
                      <div className="space-y-0.5">
                        {autocompleteSuggestions.map((u) => {
                          const slug = u.customAlias || u.shortCode;
                          return (
                            <button
                              key={u.id}
                              type="button"
                              onClick={() => {
                                setManualInput(slug);
                                updateSlugParam(slug);
                              }}
                              className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-left text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                              <span className="shrink-0 font-mono font-medium text-blue-600 dark:text-blue-400">
                                {slug}
                              </span>
                              <span className="min-w-0 truncate ml-2 text-slate-400">
                                {u.originalUrl}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Visual Customization Card */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-5">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                2. Styling & Appearance
              </h2>

              {/* Foreground Color */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Pattern Color (Foreground)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="h-9 w-9 shrink-0 rounded-lg border border-slate-200 cursor-pointer dark:border-slate-700 bg-transparent"
                  />
                  <input
                    type="text"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-20 sm:w-24 shrink-0 rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-mono text-slate-900 uppercase dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <div className="flex flex-wrap gap-1.5 min-w-0 flex-1">
                    {FG_PRESETS.map((p) => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => setFgColor(p.value)}
                        title={p.label}
                        className="h-6 w-6 rounded-md border border-slate-300 shadow-2xs transition hover:scale-110 cursor-pointer dark:border-slate-600"
                        style={{ backgroundColor: p.value }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Background Color */}
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Background Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="h-9 w-9 shrink-0 rounded-lg border border-slate-200 cursor-pointer dark:border-slate-700 bg-transparent"
                  />
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-20 sm:w-24 shrink-0 rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-mono text-slate-900 uppercase dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <div className="flex flex-wrap gap-1.5 min-w-0 flex-1">
                    {BG_PRESETS.map((p) => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => setBgColor(p.value)}
                        title={p.label}
                        className="h-6 w-6 rounded-md border border-slate-300 shadow-2xs transition hover:scale-110 cursor-pointer dark:border-slate-600"
                        style={{ backgroundColor: p.value }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {isLowContrast && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
                  ⚠️ Low contrast between foreground and background may prevent cameras from scanning the QR code.
                </div>
              )}

              {/* Center Logo Toggle */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    Center Logo Watermark
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Embeds the Shortlynk icon in center with excavated modules
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={includeLogo}
                  onChange={(e) => setIncludeLogo(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </div>

              {/* Resolution Selector */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Export Resolution (PNG)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {QR_RESOLUTIONS.map((res) => (
                    <button
                      key={res}
                      type="button"
                      onClick={() => setResolution(res)}
                      className={`rounded-xl py-2 px-3 text-xs font-medium transition cursor-pointer ${
                        resolution === res
                          ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs"
                          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                      }`}
                    >
                      {res} px {res === 1024 ? "(Std)" : ""}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Live Preview & Actions Column (5 cols) */}
          <div className="min-w-0 lg:col-span-5">
            <div className="sticky top-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Live Preview
              </h2>
              <p className="mt-1 min-w-0 truncate text-xs text-slate-500 dark:text-slate-400">
                Generated strictly for <span className="font-mono">{shortUrl || "shortlynk.in/..."}</span>
              </p>

              {/* Render Container */}
              <div className="my-6 flex flex-col items-center justify-center rounded-2xl border border-slate-200/70 p-6 shadow-inner" style={{ backgroundColor: bgColor }}>
                {effectiveSlug && !slugError ? (
                  <>
                    <QRCodeSVG
                      ref={svgRef}
                      value={shortUrl}
                      size={220}
                      className="h-auto max-w-full"
                      level="H"
                      bgColor={bgColor}
                      fgColor={fgColor}
                      imageSettings={
                        includeLogo
                          ? {
                              src: SHORTLYNK_LOGO_DATA_URI,
                              height: 44,
                              width: 44,
                              excavate: true,
                            }
                          : undefined
                      }
                    />

                    {/* Hidden canvas for PNG export & clipboard */}
                    <div className="hidden" aria-hidden="true">
                      <QRCodeCanvas
                        ref={canvasRef}
                        value={shortUrl}
                        size={resolution}
                        level="H"
                        bgColor={bgColor}
                        fgColor={fgColor}
                        imageSettings={
                          includeLogo
                            ? {
                                src: SHORTLYNK_LOGO_DATA_URI,
                                height: Math.round(resolution * 0.2),
                                width: Math.round(resolution * 0.2),
                                excavate: true,
                              }
                            : undefined
                        }
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex h-52 w-52 items-center justify-center text-center p-4 text-xs text-slate-400">
                    {slugError || "Enter a slug to preview QR code"}
                  </div>
                )}
              </div>

              {/* Destination metadata */}
              {selectedUrlObj && (
                <p className="mb-4 min-w-0 truncate text-center text-xs text-slate-500 dark:text-slate-400">
                  Target: <span className="font-mono text-slate-700 dark:text-slate-300">{selectedUrlObj.originalUrl}</span>
                </p>
              )}

              {/* Link copy pill */}
              <div className="mb-5 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-800 dark:bg-slate-950">
                <span className="min-w-0 truncate font-mono text-slate-700 dark:text-slate-300">
                  {shortUrl || "—"}
                </span>
                <button
                  type="button"
                  onClick={handleCopyShortUrl}
                  disabled={!shortUrl || Boolean(slugError)}
                  className="ml-2 shrink-0 font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50 cursor-pointer"
                >
                  {isCopiedLink ? "Copied" : "Copy"}
                </button>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleDownloadPng}
                  disabled={!effectiveSlug || Boolean(slugError)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 px-4 text-xs sm:text-sm font-medium text-white shadow-2xs transition hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download PNG ({resolution}px)
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadSvg}
                    disabled={!effectiveSlug || Boolean(slugError)}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-medium text-slate-700 shadow-2xs transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 cursor-pointer"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    Download SVG
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyImage}
                    disabled={!effectiveSlug || Boolean(slugError)}
                    className={`flex items-center justify-center gap-1.5 rounded-xl border py-2 px-3 text-xs font-medium shadow-2xs transition disabled:opacity-50 cursor-pointer ${
                      isCopiedImage
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {isCopiedImage ? (
                      <>
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Copied
                      </>
                    ) : (
                      <>
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy Image
                      </>
                    )}
                  </button>
                </div>

                {isShareSupported && (
                  <button
                    type="button"
                    onClick={handleShare}
                    disabled={!effectiveSlug || Boolean(slugError)}
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-medium text-slate-700 shadow-2xs transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 cursor-pointer"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Share QR Code
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
