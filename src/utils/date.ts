export function now(): number {
  return Date.now();
}

export function formatDate(epoch: number): string {
  return new Date(epoch).toLocaleDateString('en-IE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatMonthYear(epoch: number): string {
  return new Date(epoch).toLocaleDateString('en-IE', {
    year: 'numeric',
    month: 'long',
  });
}

export function getMonthKey(epoch: number): string {
  const d = new Date(epoch);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function getMonthRange(year: number, month: number): { start: number; end: number } {
  const start = new Date(year, month, 1).getTime();
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999).getTime();
  return { start, end };
}
