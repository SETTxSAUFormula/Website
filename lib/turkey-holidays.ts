import type { TeamCalendarEvent } from '@/lib/google-calendar';

const TURKEY_HOLIDAYS_ICS_URL =
  'https://calendar.google.com/calendar/ical/tr.turkish%23holiday%40group.v.calendar.google.com/public/basic.ics';
const CACHE_DURATION_MS = 6 * 60 * 60 * 1_000;

type HolidayCache = {
  expiresAt: number;
  events: TeamCalendarEvent[];
};

let holidayCache: HolidayCache | null = null;

function decodeIcsText(value: string) {
  const decoded = value
    .replace(/\\n/gi, ' ')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\')
    .trim();

  const localizedTitles: Record<string, string> = {
    'Sacrifice Feast Holiday': 'Kurban Bayramı Tatili',
    'Kurban Bayrami Day 2': 'Kurban Bayramı (2. gün)',
    'Kurban Bayrami Day 3': 'Kurban Bayramı (3. gün)',
    'Kurban Bayrami Day 4': 'Kurban Bayramı (4. gün)',
  };
  return localizedTitles[decoded] ?? decoded;
}

function normalizeIcsDate(value: string) {
  const compactDate = /^(\d{4})(\d{2})(\d{2})$/.exec(value);
  if (compactDate)
    return `${compactDate[1]}-${compactDate[2]}-${compactDate[3]}`;

  const compactDateTime =
    /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z?$/.exec(value);
  if (!compactDateTime) return '';
  return `${compactDateTime[1]}-${compactDateTime[2]}-${compactDateTime[3]}T${compactDateTime[4]}:${compactDateTime[5]}:${compactDateTime[6]}${value.endsWith('Z') ? 'Z' : '+03:00'}`;
}

function nextDay(dateValue: string) {
  const date = new Date(`${dateValue}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

export function parseTurkeyHolidayCalendar(ics: string) {
  const unfolded = ics.replace(/\r?\n[ \t]/g, '');
  const events: TeamCalendarEvent[] = [];
  let current: Record<string, string> | null = null;

  for (const line of unfolded.split(/\r?\n/)) {
    if (line === 'BEGIN:VEVENT') {
      current = {};
      continue;
    }
    if (line === 'END:VEVENT') {
      if (current) {
        const start = normalizeIcsDate(current.DTSTART ?? '');
        const end =
          normalizeIcsDate(current.DTEND ?? '') ||
          (/^\d{4}-\d{2}-\d{2}$/.test(start) ? nextDay(start) : '');
        if (start && end) {
          events.push({
            id: `turkey-holiday-${current.UID || `${start}-${current.SUMMARY}`}`,
            title: decodeIcsText(current.SUMMARY || 'Resmî tatil'),
            description: '',
            location: 'Türkiye',
            start,
            end,
            htmlLink: '',
            source: 'holiday',
            category: 'holiday',
          });
        }
      }
      current = null;
      continue;
    }
    if (!current) continue;

    const separator = line.indexOf(':');
    if (separator < 0) continue;
    const property = line.slice(0, separator).split(';')[0];
    if (
      property === 'UID' ||
      property === 'SUMMARY' ||
      property === 'DTSTART' ||
      property === 'DTEND'
    )
      current[property] = line.slice(separator + 1);
  }

  return events;
}

async function getTurkeyHolidayEvents() {
  if (holidayCache && holidayCache.expiresAt > Date.now())
    return holidayCache.events;

  const response = await fetch(TURKEY_HOLIDAYS_ICS_URL, {
    headers: { Accept: 'text/calendar' },
  });
  if (!response.ok) throw new Error('Türkiye tatilleri alınamadı.');

  const events = parseTurkeyHolidayCalendar(await response.text());
  holidayCache = { events, expiresAt: Date.now() + CACHE_DURATION_MS };
  return events;
}

export async function listTurkeyHolidayEvents(range?: {
  start: string;
  end: string;
}) {
  const events = await getTurkeyHolidayEvents();
  if (!range) return events;

  const rangeStart = range.start.slice(0, 10);
  const rangeEnd = range.end.slice(0, 10);
  return events.filter(
    (event) =>
      event.start.slice(0, 10) < rangeEnd &&
      event.end.slice(0, 10) > rangeStart,
  );
}
