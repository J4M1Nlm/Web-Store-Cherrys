export function jwtDecode<T = Record<string, unknown>>(token: string): T {
  const payload = token.split('.')[1];
  const json = payload.replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(atob(json));
}
