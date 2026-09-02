document.addEventListener("DOMContentLoaded", async () => {
  const user = requireAuth();
  if (!user || user.role !== "admin")
    return window.location.assign("/dashboard/");
  const list = document.querySelector("#permitList");
  if (!list) return;
  try {
    const permits = await api("/api/admin/permits");
    list.innerHTML = permits
      .map(
        (permit) =>
          `<li>${escapeHTML(permit.applicantName)} — ${escapeHTML(
            permit.status
          )}</li>`
      )
      .join("");
  } catch (error) {
    showMessage("#formMessage", error.message);
  }
});
