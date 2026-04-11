/** First TanStack Form field error as a display string. */
export function fieldFirstError(errors: readonly unknown[] | undefined): string | undefined {
  const err = errors?.[0];
  if (err == null) return undefined;
  if (typeof err === "string") return err;
  if (typeof err === "object" && err !== null && "message" in err) {
    const m = (err as { message?: unknown }).message;
    if (m != null) return String(m);
  }
  return String(err);
}
