export function formatNumber(number: number) {
  if (typeof number !== 'number') return 'N/A';

  return number.toLocaleString();
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
