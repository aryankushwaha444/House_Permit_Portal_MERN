function renderPortalNavigation() {
  const navRight = document.getElementById("navRight");
  if (!navRight) return;

  const user = JSON.parse(localStorage.getItem("user") || "null");

  // ==============================
  // LOGO LINK
  // ==============================
  const logo = document.getElementById("portalLogo");

  if (logo) {
    logo.href = user?.role === "admin" ? "/admin-dashboard" : "/";
  }

  // ==============================
  // NOT LOGGED IN
  // ==============================
  if (!user) {
    navRight.innerHTML =
      '<button onclick="window.location.href=\'/login\'" class="login-btn">Login</button>' +
      '<button onclick="window.location.href=\'/register\'" class="register-btn">Register</button>';

    return;
  }

  // ==============================
  // HOME LINK
  // ==============================
  const homeLink = user.role === "admin" ? "/admin-dashboard" : "/";

  // ==============================
  // NAVIGATION BUTTON
  // ==============================
  const navigationButton =
    user.role === "admin"
      ? '<button type="button" class="status-btn" onclick="window.location.href=\'/user-management\'">User Management</button>'
      : '<button type="button" class="status-btn" onclick="window.location.href=\'/dashboard\'">Check Status</button>';

  // ==============================
  // NAVIGATION HTML
  // ==============================
  navRight.innerHTML =
    navigationButton +
    '<div class="home-account">' +
    '<button type="button" class="home-avatar" id="homeAccountButton" aria-label="Open account menu" aria-expanded="false" aria-controls="homeAccountMenu">' +
    '<i class="fas fa-user-shield"></i>' +
    "</button>" +
    '<div class="home-account-menu" id="homeAccountMenu" hidden>' +
    '<div class="home-account-details">' +
    '<strong id="homeAccountName"></strong>' +
    '<span id="homeAccountEmail"></span>' +
    "</div>" +
    '<button type="button" class="home-account-logout" id="homeAccountLogout">' +
    '<i class="fas fa-sign-out-alt"></i> Logout' +
    "</button>" +
    "</div>" +
    "</div>";

  // ==============================
  // USER DETAILS
  // ==============================
  const accountName = document.getElementById("homeAccountName");
  const accountEmail = document.getElementById("homeAccountEmail");

  if (accountName) {
    accountName.textContent = user.fullName || "";
  }

  if (accountEmail) {
    accountEmail.textContent = user.email || "";
  }

  // ==============================
  // ACCOUNT MENU
  // ==============================
  const button = document.getElementById("homeAccountButton");
  const menu = document.getElementById("homeAccountMenu");

  if (!button || !menu) return;

  const close = () => {
    menu.hidden = true;
    button.setAttribute("aria-expanded", "false");
  };

  button.addEventListener("click", (event) => {
    event.stopPropagation();

    const open = !menu.hidden;

    menu.hidden = open;
    button.setAttribute("aria-expanded", String(!open));
  });

  menu.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  document.addEventListener("click", close);

  // ==============================
  // LOGOUT
  // ==============================
  const logoutButton = document.getElementById("homeAccountLogout");

  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      localStorage.removeItem("user");

      window.location.assign("/login");
    });
  }
}

document.addEventListener("DOMContentLoaded", renderPortalNavigation);
