export type TimeGranularity = "hour" | "day" | "month" | "year";
export type TimePreset = "today" | "sevenDays" | "thirtyDays" | "thisMonth" | "thisYear";

export type TimeBucket = {
  key: string;
  label: string;
  total: number;
};

const pad = (value: number) => String(value).padStart(2, "0");

export function toDateTimeInputValue(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function toDateTimeApiValue(value: string) {
  if (!value) return undefined;
  return value.length === 16 ? `${value}:00` : value;
}

export function getDefaultGranularityForPreset(preset: TimePreset): TimeGranularity {
  if (preset === "today") return "hour";
  if (preset === "thisYear") return "month";
  return "day";
}

export function getTimePresetRange(preset: TimePreset) {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

  if (preset === "today") {
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
  }

  if (preset === "sevenDays") {
    start.setDate(now.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
  }

  if (preset === "thirtyDays") {
    start.setDate(now.getDate() - 29);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
  }

  if (preset === "thisMonth") {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
  }

  if (preset === "thisYear") {
    start.setMonth(0, 1);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
  }

  return {
    createdFrom: toDateTimeInputValue(start),
    createdTo: toDateTimeInputValue(end),
  };
}

export function formatTimeBucket(date: Date, granularity: TimeGranularity) {
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hour = pad(date.getHours());

  if (granularity === "hour") {
    return {
      key: `${year}-${month}-${day}-${hour}`,
      label: `${day}/${month}/${year} ${hour}:00`,
    };
  }

  if (granularity === "day") {
    return {
      key: `${year}-${month}-${day}`,
      label: `${day}/${month}/${year}`,
    };
  }

  if (granularity === "month") {
    return {
      key: `${year}-${month}`,
      label: `${month}/${year}`,
    };
  }

  return {
    key: `${year}`,
    label: `${year}`,
  };
}

export function buildTimeBuckets<T>(
  items: T[],
  getDateValue: (item: T) => string | null | undefined,
  granularity: TimeGranularity
) {
  const grouped = new Map<string, TimeBucket>();

  for (const item of items) {
    const value = getDateValue(item);
    if (!value) continue;

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) continue;

    const bucket = formatTimeBucket(date, granularity);
    const current = grouped.get(bucket.key);
    grouped.set(bucket.key, {
      ...bucket,
      total: (current?.total ?? 0) + 1,
    });
  }

  return Array.from(grouped.values()).sort((a, b) => a.key.localeCompare(b.key));
}
