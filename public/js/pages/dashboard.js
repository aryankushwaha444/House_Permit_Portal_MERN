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

  menu.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  document.addEventListener("click", closeMenu);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
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

      ${
        permit.status === "Pending" || permit.status === "Rejected"
          ? `
            <button
              type="button"
              class="btn btn-outline"
              onclick="editPermit('${permit._id}')"
            >
              <i class="fa-solid fa-pen-to-square"></i>
              Edit
            </button>
          `
          : `
            <button
              type="button"
              class="btn btn-outline"
              onclick="viewPermit('${permit._id}')"
            >
              View Details
            </button>
          `
      }

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

async function viewPermit(id) {
  try {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || !user.token) {
      window.location.href = "/login.html";
      return;
    }

    const response = await fetch(`/api/permits/${id}/edit`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    });

    const permit = await response.json();

    if (!response.ok) {
      throw new Error(permit.error || "Failed to load permit details");
    }

    showPermitDetails(permit);
  } catch (error) {
    console.error("Error loading permit:", error);
    alert(error.message);
  }
}

function showPermitDetails(permit) {
  // Remove existing modal if present
  const existingModal = document.getElementById("permitDetailsModal");

  if (existingModal) {
    existingModal.remove();
  }

  const modal = document.createElement("div");

  modal.id = "permitDetailsModal";
  modal.className = "permit-modal";

  modal.innerHTML = `
    <div class="permit-modal-content">

      <div class="permit-modal-header">
        <div>
          <h2>Permit Details</h2>
          <span class="status-badge ${permit.status.toLowerCase()}">
            ${permit.status}
          </span>
        </div>

        <button
          type="button"
          class="permit-modal-close"
          id="closePermitModal"
          aria-label="Close"
        >
          &times;
        </button>
      </div>

      <div class="permit-modal-body">

        <div class="detail-row">
          <span class="detail-label">Applicant Name</span>
          <span class="detail-value">
            ${permit.applicantName || "-"}
          </span>
        </div>

        <div class="detail-row">
          <span class="detail-label">Property Address</span>
          <span class="detail-value">
            ${permit.propertyAddress || "-"}
          </span>
        </div>

        <div class="detail-row">
          <span class="detail-label">Property Type</span>
          <span class="detail-value">
            ${permit.propertyType || "-"}
          </span>
        </div>

        <div class="detail-row">
          <span class="detail-label">Construction Type</span>
          <span class="detail-value">
            ${permit.constructionType || "-"}
          </span>
        </div>

        <div class="detail-row">
          <span class="detail-label">Plot Area</span>
          <span class="detail-value">
            ${permit.plotArea || 0} sq. ft
          </span>
        </div>

        <div class="detail-row">
          <span class="detail-label">Building Area</span>
          <span class="detail-value">
            ${permit.buildingArea || 0} sq. ft
          </span>
        </div>

        <div class="detail-row">
          <span class="detail-label">Estimated Cost</span>
          <span class="detail-value">
            NPR ${Number(permit.estimatedCost || 0).toLocaleString()}
          </span>
        </div>

        ${
          permit.remarks
            ? `
              <div class="detail-row remarks-row">
                <span class="detail-label">Admin Remarks</span>
                <span class="detail-value">
                  ${permit.remarks}
                </span>
              </div>
            `
            : ""
        }

        ${
          permit.documents && permit.documents.length
            ? `
              <div class="documents-section">
                <h3>Documents</h3>

               ${[
                 ...new Map(
                   permit.documents.map((document) => [
                     `${document.fileName}-${document.filePath}`,
                     document,
                   ])
                 ).values(),
               ]
                 .map(
                   (document) => `
                     <div class="document-item">
                    <i class="fa-solid fa-file"></i>
                    <span>${escapeHTML(document.fileName)}</span>
                   <a
                   href="${document.filePath}"
                   target="_blank"
                   rel="noopener noreferrer"
                   >
                    View
                   </a>
                   </div>
                  `
                 )
                 .join("")}
              </div>
            `
            : ""
        }

      </div>

      <div class="permit-modal-footer">
        <button
          type="button"
          class="btn btn-outline"
          id="closePermitModalFooter"
        >
          Close
        </button>
      </div>

    </div>
  `;

  document.body.appendChild(modal);

  // Prevent background scrolling
  document.body.style.overflow = "hidden";

  // Close button
  document
    .getElementById("closePermitModal")
    .addEventListener("click", closePermitDetails);

  document
    .getElementById("closePermitModalFooter")
    .addEventListener("click", closePermitDetails);

  // Close when clicking outside popup
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closePermitDetails();
    }
  });

  // Close with ESC key
  document.addEventListener("keydown", handlePermitModalEscape);
}

function closePermitDetails() {
  const modal = document.getElementById("permitDetailsModal");

  if (modal) {
    modal.remove();
  }

  document.body.style.overflow = "";

  document.removeEventListener("keydown", handlePermitModalEscape);
}

function handlePermitModalEscape(event) {
  if (event.key === "Escape") {
    closePermitDetails();
  }
}

function editPermit(id) {
  window.location.href = `/permit-application.html?id=${id}`;
}

function handleLogout() {
  localStorage.removeItem("user");
  window.location.href = "/login.html";
}
