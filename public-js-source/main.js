const backdrop = document.querySelector(".backdrop");
const sideDrawer = document.querySelector(".mobile-nav");
const menuToggle = document.querySelector("#side-menu-toggle");

function backdropClickHandler() {
  backdrop.style.display = "none";
  sideDrawer.classList.remove("open");
}

function removeMessage() {
  const userMessage = document.querySelector(".user-message");
  const userMessageLine = document.querySelector(".user-message hr");

  userMessage && userMessage.classList.add("show");
  let userMessageLineWidth = userMessageLine?.clientWidth || 0;

  const increaseWidth = setInterval(() => {
    if (!userMessageLineWidth) return;
    userMessageLineWidth--;
    userMessageLine.style.width = `${userMessageLineWidth}px`;
  }, 3000 / userMessageLineWidth);
  setTimeout(() => {
    clearInterval(increaseWidth);
    userMessage?.remove();
  }, 3000);
}

function showMessage(message, type = "success") {
  const parent = document.createElement(`div`);
  parent.className = `user-message ${
    type === "error" ? "user-message--error" : ""
  }`;
  parent.innerHTML = `<p>${message}</p><hr>`;
  document.querySelector("body").append(parent);
  removeMessage();
}

function menuToggleClickHandler() {
  backdrop.style.display = "block";
  sideDrawer.classList.add("open");
}

backdrop.addEventListener("click", backdropClickHandler);
menuToggle.addEventListener("click", menuToggleClickHandler);
