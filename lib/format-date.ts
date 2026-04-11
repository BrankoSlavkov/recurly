export function formatDate(date: string): string {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", { month: "2-digit", day: "2-digit" }).format(parsedDate);
}

export function formatSubscriptionDateTime(value?: string): string {
  if (!value) return "Not provided";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not provided";

  return new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

export function formatStatusLabel(value?: string): string {
  if (!value) return "Unknown";

  return value.charAt(0).toUpperCase() + value.slice(1);
}
