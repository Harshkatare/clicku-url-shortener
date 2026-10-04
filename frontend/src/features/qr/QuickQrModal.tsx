import { useEffect, useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";

import type { Url } from "../urls/urls.types";
import {
  getShortUrlForSlug,
  downloadPng,
  downloadSvg,
  copyCanvasToClipboard,
  shareQrImage,
  canShareQr,
  SHORTLYNK_LOGO_DATA_URI,
} from "./qr.utils";
import { useToastContext } from "../../context/ToastContext";

export interface QuickQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: Url | null;
}

export function QuickQrModal({ isOpen, onClose, url }: QuickQrModalProps) {
  const { showToast } = useToastContext();
  const [isCopied, setIsCopied] = useState(false);
  const isBackdropMouseDown = useRef(false);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
      setIsCopied(false);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !url || typeof document === "undefined") return null;

  const displaySlug = url.customAlias || url.shortCode;
  const shortUrl = getShortUrlForSlug(displaySlug);

  const handleDownloadPng = async () => {
    if (!canvasRef.current) return;
    try {
      await downloadPng(canvasRef.current, `shortlynk-qr-${displaySlug}.png`);
      showToast("success", "PNG QR code downloaded");
    } catch {
      showToast("error", "Failed to download PNG QR code");
    }
  };

  const handleDownloadSvg = () => {
    if (!svgRef.current) return;
    try {
      downloadSvg(svgRef.current, `shortlynk-qr-${displaySlug}.svg`);
      showToast("success", "SVG QR code downloaded");
    } catch {
      showToast("error", "Failed to download SVG QR code");
    }
  };

  const handleCopyImage = async () => {
    if (!canvasRef.current) return;
    try {
      await copyCanvasToClipboard(canvasRef.current);
      setIsCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setIsCopied(false), 2000);
      showToast("success", "QR code copied to clipboard");
    } catch {
      showToast("error", "Failed to copy QR code to clipboard");
    }
  };

  const isShareSupported = canShareQr();

  const handleShare = async () => {
    if (!canvasRef.current) return;
    try {
      await shareQrImage(canvasRef.current, `shortlynk-qr-${displaySlug}.png`);
      showToast("success", "QR code shared");
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }
      showToast("error", "Failed to share QR code");
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs transition-opacity"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          isBackdropMouseDown.current = true;
        }
      }}
      onMouseUp={(e) => {
        if (e.target === e.currentTarget && isBackdropMouseDown.current) {
          onClose();
        }
        isBackdropMouseDown.current = false;
      }}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xl transition-all dark:border-slate-800 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="min-w-0 pr-3">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              QR Code
            </h3>
            <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
              {shortUrl}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* QR Code Container (Always crisp white background for scanning contrast) */}
        <div className="my-5 flex flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
          <QRCodeSVG
            ref={svgRef}
            value={shortUrl}
            size={180}
            level="H"
            bgColor="#ffffff"
            fgColor="#0f172a"
            imageSettings={{
              src: SHORTLYNK_LOGO_DATA_URI,
              height: 36,
              width: 36,
              excavate: true,
            }}
          />

          {/* Offscreen high-resolution 1024px canvas for exports */}
          <div className="hidden" aria-hidden="true">
            <QRCodeCanvas
              ref={canvasRef}
              value={shortUrl}
              size={1024}
              level="H"
              bgColor="#ffffff"
              fgColor="#0f172a"
              imageSettings={{
                src: SHORTLYNK_LOGO_DATA_URI,
                height: 204,
                width: 204,
                excavate: true,
              }}
            />
          </div>
        </div>

        {/* Target destination hint */}
        <p className="mb-4 truncate text-center text-xs text-slate-500 dark:text-slate-400">
          Redirects to{" "}
          <span className="font-mono text-slate-700 dark:text-slate-300">
            {url.originalUrl}
          </span>
        </p>

        {/* Action Buttons */}
        <div className={`grid gap-2 ${isShareSupported ? "grid-cols-4" : "grid-cols-3"}`}>
          <button
            type="button"
            onClick={handleDownloadPng}
            className="flex items-center justify-center gap-1 rounded-xl bg-blue-600 px-2 sm:px-3 py-2 text-xs font-medium text-white shadow-2xs transition hover:bg-blue-700 cursor-pointer"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            PNG
          </button>
          <button
            type="button"
            onClick={handleDownloadSvg}
            className="flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-2 sm:px-3 py-2 text-xs font-medium text-slate-700 shadow-2xs transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            SVG
          </button>
          <button
            type="button"
            onClick={handleCopyImage}
            className={`flex items-center justify-center gap-1 rounded-xl border px-2 sm:px-3 py-2 text-xs font-medium shadow-2xs transition cursor-pointer ${
              isCopied
                ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            {isCopied ? (
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
                Copy
              </>
            )}
          </button>
          {isShareSupported && (
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-2 sm:px-3 py-2 text-xs font-medium text-slate-700 shadow-2xs transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </button>
          )}
        </div>

        {/* Link to full studio */}
        <div className="mt-4 pt-3 border-t border-slate-100 text-center dark:border-slate-800">
          <Link
            to={`/qr-studio?slug=${encodeURIComponent(displaySlug)}`}
            onClick={onClose}
            className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition"
          >
            Open in QR Studio →
          </Link>
        </div>
      </div>
    </div>,
    document.body
  );
}
