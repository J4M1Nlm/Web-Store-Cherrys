export function formatPrice(cents: number, currency = 'MXN'): string {
  const amount = (cents / 100).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `$${amount} ${currency}`;
}
