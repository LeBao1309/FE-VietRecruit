/**
 * Generate a Google Calendar event URL from interview data.
 */
export function generateGoogleCalendarUrl({
  title,
  date,
  time,
  duration,
  meetingLink,
  description,
}: {
  title: string;
  date: string;       // e.g. "Jan 20" or "2025-01-20"
  time: string;       // e.g. "10:00 AM" or "10:00"
  duration: string;   // e.g. "60m"
  meetingLink?: string;
  description?: string;
}): string {
  // Parse the date — handle "Jan 20" format by appending current year
  let dateStr = date;
  if (!/\d{4}/.test(dateStr)) {
    dateStr = `${dateStr}, ${new Date().getFullYear()}`;
  }
  const parsed = new Date(`${dateStr} ${time}`);

  // If parse fails, fallback to tomorrow
  const start = isNaN(parsed.getTime())
    ? new Date(Date.now() + 86400000)
    : parsed;

  // Duration in minutes
  const durationMin = parseInt(duration) || 60;
  const end = new Date(start.getTime() + durationMin * 60000);

  const fmt = (d: Date) =>
    d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${fmt(start)}/${fmt(end)}`,
    details: [description, meetingLink ? `Join: ${meetingLink}` : ''].filter(Boolean).join('\n'),
    ctz: 'Asia/Ho_Chi_Minh',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
