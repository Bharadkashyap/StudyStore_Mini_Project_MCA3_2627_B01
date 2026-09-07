const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000/api")
  .replace(/\/$/, "")
  .replace(/\/api$/, "");

export function getProductImage(image) {
  if (!image) return "/images/notebook.png";

  const value = String(image).trim();

  if (
    value.startsWith("data:image/") ||
    value.startsWith("blob:") ||
    value.startsWith("http://") ||
    value.startsWith("https://")
  ) {
    return value;
  }

  const cleanPath = value.replaceAll("\\", "/").replace(/^\/+/, "");
  return `${API_BASE}/${cleanPath}`;
}

export function useFallbackImage(event) {
  event.currentTarget.onerror = null;
  event.currentTarget.src = "/images/notebook.png";
}
