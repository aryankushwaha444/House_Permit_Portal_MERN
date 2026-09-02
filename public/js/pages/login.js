document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#loginForm");
  if (!form) return;
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const result = await api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      localStorage.setItem(
        "user",
        JSON.stringify({ ...result.user, token: result.token })
      );
      window.location.assign(
        result.user.role === "admin" ? "/admin-dashboard.html" : "/dashboard/"
      );
    } catch (error) {
      showMessage("#formMessage", error.message);
    }
  });
});
