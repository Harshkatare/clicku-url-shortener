import { env } from "../../config/env";

export const QR_RESOLUTIONS = [512, 1024, 2048] as const;
export type QrResolution = (typeof QR_RESOLUTIONS)[number];
export const DEFAULT_QR_RESOLUTION: QrResolution = 1024;

export const DEFAULT_QR_FG_COLOR = "#0f172a";
export const DEFAULT_QR_BG_COLOR = "#ffffff";

/**
 * Shortlynk logo as an inline SVG data URI.
 * Self-contained so exports (SVG/PNG) render offline without missing asset errors or canvas CORS taint.
 */
export const SHORTLYNK_LOGO_DATA_URI =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><defs><linearGradient id="slg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3b82f6"/><stop offset="1" stop-color="#8b5cf6"/></linearGradient></defs><g fill="none" stroke="url(#slg)" stroke-width="8" transform="rotate(15 32 32)"><ellipse cx="25" cy="32" rx="11.5" ry="16" transform="rotate(-30 25 32)"/><ellipse cx="39" cy="32" rx="11.5" ry="16" transform="rotate(30 39 32)"/></g></svg>`
  );

/**
 * Builds the canonical short URL for a slug.
 * All QR codes strictly encode this destination to preserve 302 click tracking.
 */
export function getShortUrlForSlug(slug: string): string {
  const cleanBase = (env.SHORT_URL_BASE || "https://shortlynk.in").replace(/\/+$/, "");
  const cleanSlug = slug.trim().replace(/^\/+/, "");
  return `${cleanBase}/${cleanSlug}`;
}

/**
 * Extracts the slug if user inputs a full URL or partial domain.
 */
export function extractSlug(input: string): string {
  const trimmed = input.trim();
  const withoutProtocol = trimmed.replace(/^https?:\/\//i, "");
  const cleanBaseHost = (env.SHORT_URL_BASE || "shortlynk.in")
    .replace(/^https?:\/\//i, "")
    .replace(/\/+$/, "");

  if (withoutProtocol.toLowerCase().startsWith(cleanBaseHost.toLowerCase())) {
    return withoutProtocol.slice(cleanBaseHost.length).replace(/^\/+/, "");
  }

  return trimmed.replace(/^\/+/, "");
}

/**
 * Serializes and triggers download of an SVG element.
 */
export function downloadSvg(svgElement: SVGSVGElement, filename: string): void {
  const cleanFilename = filename.toLowerCase().endsWith(".svg") ? filename : `${filename}.svg`;
  const serializer = new XMLSerializer();
  let source = serializer.serializeToString(svgElement);

  if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
    source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  if (!source.match(/^<svg[^>]+xmlns:xlink="http:\/\/www\.w3\.org\/1999\/xlink"/)) {
    source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
  }

  const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = cleanFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports canvas element to a PNG download, with optional offscreen nearest-neighbor scaling.
 */
export async function downloadPng(
  canvasElement: HTMLCanvasElement,
  filename: string,
  size?: number
): Promise<void> {
  const cleanFilename = filename.toLowerCase().endsWith(".png") ? filename : `${filename}.png`;
  let exportCanvas: HTMLCanvasElement = canvasElement;

  if (size && (canvasElement.width !== size || canvasElement.height !== size)) {
    const scaledCanvas = document.createElement("canvas");
    scaledCanvas.width = size;
    scaledCanvas.height = size;
    const ctx = scaledCanvas.getContext("2d");
    if (ctx) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(canvasElement, 0, 0, size, size);
      exportCanvas = scaledCanvas;
    }
  }

  return new Promise<void>((resolve, reject) => {
    exportCanvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Failed to generate PNG blob from canvas."));
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = cleanFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      resolve();
    }, "image/png");
  });
}

/**
 * Copies a canvas element image directly to the system clipboard.
 */
export async function copyCanvasToClipboard(
  canvasElement: HTMLCanvasElement
): Promise<void> {
  if (!navigator.clipboard || typeof navigator.clipboard.write !== "function") {
    throw new Error("Clipboard image copy is not supported in this browser.");
  }
  if (typeof ClipboardItem === "undefined") {
    throw new Error("ClipboardItem is not supported in this browser.");
  }

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvasElement.toBlob((b) => {
      if (b) {
        resolve(b);
      } else {
        reject(new Error("Failed to generate image blob from canvas."));
      }
    }, "image/png");
  });

  await navigator.clipboard.write([
    new ClipboardItem({
      [blob.type]: blob,
    }),
  ]);
}
