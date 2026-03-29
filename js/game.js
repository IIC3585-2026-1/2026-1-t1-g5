const DIFFICULTY_CONFIG = Object.freeze({
  easy: { pairsCount: 4, cols: 2, timeLimitSec: 45 },
  normal: { pairsCount: 8, cols: 4, timeLimitSec: 75 },
  hard: { pairsCount: 10, cols: 5, timeLimitSec: 90 },
});

const DEFAULT_DIFFICULTY = 'normal';
const FLIP_BACK_DELAY_MS = 650;
const MATCH_FLASH_MS = 900;

const boardEl = document.getElementById('board');
const scoreEl = document.getElementById('score');
const movesEl = document.getElementById('moves');
const timerPanelEl = document.getElementById('timer-panel');
const timerValueEl = document.getElementById('timer-value');
const timerBarEl = document.getElementById('timer-bar');
const overlayEl = document.getElementById('overlay');
const overlayTitleEl = document.getElementById('overlay-title');
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
  gameFinished: false,
  moves: 0,
  matchedPairs: 0,
  totalPairs: DIFFICULTY_CONFIG[DEFAULT_DIFFICULTY].pairsCount,
  score: 0,
  flashTimeoutId: null,
  timerIntervalId: null,
  timeLimitSec: DIFFICULTY_CONFIG[DEFAULT_DIFFICULTY].timeLimitSec,
  secondsLeft: DIFFICULTY_CONFIG[DEFAULT_DIFFICULTY].timeLimitSec,
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

function formatTime(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function updateHud() {
  if (scoreEl) scoreEl.textContent = String(state.score);
  if (movesEl) movesEl.textContent = String(state.moves);
}

function updateTimerUi() {
  if (timerValueEl) timerValueEl.textContent = formatTime(state.secondsLeft);
  if (!timerBarEl || state.timeLimitSec <= 0) return;

  const progress = Math.max(0, (state.secondsLeft / state.timeLimitSec) * 100);
  timerBarEl.style.setProperty('--timer-progress', String(progress));

  if (timerPanelEl) {
    timerPanelEl.classList.toggle('warning', progress <= 40 && progress > 20);
    timerPanelEl.classList.toggle('danger', progress <= 20);
  }
}

function clearTimer() {
  if (state.timerIntervalId) {
    clearInterval(state.timerIntervalId);
    state.timerIntervalId = null;
  }
}

function startTimer() {
  clearTimer();
  updateTimerUi();

  state.timerIntervalId = setInterval(() => {
    if (state.gameFinished) {
      clearTimer();
      return;
    }

    state.secondsLeft = Math.max(0, state.secondsLeft - 1);
    updateTimerUi();

    if (state.secondsLeft === 0) {
      finishGame('timeout');
    }
  }, 1000);
}

function resetTurn() {
  state.firstCard = null;
  state.secondCard = null;
  state.lockBoard = state.gameFinished;
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

function showOverlay(title) {
  if (overlayTitleEl) overlayTitleEl.textContent = title;
  if (finalScoreEl) finalScoreEl.textContent = String(state.score);
  if (finalMovesEl) finalMovesEl.textContent = String(state.moves);
  if (starsEl) starsEl.textContent = getStarsByScore();
  if (overlayEl) overlayEl.classList.remove('hidden');
}

function hideOverlay() {
  if (overlayEl) overlayEl.classList.add('hidden');
}

function finishGame(reason) {
  if (state.gameFinished) return;
  state.gameFinished = true;
  state.lockBoard = true;
  clearTimer();

  if (reason === 'win') {
    showOverlay('¡GANASTE!');
  } else {
    showOverlay('¡TIEMPO AGOTADO!');
  }
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
    finishGame('win');
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
  if (!boardEl || state.lockBoard || state.gameFinished) return;

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
  const { pairsCount, cols, timeLimitSec } = getDifficultyConfig(state.difficulty);
  state.totalPairs = pairsCount;
  state.timeLimitSec = timeLimitSec;
  state.secondsLeft = timeLimitSec;
  createBoard({ pairsCount, cols });
  if (boardEl) boardEl.style.gridTemplateColumns = `repeat(${cols}, var(--card-size))`;
}

function resetGameState() {
  state.firstCard = null;
  state.secondCard = null;
  state.lockBoard = false;
  state.gameFinished = false;
  state.moves = 0;
  state.matchedPairs = 0;
  state.score = 0;
  if (state.flashTimeoutId) clearTimeout(state.flashTimeoutId);
  state.flashTimeoutId = null;
  if (boardEl) boardEl.classList.remove('show-match');
  clearTimer();
  updateHud();
}

function startNewGame() {
  hideOverlay();
  resetGameState();
  renderBoardByDifficulty();
  updateTimerUi();
  startTimer();
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
