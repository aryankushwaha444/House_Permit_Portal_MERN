document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#registerForm");
  if (!form) return;
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const result = await api("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      localStorage.setItem(
        "user",
        JSON.stringify({ ...result.user, token: result.token })
      );
      window.location.assign("/dashboard/");
    } catch (error) {
      showMessage("#formMessage", error.message);
    }
  });
});
