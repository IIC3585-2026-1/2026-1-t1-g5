function initThemeToggle() {
  const themeBtn = document.getElementById('theme-btn');
  if (!themeBtn) return;

  themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('light');
  });
}

function startGame() {
    createBoard();
    initThemeToggle();
  }
  
  startGame();