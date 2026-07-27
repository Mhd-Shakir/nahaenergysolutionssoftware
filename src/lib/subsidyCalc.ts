export function calculateSubsidy(kw: number, type: 'residential' | 'commercial'): number {
  if (type === 'commercial') return 0
  if (kw <= 2) return kw * 30000
  if (kw <= 3) return (2 * 30000) + ((kw - 2) * 18000)
  return 78000 // Capped at ₹78,000 for above 3 KW
}

export function getDailyOutput(kw: number) {
  return { min: Math.round(kw * 3), max: Math.round(kw * 4.4) }
}

export function generateProjectId(count: number): string {
  return `PID${String(count + 1).padStart(4, '0')}`
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}
