document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#permitForm");
  if (!form) return;
  requireAuth();
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      await api("/api/permits", { method: "POST", body: new FormData(form) });
      window.location.assign("/dashboard/");
    } catch (error) {
      showMessage("#formMessage", error.message);
    }
  });
});
