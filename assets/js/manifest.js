import { MANIFEST_URL } from "./constants.js";

const DEFAULT_FORMATS = ["webm", "mp3"];

function toNumber(value, fallback = null) {
  if (value === null || value === undefined) {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function sanitizeFile(entry) {
  if (!entry || typeof entry !== "object") {
    return null;
  }
  const id = typeof entry.id === "string" ? entry.id.trim() : "";
  const src = typeof entry.src === "string" ? entry.src.trim() : "";
  if (!id || !src) {
    return null;
  }
  const display =
    typeof entry.display === "string" && entry.display.trim()
      ? entry.display.trim()
      : null;
  
  // Preserve color data if present
  let color = null;
  if (entry.color && typeof entry.color === "object" && entry.color.hue != null) {
    const hue = toNumber(entry.color.hue, null);
    if (hue !== null && Number.isFinite(hue)) {
      color = {
        hue,
        saturation: toNumber(entry.color.saturation, 85),
        lightness: toNumber(entry.color.lightness, 50),
        bgAngle: toNumber(entry.color.bgAngle, null),
        radial1Pos: typeof entry.color.radial1Pos === "string" ? entry.color.radial1Pos : null,
        radial2Pos: typeof entry.color.radial2Pos === "string" ? entry.color.radial2Pos : null,
      };
    }
  }
  
  // Preserve emoji if present
  const emoji = typeof entry.emoji === "string" && entry.emoji.trim()
    ? entry.emoji.trim()
    : null;
  
  return {
    id,
    src,
    display,
    category:
      typeof entry.category === "string" && entry.category.trim()
        ? entry.category.trim()
        : "misc",
    gain: toNumber(entry.gain, 0),
    durationHintMs: toNumber(entry.durationHintMs, null),
    etag:
      typeof entry.etag === "string" && entry.etag.trim()
        ? entry.etag.trim()
        : null,
    color,
    emoji,
  };
}

function normalizeManifest(raw) {
  if (!raw || typeof raw !== "object") {
    throw new Error("Manifest payload is not an object.");
  }

  const version = Number.isInteger(raw.version) ? raw.version : 1;
  const ttlHours = toNumber(raw.ttlHours, 3);
  const ttlMs =
    ttlHours && ttlHours > 0 ? Math.round(ttlHours * 60 * 60 * 1000) : null;

  const formats = Array.isArray(raw.formats) && raw.formats.length
    ? raw.formats.filter((fmt) => typeof fmt === "string" && fmt.trim())
    : DEFAULT_FORMATS;

  const normalization =
    raw.normalization && typeof raw.normalization === "object"
      ? {
          targetLufs: toNumber(raw.normalization.targetLufs, -14),
          peakDbtp: toNumber(raw.normalization.peakDbtp, -1),
        }
      : { targetLufs: -14, peakDbtp: -1 };

  const manifestEtag =
    typeof raw.manifestEtag === "string" && raw.manifestEtag.trim()
      ? raw.manifestEtag.trim()
      : null;

  const seenIds = new Set();
  const files = Array.isArray(raw.files)
    ? raw.files
        .map(sanitizeFile)
        .filter((entry) => {
          if (!entry) {
            return false;
          }
          if (seenIds.has(entry.id)) {
            console.warn("manifest: duplicate id skipped", entry.id);
            return false;
          }
          seenIds.add(entry.id);
          return true;
        })
    : [];

  if (!files.length) {
    throw new Error("Manifest does not include any playable files.");
  }

  const basePath =
    typeof raw.basePath === "string" && raw.basePath.trim()
      ? raw.basePath.trim()
      : null;

  return {
    version,
    ttlHours,
    ttlMs,
    formats,
    normalization,
    manifestEtag,
    basePath,
    files,
  };
}

export async function loadManifest(url = MANIFEST_URL) {
  try {
    // Add cache busting to ensure fresh manifest
    const separator = url.includes("?") ? "&" : "?";
    const cacheBustUrl = `${url}${separator}_=${Date.now()}`;
    const response = await fetch(cacheBustUrl, { cache: "no-cache" });
    if (!response.ok) {
      throw new Error(`Manifest request failed (${response.status})`);
    }
    const json = await response.json();
    const manifest = normalizeManifest(json);
    return { manifest, error: null };
  } catch (error) {
    console.error("manifest: failed to load", error);
    return { manifest: null, error };
  }
}
