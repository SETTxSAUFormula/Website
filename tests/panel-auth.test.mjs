import assert from 'node:assert/strict';
import test from 'node:test';

import { validGoogleIdentityClaims } from '../lib/panel-auth-validation.ts';
import {
  clearSessionCookie,
  hasTrustedMutationOrigin,
  parseCookies,
  sessionCookie,
  sha256Hex,
} from '../lib/panel-session.ts';

test('Google identity requires a verified email and the original nonce', () => {
  assert.deepEqual(
    validGoogleIdentityClaims(
      {
        email: ' Member@Example.com ',
        email_verified: true,
        sub: 'google-subject',
        nonce: 'expected',
      },
      'expected',
    ),
    { email: 'member@example.com', subject: 'google-subject' },
  );
  assert.equal(
    validGoogleIdentityClaims(
      {
        email: 'member@example.com',
        email_verified: false,
        sub: 'google-subject',
        nonce: 'expected',
      },
      'expected',
    ),
    null,
  );
  assert.equal(
    validGoogleIdentityClaims(
      {
        email: 'member@example.com',
        email_verified: true,
        sub: 'google-subject',
        nonce: 'replayed',
      },
      'expected',
    ),
    null,
  );
});

test('session cookies are HTTP-only, same-site, and secure on HTTPS', () => {
  const cookie = sessionCookie('secret', 'https://panel.sauformula.org/panel');
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /SameSite=Lax/);
  assert.match(cookie, /; Secure/);
  assert.match(cookie, /^__Host-sauformula_panel_session=/);
  assert.match(
    clearSessionCookie('https://panel.sauformula.org/panel'),
    /Max-Age=0/,
  );
  assert.equal(
    parseCookies(`other=x; ${cookie}`).get(
      '__Host-sauformula_panel_session',
    ),
    'secret',
  );
});

test('unsafe session requests require an exact same-origin Origin header', () => {
  assert.equal(
    hasTrustedMutationOrigin(
      new Request('https://panel.sauformula.org/api/panel/members'),
    ),
    true,
  );
  assert.equal(
    hasTrustedMutationOrigin(
      new Request('https://panel.sauformula.org/api/panel/members', {
        method: 'POST',
        headers: { Origin: 'https://panel.sauformula.org' },
      }),
    ),
    true,
  );
  assert.equal(
    hasTrustedMutationOrigin(
      new Request('https://panel.sauformula.org/api/panel/members', {
        method: 'POST',
        headers: { Origin: 'https://evil.example' },
      }),
    ),
    false,
  );
});

test('session tokens are stored as a deterministic SHA-256 digest', async () => {
  assert.equal(
    await sha256Hex('session-token'),
    'c101e911469c969171040b50d70543313cf968fdef5bacc780776f8fb399ab36',
  );
});
