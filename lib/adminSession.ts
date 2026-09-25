export function createAdminSessionToken(userId: string) {
  return Buffer.from(JSON.stringify({ id: userId }), 'utf8').toString('base64url');
}

export function readAdminSessionUserId(token: string): string | null {
  try {
    const parsed = JSON.parse(Buffer.from(token, 'base64url').toString('utf8')) as {
      id?: unknown;
    };
    return typeof parsed.id === 'string' && parsed.id.length > 0 ? parsed.id : null;
  } catch {
    return null;
  }
}
