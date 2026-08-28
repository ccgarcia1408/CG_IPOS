export const money = (value: number | null | undefined) =>
  Number(value ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const dateTime = (value: string | null | undefined) => (value ? new Date(value).toLocaleString() : "-");

export const dateOnly = (value: string | null | undefined) => (value ? new Date(value).toLocaleDateString() : "-");

export const percent = (value: number | null | undefined) => (value === null || value === undefined ? "-" : `${Number(value).toFixed(1)}%`);
