function renderPortalNavigation() {
  const navRight = document.getElementById("navRight");
  if (!navRight) return;

  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (user) {
    const logo = document.getElementById("portalLogo");

    if (logo) {
      logo.href =
        user.role === "admin" ? "/admin-dashboard.html" : "/index.html";
    }
  }

  if (!user) {
    navRight.innerHTML =
      '<button onclick="window.location.href=\'/login.html\'" class="login-btn">Login</button><button onclick="window.location.href=\'/register.html\'" class="register-btn">Register</button>';
    return;
  }

  const homeLink =
    user.role === "admin" ? "/admin-dashboard.html" : "/index.html";

  const navigationButton =
    user.role === "admin"
      ? '<button type="button" class="status-btn" onclick="window.location.href=\'/user-management.html\'">User Management</button>'
      : '<button type="button" class="status-btn" onclick="window.location.href=\'/dashboard/\'">Check Status</button>';

  navRight.innerHTML =
    navigationButton +
    '<div class="home-account"><button type="button" class="home-avatar" id="homeAccountButton" aria-label="Open account menu" aria-expanded="false" aria-controls="homeAccountMenu"><i class="fas fa-user-shield"></i></button><div class="home-account-menu" id="homeAccountMenu" hidden><div class="home-account-details"><strong id="homeAccountName"></strong><span id="homeAccountEmail"></span></div><button type="button" class="home-account-logout" id="homeAccountLogout"><i class="fas fa-sign-out-alt"></i> Logout</button></div></div>';

  document.getElementById("homeAccountName").textContent = user.fullName;

  document.getElementById("homeAccountEmail").textContent = user.email;

  const button = document.getElementById("homeAccountButton");
  const menu = document.getElementById("homeAccountMenu");

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

  menu.addEventListener("click", (event) => event.stopPropagation());

  document.addEventListener("click", close);

  document.getElementById("homeAccountLogout").addEventListener("click", () => {
    localStorage.removeItem("user");
    window.location.assign("/login.html");
  });
}

document.addEventListener("DOMContentLoaded", renderPortalNavigation);
