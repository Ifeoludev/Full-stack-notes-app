document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.getElementById("menu-btn");
  const menuContent = document.getElementById("menu-content");

  if (menuBtn && menuContent) {
    menuBtn.addEventListener("click", () => {
      menuContent.classList.toggle("hidden");
    });
  }
});
