let permits = [];

/* =========================================
   INITIALIZATION
========================================= */

document.addEventListener("DOMContentLoaded", () => {
  initializeDashboard();
});

async function initializeDashboard() {
  const user = getStoredUser();

  if (!user || !user.token) {
    window.location.href = "/login.html";
    return;
  }

  try {
    await verifyAuthentication(user);

    setWelcomeMessage(user);

    await loadPermits(user);

    setupFilters();
  } catch (error) {
    console.error("Dashboard initialization failed:", error);

    clearStoredUser();

    window.location.href = "/login.html";
  }
}

/* =========================================
   AUTHENTICATION
========================================= */

async function verifyAuthentication(user) {
  const response = await fetch("/api/auth/verify", {
    method: "GET",

    headers: {
      Authorization: `Bearer ${user.token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Authentication failed");
  }

  return response.json();
}

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

/* =========================================
   USER
========================================= */

function setWelcomeMessage(user) {
  document.getElementById("accountName").textContent = user.fullName;
  document.getElementById("accountEmail").textContent = user.email;

  const menuButton = document.getElementById("accountMenuButton");
  const menu = document.getElementById("accountMenu");
  const closeMenu = () => {
    menu.hidden = true;
    menuButton.setAttribute("aria-expanded", "false");
  };

  menuButton.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = !menu.hidden;
    menu.hidden = isOpen;
    menuButton.setAttribute("aria-expanded", String(!isOpen));
  });

  menu.addEventListener("click", (event) => event.stopPropagation());
  document.addEventListener("click", closeMenu);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
  document
    .getElementById("accountLogout")
    .addEventListener("click", handleLogout);
}

/* =========================================
   LOAD PERMITS
========================================= */

async function loadPermits(user) {
  const response = await fetch("/api/permits/my-permits", {
    headers: {
      Authorization: `Bearer ${user.token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to load permits");
  }

  permits = await response.json();

  updateStatistics();

  displayPermits(permits);
}

/* =========================================
   STATISTICS
========================================= */

function updateStatistics() {
  const total = permits.length;

  const pending = permits.filter(
    (permit) => permit.status === "Pending"
  ).length;

  const approved = permits.filter(
    (permit) => permit.status === "Approved"
  ).length;

  document.getElementById("totalApplications").textContent = total;

  document.getElementById("pendingApplications").textContent = pending;

  document.getElementById("approvedApplications").textContent = approved;
}

/* =========================================
   DISPLAY APPLICATIONS
========================================= */

function displayPermits(list) {
  const container = document.getElementById("permitCards");

  const emptyState = document.getElementById("noPermits");

  container.innerHTML = "";

  if (!list.length) {
    container.hidden = true;
    emptyState.hidden = false;

    return;
  }

  container.hidden = false;
  emptyState.hidden = true;

  list.forEach((permit) => {
    container.appendChild(createPermitCard(permit));
  });
}

function createPermitCard(permit) {
  const card = document.createElement("article");

  card.className = "permit-card";

  const statusClass = permit.status.toLowerCase();

  card.innerHTML = `

        <div class="permit-card-header">

            <div class="permit-property">

                <div class="property-icon">

                    <i class="fa-solid fa-building"></i>

                </div>

                <h3>
                    ${escapeHTML(permit.propertyType)}
                </h3>

            </div>

            <span class="status-badge ${statusClass}">
                ${escapeHTML(permit.status)}
            </span>

        </div>


        <div class="permit-body">

            <div class="permit-detail">

                <i class="fa-solid fa-location-dot"></i>

                <span>
                    ${escapeHTML(permit.propertyAddress)}
                </span>

            </div>


            <div class="permit-detail">

                <i class="fa-solid fa-hammer"></i>

                <span>
                    ${escapeHTML(permit.constructionType)}
                </span>

            </div>

        </div>


        <div class="permit-card-footer">

            <span class="permit-date">

                <i class="fa-regular fa-calendar"></i>

                ${formatDate(permit.createdAt)}

            </span>

            <button
                type="button"
                class="btn btn-outline"
                onclick="viewPermit('${permit._id}')"
            >
                View Details
            </button>

        </div>

    `;

  return card;
}

/* =========================================
   FILTERS
========================================= */

function setupFilters() {
  document
    .getElementById("searchPermit")
    .addEventListener("input", filterPermits);

  document
    .getElementById("statusFilter")
    .addEventListener("change", filterPermits);

  document
    .getElementById("sortFilter")
    .addEventListener("change", filterPermits);
}

function filterPermits() {
  const search = document
    .getElementById("searchPermit")
    .value.trim()
    .toLowerCase();

  const status = document.getElementById("statusFilter").value;

  const sort = document.getElementById("sortFilter").value;

  let filtered = permits.filter((permit) => {
    const matchesSearch =
      !search ||
      permit.propertyAddress.toLowerCase().includes(search) ||
      permit.propertyType.toLowerCase().includes(search) ||
      permit.constructionType.toLowerCase().includes(search);

    const matchesStatus = status === "all" || permit.status === status;

    return matchesSearch && matchesStatus;
  });

  filtered.sort((a, b) => {
    const dateA = new Date(a.createdAt);

    const dateB = new Date(b.createdAt);

    return sort === "newest" ? dateB - dateA : dateA - dateB;
  });

  displayPermits(filtered);
}

/* =========================================
   UTILITIES
========================================= */

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function escapeHTML(value) {
  const div = document.createElement("div");

  div.textContent = value ?? "";

  return div.innerHTML;
}

/* =========================================
   ACTIONS
========================================= */

function viewPermit(id) {
  window.location.href = `/permit-details.html?id=${id}`;
}

function handleLogout() {
  localStorage.removeItem("user");

  window.location.href = "/login.html";
}
