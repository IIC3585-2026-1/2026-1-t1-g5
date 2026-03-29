const DIFFICULTY_CONFIG = Object.freeze({
  easy: { pairsCount: 4, cols: 2 },
  normal: { pairsCount: 8, cols: 4 },
  hard: { pairsCount: 10, cols: 5 },
});

const DEFAULT_DIFFICULTY = 'normal';
const FLIP_BACK_DELAY_MS = 650;
const MATCH_FLASH_MS = 900;

const boardEl = document.getElementById('board');
const scoreEl = document.getElementById('score');
const movesEl = document.getElementById('moves');
const overlayEl = document.getElementById('overlay');
const finalScoreEl = document.getElementById('final-score');
const finalMovesEl = document.getElementById('final-moves');
const starsEl = document.getElementById('stars');
const themeBtn = document.getElementById('theme-btn');
const difficultySelect = document.getElementById('difficulty-select');
const restartBtn = document.getElementById('restart-btn');
const playAgainBtn = document.getElementById('play-again-btn');

const state = {
  difficulty: DEFAULT_DIFFICULTY,
  firstCard: null,
  secondCard: null,
  lockBoard: false,
  moves: 0,
  matchedPairs: 0,
  totalPairs: DIFFICULTY_CONFIG[DEFAULT_DIFFICULTY].pairsCount,
  score: 0,
  flashTimeoutId: null,
};

function getDifficultyConfig(difficulty) {
  return DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG[DEFAULT_DIFFICULTY];
}

function calculateScore() {
  const misses = state.moves - state.matchedPairs;
  return Math.max(0, state.matchedPairs * 100 - misses * 20);
}

function getStarsByScore() {
  const maxScore = state.totalPairs * 100;
  const ratio = maxScore === 0 ? 0 : state.score / maxScore;
  if (ratio >= 0.85) return '★★★';
  if (ratio >= 0.6) return '★★';
  return '★';
}

function updateHud() {
  if (scoreEl) scoreEl.textContent = String(state.score);
  if (movesEl) movesEl.textContent = String(state.moves);
}

function resetTurn() {
  state.firstCard = null;
  state.secondCard = null;
  state.lockBoard = false;
}

function showMatchFlash() {
  if (!boardEl) return;

  boardEl.classList.remove('show-match');
  void boardEl.offsetWidth;
  boardEl.classList.add('show-match');

  if (state.flashTimeoutId) clearTimeout(state.flashTimeoutId);
  state.flashTimeoutId = setTimeout(() => {
    boardEl.classList.remove('show-match');
  }, MATCH_FLASH_MS);
}

function showWinOverlay() {
  if (finalScoreEl) finalScoreEl.textContent = String(state.score);
  if (finalMovesEl) finalMovesEl.textContent = String(state.moves);
  if (starsEl) starsEl.textContent = getStarsByScore();
  if (overlayEl) overlayEl.classList.remove('hidden');
}

function hideWinOverlay() {
  if (overlayEl) overlayEl.classList.add('hidden');
}

function handleMatch() {
  state.firstCard.classList.add('matched');
  state.secondCard.classList.add('matched');

  state.matchedPairs += 1;
  state.score = calculateScore();
  updateHud();
  showMatchFlash();
  resetTurn();

  if (state.matchedPairs === state.totalPairs) {
    showWinOverlay();
  }
}

function handleMismatch() {
  const first = state.firstCard;
  const second = state.secondCard;

  first.classList.add('error');
  second.classList.add('error');

  state.score = calculateScore();
  updateHud();

  setTimeout(() => {
    first.classList.remove('flipped', 'error');
    second.classList.remove('flipped', 'error');
    resetTurn();
  }, FLIP_BACK_DELAY_MS);
}

function onCardClick(event) {
  if (!boardEl || state.lockBoard) return;

  const clickedCard = event.target.closest('.card');
  if (!clickedCard || !boardEl.contains(clickedCard)) return;
  if (clickedCard.classList.contains('flipped') || clickedCard.classList.contains('matched')) return;

  clickedCard.classList.add('flipped');

  if (!state.firstCard) {
    state.firstCard = clickedCard;
    return;
  }

  state.secondCard = clickedCard;
  state.lockBoard = true;
  state.moves += 1;

  if (state.firstCard.dataset.emoji === state.secondCard.dataset.emoji) {
    handleMatch();
  } else {
    handleMismatch();
  }
}

function renderBoardByDifficulty() {
  const { pairsCount, cols } = getDifficultyConfig(state.difficulty);
  state.totalPairs = pairsCount;
  createBoard({ pairsCount, cols });
  if (boardEl) boardEl.style.gridTemplateColumns = `repeat(${cols}, var(--card-size))`;
}

function resetGameState() {
  state.firstCard = null;
  state.secondCard = null;
  state.lockBoard = false;
  state.moves = 0;
  state.matchedPairs = 0;
  state.score = 0;
  updateHud();
}

function startNewGame() {
  hideWinOverlay();
  resetGameState();
  renderBoardByDifficulty();
}

function initThemeToggle() {
  if (!themeBtn) return;
  themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('light');
  });
}

function initDifficultySelector() {
  if (!difficultySelect) return;
  difficultySelect.value = state.difficulty;

  difficultySelect.addEventListener('change', (event) => {
    const nextDifficulty = event.target.value;
    if (!DIFFICULTY_CONFIG[nextDifficulty]) return;
    state.difficulty = nextDifficulty;
    startNewGame();
  });
}

function initRestartButtons() {
  if (restartBtn) restartBtn.addEventListener('click', startNewGame);
  if (playAgainBtn) playAgainBtn.addEventListener('click', startNewGame);
}

function startGame() {
  if (boardEl) boardEl.addEventListener('click', onCardClick);
  initThemeToggle();
  initDifficultySelector();
  initRestartButtons();
  startNewGame();
}

startGame();
