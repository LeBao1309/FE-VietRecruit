// ── Shared formatting utilities ──────────────────────────────────────
// All functions are null-safe and use vi-VN locale.

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export function formatDateShort(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

export function formatMoney(n: number | null | undefined): string {
  if (n == null) return '—'
  return n.toLocaleString('vi-VN')
}

export function formatSalaryRange(
  min: number | null | undefined,
  max: number | null | undefined,
  currency?: string | null,
): string {
  if (!min && !max) return '—'
  const cur = currency ?? 'VND'
  const fmt = (n: number) => n.toLocaleString('vi-VN')
  if (min && max) return `${fmt(min)} – ${fmt(max)} ${cur}`
  if (min) return `Từ ${fmt(min)} ${cur}`
  return `Đến ${fmt(max!)} ${cur}`
}
