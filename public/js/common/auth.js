function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
}
function clearStoredUser() {
  localStorage.removeItem("user");
}
function requireAuth() {
  const user = getStoredUser();
  if (!user?.token) {
    window.location.assign("/login");
    return null;
  }
  return user;
}
function logout() {
  clearStoredUser();
  window.location.assign("/login");
}
