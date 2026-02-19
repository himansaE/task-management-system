const MINUTE = 60_000;
const HOUR = 3_600_000;
const DAY = 86_400_000;

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

export function relativeTime(dateString: string): {
  text: string;
  overdue: boolean;
} {
  const target = new Date(dateString).getTime();
  const now = Date.now();
  const diff = target - now;

  const overdue = diff < 0;
  const absDiff = Math.abs(diff);

  if (absDiff < MINUTE) {
    return { text: "just now", overdue: false };
  }

  if (absDiff < HOUR) {
    const minutes = Math.round(diff / MINUTE);
    return { text: rtf.format(minutes, "minute"), overdue };
  }

  if (absDiff < DAY) {
    const hours = Math.round(diff / HOUR);
    return { text: rtf.format(hours, "hour"), overdue };
  }

  const days = Math.round(diff / DAY);
  return { text: rtf.format(days, "day"), overdue };
}
