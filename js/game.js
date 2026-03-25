const DIFFICULTY_CONFIG = Object.freeze({
  easy:   { pairsCount: 4, cols: 2 },
  normal: { pairsCount: 8, cols: 4 },
  hard:   { pairsCount: 10, cols: 5 },
});

const DEFAULT_DIFFICULTY = 'normal';
let currentDifficulty = DEFAULT_DIFFICULTY;

function getDifficultyConfig(difficulty) {
  return DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG[DEFAULT_DIFFICULTY];
}

function renderBoardByDifficulty() {
  const { pairsCount, cols } = getDifficultyConfig(currentDifficulty);
  createBoard({ pairsCount, cols });
}

function initThemeToggle() {
  const themeBtn = document.getElementById('theme-btn');
  if (!themeBtn) return;

  themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('light');
  });
}

function initDifficultySelector() {
  const difficultySelect = document.getElementById('difficulty-select');
  if (!difficultySelect) return;

  difficultySelect.value = currentDifficulty;

  difficultySelect.addEventListener('change', (event) => {
    const selected = event.target.value;
    if (!DIFFICULTY_CONFIG[selected]) return;

    currentDifficulty = selected;
    renderBoardByDifficulty();
  });
}

function initRestart() {
  const restartBtn = document.getElementById('restart-btn');
  if (!restartBtn) return;

  restartBtn.addEventListener('click', () => {
    renderBoardByDifficulty();
  });
}

function startGame() {
  initThemeToggle();
  initDifficultySelector();
  initRestart();
  renderBoardByDifficulty();
}

startGame();
