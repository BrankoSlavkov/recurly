export function formatCurrency(amount: number, currency = "USD"): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    console.error(error);
    const safeAmount = Number.isFinite(amount) ? amount.toFixed(2) : "0.00";
    return `${currency} ${safeAmount}`;
  }
}
