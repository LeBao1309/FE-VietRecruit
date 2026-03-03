// Centralized artificial latency configuration
// Adjust these values globally to control the "realism" of the demo

export const LATENCY = {
  LOGIN: 800,
  CV_UPLOAD: 3000,
  SAVE: 1000,
  EXPORT: 1500,
} as const;

/** Returns a promise that resolves after the specified delay */
export function simulateLatency(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** Extract initials from a full name (e.g. "Nguyen Van Anh" -> "NV") */
export function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || '?';
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
