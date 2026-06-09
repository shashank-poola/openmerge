const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
export const API_URL = `${API_BASE}/api/v1`;

export const AUTH_URL = API_URL + '/auth';
export const SIGNIN_URL = AUTH_URL + '/signin';
export const ME_URL = AUTH_URL + '/me';
export const CHECK_HEALTH_URL = AUTH_URL + '/check-health';

export const INSTALLATIONS_URL = API_URL + '/installations';
export const INSTALLATIONS_CALLBACK_URL = INSTALLATIONS_URL + '/callback';

export const GITHUB_EXCHANGE_URL = AUTH_URL + '/github/exchange';
