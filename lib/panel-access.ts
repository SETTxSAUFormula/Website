import { requireCloudflareAccess } from '@/lib/cloudflare-access';
import { getPanelMemberProfile } from '@/lib/panel-operations';
import {
  resolvePanelUser,
  systemAdminEmails,
  type PanelUser,
} from '@/lib/panel-authorization';

export type PanelAccessEnv = {
  APPLICATIONS_DB?: D1Database;
  CF_ACCESS_TEAM_DOMAIN?: string;
  CF_ACCESS_AUD?: string;
};

function isSystemAdmin(email: string) {
  return systemAdminEmails.includes(
    email as (typeof systemAdminEmails)[number],
  );
}

export function isLocalPanelHostname(hostname: string) {
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

export async function resolveActivePanelUser(
  email: string,
  runtimeEnv: PanelAccessEnv,
): Promise<PanelUser | null> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return null;
  if (isSystemAdmin(normalizedEmail)) return resolvePanelUser(normalizedEmail);
  if (!runtimeEnv.APPLICATIONS_DB) return null;

  try {
    const profile = await getPanelMemberProfile(
      runtimeEnv.APPLICATIONS_DB,
      normalizedEmail,
    );
    return profile ? resolvePanelUser(normalizedEmail, profile) : null;
  } catch (error) {
    console.error('Panel member authorization lookup failed', error);
    return null;
  }
}

export async function authorizePanelRequest(
  request: Request,
  runtimeEnv: PanelAccessEnv,
) {
  const identity = await requireCloudflareAccess(request, runtimeEnv);
  const hostname = new URL(request.url).hostname;
  const email =
    identity?.email ??
    (isLocalPanelHostname(hostname) ? 'admin@sauformula.org' : '');

  return email ? resolveActivePanelUser(email, runtimeEnv) : null;
}
