const dateFormat = new Intl.DateTimeFormat(undefined, { weekday: "short", day: "numeric", month: "short", year: "numeric" });

export function formatDate(isoDate: string): string {
  return dateFormat.format(new Date(`${isoDate}T00:00:00`));
}
