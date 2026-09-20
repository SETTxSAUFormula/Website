import { requireCloudflareAccess } from '@/lib/cloudflare-access';
import { getPanelMemberProfile } from '@/lib/panel-operations';
import {
  getPanelSessionIdentity,
  hasPanelSessionCookie,
  hasTrustedMutationOrigin,
  type PanelSessionEnv,
} from '@/lib/panel-session';
import {
  resolvePanelUser,
  systemAdminEmails,
  type PanelUser,
} from '@/lib/panel-authorization';

export type PanelAccessEnv = PanelSessionEnv & {
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
  if (!hasTrustedMutationOrigin(request)) return null;

  const accessIdentity = await requireCloudflareAccess(request, runtimeEnv);
  if (accessIdentity)
    return resolveActivePanelUser(accessIdentity.email, runtimeEnv);

  const hostname = new URL(request.url).hostname;
  if (isLocalPanelHostname(hostname) && !hasPanelSessionCookie(request))
    return resolveActivePanelUser('admin@sauformula.org', runtimeEnv);

  if (!runtimeEnv.APPLICATIONS_DB) return null;
  const identity = await getPanelSessionIdentity(
    request,
    runtimeEnv.APPLICATIONS_DB,
  );

  return identity
    ? resolveActivePanelUser(identity.email, runtimeEnv)
    : null;
}
