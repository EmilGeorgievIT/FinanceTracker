const EUR_FORMATTER = new Intl.NumberFormat('en-IE', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatEur(amount: number): string {
  return EUR_FORMATTER.format(amount);
}

export function parseEur(text: string): number {
  const cleaned = text.replace(/[^\d,.-]/g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
}

export function sumEur(amounts: number[]): number {
  return amounts.reduce((sum, a) => sum + a, 0);
}
