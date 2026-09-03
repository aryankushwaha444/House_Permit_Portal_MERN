let adminPermits = [];
let adminUsers = [];

document.addEventListener("DOMContentLoaded", initializeAdmin);

async function initializeAdmin() {
  const user = requireAuth();

  if (!user) return;

  if (user.role !== "admin") {
    window.location.assign("/dashboard/");
    return;
  }

  setupAdminEvents();

  try {
    await loadAdminPermits();

    if (document.getElementById("userTableBody")) {
      await loadAdminUsers();
    }
  } catch (error) {
    console.error("Admin dashboard error:", error);
    showMessage("#formMessage", error.message);
  }
}

function setupAdminEvents() {
  const searchInput = document.getElementById("permitSearch");
  const statusFilter = document.getElementById("permitStatusFilter");

  if (searchInput) {
    searchInput.addEventListener("input", filterAdminPermits);
  }

  if (statusFilter) {
    statusFilter.addEventListener("change", filterAdminPermits);
  }

  const userSearch = document.getElementById("userSearch");
  const userRoleFilter = document.getElementById("userRoleFilter");

  if (userSearch) {
    userSearch.addEventListener("input", filterAdminUsers);
  }

  if (userRoleFilter) {
    userRoleFilter.addEventListener("change", filterAdminUsers);
  }
}

async function loadAdminPermits() {
  const permitTable = document.getElementById("permitTableBody");

  // User Management page does not have permit table
  if (!permitTable) {
    return;
  }

  adminPermits = await api("/api/admin/permits");

  updateStatistics();
  displayAdminPermits(adminPermits);
}

async function loadAdminUsers() {
  adminUsers = await api("/api/admin/users");

  const element = document.getElementById("totalUsers");

  if (element) {
    element.textContent = adminUsers.length;
  }

  displayAdminUsers(adminUsers);
}

function displayAdminUsers(list) {
  const tbody = document.getElementById("userTableBody");

  if (!tbody) return;

  if (!list.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-table">
          No users found.
        </td>
      </tr>
    `;

    return;
  }

  tbody.innerHTML = list
    .map(
      (user) => `
        <tr>
          <td>
            <strong>
              ${escapeHTML(user.fullName)}
            </strong>
          </td>

          <td>
            ${escapeHTML(user.email)}
          </td>

          <td>
            ${escapeHTML(user.phone)}
          </td>

          <td>
            ${escapeHTML(user.address)}
          </td>

          <td>
            <span class="admin-role ${user.role}">
              ${escapeHTML(user.role)}
            </span>
          </td>

          <td>
            <button
              type="button"
              class="admin-view-btn"
              onclick="editAdminUser('${user._id}')"
            >
              <i class="fa-solid fa-pen"></i>
              Edit
            </button>
          </td>
        </tr>
      `
    )
    .join("");
}

function filterAdminUsers() {
  const search =
    document.getElementById("userSearch")?.value.trim().toLowerCase() || "";

  const role = document.getElementById("userRoleFilter")?.value || "all";

  const filtered = adminUsers.filter((user) => {
    const matchesSearch =
      !search ||
      user.fullName?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.phone?.toLowerCase().includes(search) ||
      user.address?.toLowerCase().includes(search);

    const matchesRole = role === "all" || user.role === role;

    return matchesSearch && matchesRole;
  });

  displayAdminUsers(filtered);
}

function editAdminUser(id) {
  const user = adminUsers.find((item) => item._id === id);

  if (!user) {
    alert("User not found");
    return;
  }

  showUserEditModal(user);
}

function showUserEditModal(user) {
  const existing = document.getElementById("adminUserModal");

  if (existing) {
    existing.remove();
  }

  const modal = document.createElement("div");

  modal.id = "adminUserModal";
  modal.className = "admin-modal";

  modal.innerHTML = `
    <div class="admin-modal-content admin-user-modal">

      <div class="admin-modal-header">
        <div>
          <h2>Edit User</h2>
          <p class="admin-user-modal-subtitle">
            ${escapeHTML(user.fullName)}
          </p>
        </div>

        <button
          type="button"
          class="admin-modal-close"
          id="closeUserModal"
          aria-label="Close"
        >
          &times;
        </button>
      </div>

      <div class="admin-modal-body">

        <div class="admin-user-info">
          <div>
            <span>Full Name</span>
            <strong>${escapeHTML(user.fullName)}</strong>
          </div>

          <div>
            <span>Email</span>
            <strong>${escapeHTML(user.email)}</strong>
          </div>
        </div>

        <div class="admin-remarks">
          <label for="userPassword">
            New Password
          </label>

          <input
            type="password"
            id="userPassword"
            minlength="6"
            placeholder="Leave blank to keep current password"
            autocomplete="new-password"
          />

          <small>
            Minimum 6 characters. Leave blank if you do not want
            to change the password.
          </small>
        </div>

        <div class="admin-remarks">
          <label for="userRole">
            Role
          </label>

          <select id="userRole">
            <option value="user" ${user.role === "user" ? "selected" : ""}>
              User
            </option>

            <option value="admin" ${user.role === "admin" ? "selected" : ""}>
              Admin
            </option>
          </select>
        </div>

      </div>

      <div class="admin-modal-footer">

        <button
          type="button"
          class="admin-action-btn approve"
          onclick="saveAdminUser('${user._id}')"
        >
          <i class="fa-solid fa-save"></i>
          Save Changes
        </button>

      </div>

    </div>
  `;

  document.body.appendChild(modal);

  document.body.style.overflow = "hidden";

  document
    .getElementById("closeUserModal")
    .addEventListener("click", closeUserModal);

  document
    .getElementById("closeUserModalFooter")
    .addEventListener("click", closeUserModal);

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeUserModal();
    }
  });

  document.addEventListener("keydown", handleUserModalEscape);
}

async function saveAdminUser(id) {
  const password = document.getElementById("userPassword")?.value || "";

  const role = document.getElementById("userRole")?.value || "user";

  if (password && password.length < 6) {
    alert("Password must be at least 6 characters.");
    return;
  }

  const confirmation = confirm("Are you sure you want to update this user?");

  if (!confirmation) {
    return;
  }

  const body = {
    role,
  };

  if (password) {
    body.password = password;
  }

  try {
    await api(`/api/admin/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });

    closeUserModal();

    await loadAdminUsers();

    showMessage("#formMessage", "User updated successfully.");
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
}

function closeUserModal() {
  const modal = document.getElementById("adminUserModal");

  if (modal) {
    modal.remove();
  }

  document.body.style.overflow = "";

  document.removeEventListener("keydown", handleUserModalEscape);
}

function handleUserModalEscape(event) {
  if (event.key === "Escape") {
    closeUserModal();
  }
}

function updateStatistics() {
  const total = adminPermits.length;

  const pending = adminPermits.filter(
    (permit) => permit.status === "Pending"
  ).length;

  const approved = adminPermits.filter(
    (permit) => permit.status === "Approved"
  ).length;

  const rejected = adminPermits.filter(
    (permit) => permit.status === "Rejected"
  ).length;

  document.getElementById("totalPermits").textContent = total;
  document.getElementById("pendingPermits").textContent = pending;
  document.getElementById("approvedPermits").textContent = approved;
  document.getElementById("rejectedPermits").textContent = rejected;
}

function displayAdminPermits(list) {
  const tbody = document.getElementById("permitTableBody");

  if (!tbody) return;

  if (!list.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="empty-table">
          No permit applications found.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = list
    .map(
      (permit) => `
        <tr>
          <td>
            <strong>
              ${escapeHTML(permit.applicantName)}
            </strong>
          </td>

          <td>
            ${escapeHTML(permit.propertyAddress)}
          </td>

          <td>
            ${escapeHTML(permit.propertyType)}
          </td>

          <td>
            ${escapeHTML(permit.constructionType)}
          </td>

          <td>
            ${formatDate(permit.createdAt)}
          </td>

          <td>
            <span class="admin-status ${permit.status.toLowerCase()}">
              ${escapeHTML(permit.status)}
            </span>
          </td>

          <td>
            <button
              type="button"
              class="admin-view-btn"
              onclick="viewAdminPermit('${permit._id}')"
            >
              <i class="fa-solid fa-eye"></i>
              View
            </button>
          </td>
        </tr>
      `
    )
    .join("");
}

function filterAdminPermits() {
  const search =
    document.getElementById("permitSearch")?.value.trim().toLowerCase() || "";

  const status = document.getElementById("permitStatusFilter")?.value || "all";

  const filtered = adminPermits.filter((permit) => {
    const matchesSearch =
      !search ||
      permit.applicantName?.toLowerCase().includes(search) ||
      permit.propertyAddress?.toLowerCase().includes(search) ||
      permit.propertyType?.toLowerCase().includes(search) ||
      permit.constructionType?.toLowerCase().includes(search);

    const matchesStatus = status === "all" || permit.status === status;

    return matchesSearch && matchesStatus;
  });

  displayAdminPermits(filtered);
}

async function viewAdminPermit(id) {
  try {
    const permit = await api(`/api/admin/permits/${id}`);

    showAdminPermitModal(permit);
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
}

function showAdminPermitModal(permit) {
  const existing = document.getElementById("adminPermitModal");

  if (existing) {
    existing.remove();
  }

  const documents =
    permit.documents && permit.documents.length
      ? [
          ...new Map(
            permit.documents.map((document) => [
              `${document.fileName}-${document.filePath}`,
              document,
            ])
          ).values(),
        ]
      : [];

  const modal = document.createElement("div");

  modal.id = "adminPermitModal";
  modal.className = "admin-modal";

  modal.innerHTML = `
    <div class="admin-modal-content">

      <div class="admin-modal-header">

        <div>
          <h2>Permit Details</h2>

          <span class="admin-status ${permit.status.toLowerCase()}">
            ${escapeHTML(permit.status)}
          </span>
        </div>

        <button
          type="button"
          class="admin-modal-close"
          aria-label="Close"
          id="closeAdminModal"
        >
          &times;
        </button>

      </div>

      <div class="admin-modal-body">

        <div class="admin-detail-grid">

          <div class="admin-detail">
            <span>Applicant Name</span>
            <strong>
              ${escapeHTML(permit.applicantName)}
            </strong>
          </div>

          <div class="admin-detail">
            <span>Property Address</span>
            <strong>
              ${escapeHTML(permit.propertyAddress)}
            </strong>
          </div>

          <div class="admin-detail">
            <span>Property Type</span>
            <strong>
              ${escapeHTML(permit.propertyType)}
            </strong>
          </div>

          <div class="admin-detail">
            <span>Construction Type</span>
            <strong>
              ${escapeHTML(permit.constructionType)}
            </strong>
          </div>

          <div class="admin-detail">
            <span>Plot Area</span>
            <strong>
              ${permit.plotArea} sq. ft
            </strong>
          </div>

          <div class="admin-detail">
            <span>Building Area</span>
            <strong>
              ${permit.buildingArea} sq. ft
            </strong>
          </div>

          <div class="admin-detail">
            <span>Estimated Cost</span>
            <strong>
              NPR ${Number(permit.estimatedCost || 0).toLocaleString()}
            </strong>
          </div>

          <div class="admin-detail">
            <span>Submitted</span>
            <strong>
              ${formatDate(permit.createdAt)}
            </strong>
          </div>

        </div>

        <div class="admin-documents">

          <h3>Documents</h3>

          ${
            documents.length
              ? documents
                  .map(
                    (document) => `
                      <div class="admin-document">

                        <i class="fa-solid fa-file"></i>

                        <span>
                          ${escapeHTML(document.fileName)}
                        </span>

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
                  .join("")
              : `<p>No documents uploaded.</p>`
          }

        </div>

        <div class="admin-remarks">

          <label for="adminRemarks">
            Admin Remarks
          </label>

          <textarea
            id="adminRemarks"
            rows="4"
            placeholder="Enter remarks for the applicant..."
          >${escapeHTML(permit.remarks || "")}</textarea>

        </div>

      </div>

      <div class="admin-modal-footer">

        <button
          type="button"
          class="admin-action-btn approve"
          onclick="changePermitStatus('${permit._id}', 'Approved')"
        >
          <i class="fa-solid fa-check"></i>
          Approve
        </button>

        <button
          type="button"
          class="admin-action-btn reject"
          onclick="changePermitStatus('${permit._id}', 'Rejected')"
        >
          <i class="fa-solid fa-xmark"></i>
          Reject
        </button>

      </div>

    </div>
  `;

  document.body.appendChild(modal);

  document.body.style.overflow = "hidden";

  document
    .getElementById("closeAdminModal")
    .addEventListener("click", closeAdminModal);

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeAdminModal();
    }
  });

  document.addEventListener("keydown", handleAdminModalEscape);
}

async function changePermitStatus(id, status) {
  const remarks = document.getElementById("adminRemarks")?.value.trim() || "";

  const confirmation = confirm(
    `Are you sure you want to ${status.toLowerCase()} this permit?`
  );

  if (!confirmation) {
    return;
  }

  try {
    await api(`/api/admin/permits/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({
        status,
        remarks,
      }),
    });

    closeAdminModal();

    await loadAdminPermits();

    showMessage("#formMessage", `Permit ${status.toLowerCase()} successfully.`);
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
}

function closeAdminModal() {
  const modal = document.getElementById("adminPermitModal");

  if (modal) {
    modal.remove();
  }

  document.body.style.overflow = "";

  document.removeEventListener("keydown", handleAdminModalEscape);
}

function handleAdminModalEscape(event) {
  if (event.key === "Escape") {
    closeAdminModal();
  }
}

function formatDate(date) {
  if (!date) return "-";

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
