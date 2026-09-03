import { createRemoteJWKSet, jwtVerify } from 'jose';

type AccessEnv = {
  CF_ACCESS_TEAM_DOMAIN?: string;
  CF_ACCESS_AUD?: string;
};

const keySets = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

export async function requireCloudflareAccess(request: Request, runtimeEnv: AccessEnv) {
  const rawDomain = runtimeEnv.CF_ACCESS_TEAM_DOMAIN?.trim();
  const audience = runtimeEnv.CF_ACCESS_AUD?.trim();
  const token = request.headers.get('Cf-Access-Jwt-Assertion')?.trim();

  if (!rawDomain || !audience || !token) return null;

  const issuer = (rawDomain.startsWith('https://') ? rawDomain : `https://${rawDomain}`).replace(/\/$/, '');
  let keySet = keySets.get(issuer);
  if (!keySet) {
    keySet = createRemoteJWKSet(new URL(`${issuer}/cdn-cgi/access/certs`));
    keySets.set(issuer, keySet);
  }

  try {
    const { payload } = await jwtVerify(token, keySet, {
      issuer,
      audience,
    });
    const email = typeof payload.email === 'string' ? payload.email.toLowerCase() : '';
    if (!email) return null;
    return { email };
  } catch {
    return null;
  }
}
