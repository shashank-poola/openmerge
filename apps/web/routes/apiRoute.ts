const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
export const API_URL = `${API_BASE}/api/v1`;

export const AUTH_URL = API_URL + '/auth';
export const SIGNIN_URL = AUTH_URL + '/signin';
export const ME_URL = AUTH_URL + '/me';
export const CHECK_HEALTH_URL = AUTH_URL + '/check-health';

export const INSTALLATIONS_URL = API_URL + '/installations';
export const INSTALLATION_CALLBACK_URL = INSTALLATIONS_URL + '/callback';
export const installationReposUrl = (id: string) => `${INSTALLATIONS_URL}/${id}/repos`;
export const installationSyncUrl = (id: string) => `${INSTALLATIONS_URL}/${id}/sync`;


export const REPOS_URL = API_URL + '/repos';
export const repoAutoReviewUrl = (id: string) => `${REPOS_URL}/${id}/auto-review`;

export const DASHBOARD_URL = API_URL + '/dashboard';
export const DASHBOARD_REVIEWS_URL = DASHBOARD_URL + '/reviews';
export const dashboardReviewUrl = (id: string) => `${DASHBOARD_REVIEWS_URL}/${id}`;

export const WEBHOOK_GITHUB_URL = API_URL + '/webhook/github';
