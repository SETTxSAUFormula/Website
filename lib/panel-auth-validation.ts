export type GooglePanelIdentity = {
  email: string;
  subject: string;
};

export function validGoogleIdentityClaims(
  payload: {
    email?: unknown;
    email_verified?: unknown;
    sub?: unknown;
    nonce?: unknown;
  },
  expectedNonce: string,
): GooglePanelIdentity | null {
  const email =
    typeof payload.email === 'string'
      ? payload.email.trim().toLowerCase()
      : '';
  const subject = typeof payload.sub === 'string' ? payload.sub.trim() : '';
  if (
    !email ||
    payload.email_verified !== true ||
    !subject ||
    payload.nonce !== expectedNonce
  )
    return null;
  return { email, subject };
}
