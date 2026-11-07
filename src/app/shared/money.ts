const formatter = new Intl.NumberFormat('it-IT', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

export function formatMoney(value: number): string {
  return formatter.format(value);
}
