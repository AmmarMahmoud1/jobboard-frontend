const KEY = "authUser";

export function setAuthUser(user, remember) {
  const value = JSON.stringify(user);
  if (remember) {
    localStorage.setItem(KEY, value);
    sessionStorage.removeItem(KEY);
  } else {
    sessionStorage.setItem(KEY, value);
    localStorage.removeItem(KEY);
  }
}

export function getAuthUser() {
  const value = localStorage.getItem(KEY) || sessionStorage.getItem(KEY);
  return value ? JSON.parse(value) : null;
}

export function clearAuthUser() {
  localStorage.removeItem(KEY);
  sessionStorage.removeItem(KEY);
}
