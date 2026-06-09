const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
export const API_URL = `${API_BASE}/api/v1`;

export const AUTH_URL = API_URL + '/auth';
export const SIGNIN_URL = AUTH_URL + '/signin';
export const ME_URL = AUTH_URL + '/me';
export const CHECK_HEALTH_URL = AUTH_URL + '/check-health';
