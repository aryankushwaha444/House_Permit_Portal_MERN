function showMessage(target, message, type = "error") {
  const node =
    typeof target === "string" ? document.querySelector(target) : target;
  if (node) {
    node.textContent = message;
    node.className = `message ${type}`;
  }
}
function escapeHTML(value) {
  const node = document.createElement("div");
  node.textContent = value ?? "";
  return node.innerHTML;
}
