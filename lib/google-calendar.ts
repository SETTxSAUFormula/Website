export type GoogleCalendarEnv = {
  GOOGLE_CALENDAR_ID?: string;
  GOOGLE_OAUTH_CLIENT_ID?: string;
  GOOGLE_OAUTH_CLIENT_SECRET?: string;
  GOOGLE_OAUTH_REFRESH_TOKEN?: string;
};

export type TeamCalendarEvent = {
  id: string;
  title: string;
  description: string;
  location: string;
  start: string;
  end: string;
  htmlLink: string;
  source: 'team' | 'holiday';
  category: 'event' | 'competition' | 'holiday';
};

export type CreateTeamCalendarEvent = {
  title: string;
  description?: string;
  location?: string;
  start: string;
  end: string;
  createdBy?: string;
  category?: 'event' | 'competition';
};

export type UpdateTeamCalendarEvent = Omit<
  CreateTeamCalendarEvent,
  'createdBy'
>;

type GoogleEvent = {
  id?: string;
  summary?: string;
  description?: string;
  location?: string;
  htmlLink?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  extendedProperties?: { private?: Record<string, string> };
};

type TokenCache = {
  token: string;
  expiresAt: number;
  clientId: string;
};
let tokenCache: TokenCache | null = null;

export function isGoogleCalendarConfigured(runtimeEnv: GoogleCalendarEnv) {
  return Boolean(
    runtimeEnv.GOOGLE_CALENDAR_ID?.trim() &&
    runtimeEnv.GOOGLE_OAUTH_CLIENT_ID?.trim() &&
    runtimeEnv.GOOGLE_OAUTH_CLIENT_SECRET?.trim() &&
    runtimeEnv.GOOGLE_OAUTH_REFRESH_TOKEN?.trim(),
  );
}

function requireCalendarConfig(runtimeEnv: GoogleCalendarEnv) {
  const calendarId = runtimeEnv.GOOGLE_CALENDAR_ID?.trim();
  const clientId = runtimeEnv.GOOGLE_OAUTH_CLIENT_ID?.trim();
  const clientSecret = runtimeEnv.GOOGLE_OAUTH_CLIENT_SECRET?.trim();
  const refreshToken = runtimeEnv.GOOGLE_OAUTH_REFRESH_TOKEN?.trim();

  if (!calendarId || !clientId || !clientSecret || !refreshToken) {
    throw new Error('Google Calendar yapılandırması eksik.');
  }

  return { calendarId, clientId, clientSecret, refreshToken };
}

async function getAccessToken(runtimeEnv: GoogleCalendarEnv) {
  const { clientId, clientSecret, refreshToken } =
    requireCalendarConfig(runtimeEnv);
  const now = Math.floor(Date.now() / 1000);

  if (
    tokenCache &&
    tokenCache.clientId === clientId &&
    tokenCache.expiresAt > now + 60
  ) {
    return tokenCache.token;
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  const payload = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
    error_description?: string;
  };
  if (!response.ok || !payload.access_token) {
    throw new Error(
      payload.error_description || 'Google yetkilendirmesi başarısız.',
    );
  }

  tokenCache = {
    token: payload.access_token,
    expiresAt: now + (payload.expires_in ?? 3_600),
    clientId,
  };
  return payload.access_token;
}

async function calendarRequest(
  runtimeEnv: GoogleCalendarEnv,
  path: string,
  init?: RequestInit,
) {
  const token = await getAccessToken(runtimeEnv);
  const headers = new Headers(init?.headers);
  headers.set('Authorization', `Bearer ${token}`);
  headers.set('Content-Type', 'application/json');
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3${path}`,
    {
      ...init,
      headers,
    },
  );

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: { message?: string };
    } | null;
    throw new Error(
      payload?.error?.message || 'Google Calendar isteği başarısız.',
    );
  }

  return response;
}

function normalizeEvent(event: GoogleEvent): TeamCalendarEvent | null {
  const start = event.start?.dateTime ?? event.start?.date;
  const end = event.end?.dateTime ?? event.end?.date;
  if (!event.id || !start || !end) return null;

  const summary = event.summary?.trim() || 'Başlıksız etkinlik';
  const titleTag = /^\[(?:yarışma|competition)\]\s*/i;
  const category =
    event.extendedProperties?.private?.sauformulaCategory === 'competition' ||
    titleTag.test(summary)
      ? 'competition'
      : 'event';

  return {
    id: event.id,
    title: summary.replace(titleTag, '') || 'Başlıksız etkinlik',
    description: event.description?.trim() || '',
    location: event.location?.trim() || '',
    start,
    end,
    htmlLink: event.htmlLink || '',
    source: 'team',
    category,
  };
}

export async function listTeamCalendarEvents(
  runtimeEnv: GoogleCalendarEnv,
  range?: { start: string; end: string },
) {
  const { calendarId } = requireCalendarConfig(runtimeEnv);
  const query = new URLSearchParams({
    timeMin: range?.start ?? new Date().toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '250',
    timeZone: 'Europe/Istanbul',
  });
  if (range?.end) query.set('timeMax', range.end);
  const response = await calendarRequest(
    runtimeEnv,
    `/calendars/${encodeURIComponent(calendarId)}/events?${query}`,
  );
  const payload = (await response.json()) as { items?: GoogleEvent[] };
  return (payload.items ?? [])
    .map(normalizeEvent)
    .filter((event) => event !== null);
}

export async function createTeamCalendarEvent(
  runtimeEnv: GoogleCalendarEnv,
  event: CreateTeamCalendarEvent,
) {
  const { calendarId } = requireCalendarConfig(runtimeEnv);
  const response = await calendarRequest(
    runtimeEnv,
    `/calendars/${encodeURIComponent(calendarId)}/events`,
    {
      method: 'POST',
      body: JSON.stringify({
        summary: event.title,
        description: event.description,
        location: event.location,
        start: { dateTime: event.start, timeZone: 'Europe/Istanbul' },
        end: { dateTime: event.end, timeZone: 'Europe/Istanbul' },
        extendedProperties: event.createdBy
          ? {
              private: {
                sauformulaCreatedBy: event.createdBy,
                sauformulaCategory: event.category ?? 'event',
              },
            }
          : { private: { sauformulaCategory: event.category ?? 'event' } },
      }),
    },
  );
  const created = normalizeEvent((await response.json()) as GoogleEvent);
  if (!created)
    throw new Error('Google Calendar geçersiz bir etkinlik döndürdü.');
  return created;
}

export async function updateTeamCalendarEvent(
  runtimeEnv: GoogleCalendarEnv,
  eventId: string,
  event: UpdateTeamCalendarEvent,
) {
  const { calendarId } = requireCalendarConfig(runtimeEnv);
  const response = await calendarRequest(
    runtimeEnv,
    `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        summary: event.title,
        description: event.description,
        location: event.location,
        start: { dateTime: event.start, timeZone: 'Europe/Istanbul' },
        end: { dateTime: event.end, timeZone: 'Europe/Istanbul' },
        extendedProperties: {
          private: { sauformulaCategory: event.category ?? 'event' },
        },
      }),
    },
  );
  const updated = normalizeEvent((await response.json()) as GoogleEvent);
  if (!updated)
    throw new Error('Google Calendar geçersiz bir etkinlik döndürdü.');
  return updated;
}

export async function deleteTeamCalendarEvent(
  runtimeEnv: GoogleCalendarEnv,
  eventId: string,
) {
  const { calendarId } = requireCalendarConfig(runtimeEnv);
  await calendarRequest(
    runtimeEnv,
    `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
    { method: 'DELETE' },
  );
}
