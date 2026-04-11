/** First character uppercase; rest unchanged (letters, numbers, underscores preserved). */
export function capitalizeUsernameFirst(value: string): string {
  const t = value.trim();
  if (!t) return t;
  return t.charAt(0).toUpperCase() + t.slice(1);
}
