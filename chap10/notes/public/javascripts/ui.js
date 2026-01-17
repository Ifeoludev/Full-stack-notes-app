document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.getElementById("nav-toggle");
  const navContent = document.getElementById("nav-content");

  if (navToggle && navContent) {
    navToggle.addEventListener("click", () => {
      // Toggle the 'hidden' class to show/hide the menu
      navContent.classList.toggle("hidden");
      // Also ensure it stacks vertically on mobile
      navContent.classList.toggle("flex-col");
    });
  }
});
