export function formatDateTime(value: string | null | undefined) {
  if (!value) return "Chưa có dữ liệu";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "0";
  }
  return new Intl.NumberFormat("vi-VN").format(value);
}

export function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "0%";
  }
  return `${new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 2,
  }).format(value)}%`;
}

export function formatNullableText(value: string | null | undefined) {
  return value && value.trim() ? value : "Không xác định";
}

export function getAccountAgeDays(createdAt: string | null | undefined, fallback?: number | null) {
  if (typeof fallback === "number" && !Number.isNaN(fallback)) return fallback;
  if (!createdAt) return null;

  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return null;

  const diff = Date.now() - created.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

export function getStatusLabel(status?: string | null) {
  const normalized = (status ?? "unknown").toLowerCase();
  if (normalized === "active") return "Đang hoạt động";
  if (normalized === "inactive") return "Ngừng hoạt động";
  if (normalized === "dormant") return "Tạm ngưng";
  if (normalized === "unknown") return "Không xác định";
  return status ?? "Không xác định";
}

export function getStatusTone(status?: string | null) {
  const normalized = (status ?? "unknown").toLowerCase();
  if (normalized === "active") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (normalized === "inactive") return "bg-rose-50 text-rose-700 border-rose-200";
  if (normalized === "dormant") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
}
