function dateKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
}

export function getCurrentIstanbulCalendarGridRange() {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Istanbul',
      year: 'numeric',
      month: '2-digit',
    })
      .formatToParts(new Date())
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value]),
  );
  const year = Number(parts.year);
  const month = Number(parts.month) - 1;
  const firstWeekday = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const leadingDays = (firstWeekday + 6) % 7;
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const gridLength = leadingDays + daysInMonth <= 35 ? 35 : 42;
  const startDate = new Date(Date.UTC(year, month, 1 - leadingDays));
  const endDate = new Date(startDate);
  endDate.setUTCDate(endDate.getUTCDate() + gridLength);

  return {
    start: `${dateKey(startDate)}T00:00:00+03:00`,
    end: `${dateKey(endDate)}T00:00:00+03:00`,
  };
}

export function getUpcomingIstanbulCalendarRange(days = 365) {
  const todayKey = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  const endDate = new Date(`${todayKey}T00:00:00Z`);
  endDate.setUTCDate(endDate.getUTCDate() + days);
  return {
    start: `${todayKey}T00:00:00+03:00`,
    end: `${dateKey(endDate)}T00:00:00+03:00`,
  };
}

export function eventOverlapsRange(
  event: { start: string; end: string },
  range: { start: string; end: string },
) {
  return (
    Date.parse(event.start) < Date.parse(range.end) &&
    Date.parse(event.end) > Date.parse(range.start)
  );
}
