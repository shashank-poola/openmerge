const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
export const API_URL = `${API_BASE}/api/v1`;

export const SIGNIN_URL = API_URL + '/sign-in';