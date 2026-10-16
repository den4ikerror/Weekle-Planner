// Get Monday of the week for a given date
export function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Get Sunday of the week for a given date
export function getSunday(date: Date): Date {
  const monday = getMonday(date);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return sunday;
}

// Format date as YYYY-MM-DD
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Format datetime as ISO string
export function formatDateTime(date: Date): string {
  return date.toISOString();
}

// Add weeks to a date
export function addWeeks(date: Date, weeks: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + weeks * 7);
  return result;
}

// Check if two dates are in the same week
export function isSameWeek(date1: Date, date2: Date): boolean {
  const monday1 = getMonday(date1);
  const monday2 = getMonday(date2);
  return monday1.getTime() === monday2.getTime();
}

// Check if date is today
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

// Parse YYYY-MM-DD string to Date
export function parseDate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00');
}
