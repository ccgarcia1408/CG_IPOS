export type DateRangePreset =
  | "TODAY"
  | "YESTERDAY"
  | "THIS_WEEK"
  | "THIS_MONTH"
  | "LAST_MONTH"
  | "CUSTOM";

export const DATE_RANGE_PRESETS: { value: DateRangePreset; label: string }[] = [
  { value: "TODAY", label: "Today" },
  { value: "YESTERDAY", label: "Yesterday" },
  { value: "THIS_WEEK", label: "This Week" },
  { value: "THIS_MONTH", label: "This Month" },
  { value: "LAST_MONTH", label: "Last Month" },
  { value: "CUSTOM", label: "Custom" },
];

const toDateOnly = (date: Date) => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const endOfDay = (date: Date) => {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy;
};

const startOfWeek = (date: Date) => {
  const copy = toDateOnly(date);
  const day = copy.getDay(); // 0 = Sunday
  copy.setDate(copy.getDate() - day);
  return copy;
};

// Resolves a preset to a concrete {StartDate, EndDate} pair, as ISO datetime strings suitable
// for the dashboard API's StartDate/EndDate query params. CUSTOM returns null -- the caller
// supplies its own dates in that case.
export function resolveDateRangePreset(
  preset: DateRangePreset
): { startDate: string; endDate: string } | null {
  const now = new Date();

  switch (preset) {
    case "TODAY": {
      return { startDate: toDateOnly(now).toISOString(), endDate: endOfDay(now).toISOString() };
    }
    case "YESTERDAY": {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      return { startDate: toDateOnly(yesterday).toISOString(), endDate: endOfDay(yesterday).toISOString() };
    }
    case "THIS_WEEK": {
      const start = startOfWeek(now);
      return { startDate: start.toISOString(), endDate: endOfDay(now).toISOString() };
    }
    case "THIS_MONTH": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { startDate: start.toISOString(), endDate: endOfDay(now).toISOString() };
    }
    case "LAST_MONTH": {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return { startDate: start.toISOString(), endDate: endOfDay(end).toISOString() };
    }
    case "CUSTOM":
    default:
      return null;
  }
}
