export const fmtPKR = (n: number): string =>
  new Intl.NumberFormat('en-PK', { maximumFractionDigits: 0 }).format(Math.round(n))

export const pctOff = (price: number, oldPrice: number | null): number | null => {
  if (!oldPrice || oldPrice <= price) return null
  return Math.round(((oldPrice - price) / oldPrice) * 100)
}
