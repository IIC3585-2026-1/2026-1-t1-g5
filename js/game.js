const DIFFICULTY_CONFIG = Object.freeze({
  easy: { pairsCount: 4, cols: 2, timeLimitSec: 45 },
  normal: { pairsCount: 8, cols: 4, timeLimitSec: 75 },
  hard: { pairsCount: 10, cols: 5, timeLimitSec: 90 },
});

const DEFAULT_DIFFICULTY = 'normal';
const MISMATCH_DELAY_MS = 1000;

let currentDifficulty = DEFAULT_DIFFICULTY;

let firstCard = null;
let secondCard = null;
let lockBoard = false;
let gameFinished = false;

let moves = 0;
let score = 0;

let timerIntervalId = null;
let timeLimitSec = DIFFICULTY_CONFIG[DEFAULT_DIFFICULTY].timeLimitSec;
let secondsLeft = timeLimitSec;

const board = document.getElementById('board');
const scoreEl = document.getElementById('score');
const movesEl = document.getElementById('moves');

const timerPanelEl = document.getElementById('timer-panel');
const timerValueEl = document.getElementById('timer-value');
const timerBarEl = document.getElementById('timer-bar');

const overlay = document.getElementById('overlay');
const overlayTitleEl = document.getElementById('overlay-title');
const finalScore = document.getElementById('final-score');
const finalMoves = document.getElementById('final-moves');
const starsEl = document.getElementById('stars');

function getDifficultyConfig(difficulty) {
  return DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG[DEFAULT_DIFFICULTY];
}

function formatTime(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function updateHUD() {
  if (scoreEl) scoreEl.textContent = String(score);
  if (movesEl) movesEl.textContent = String(moves);
}

function updateTimerUI() {
  if (timerValueEl) timerValueEl.textContent = formatTime(secondsLeft);
  if (!timerBarEl || timeLimitSec <= 0) return;

  const progress = Math.max(0, (secondsLeft / timeLimitSec) * 100);
  timerBarEl.style.setProperty('--progress', String(progress));

  if (timerPanelEl) {
    timerPanelEl.classList.toggle('warning', progress <= 40 && progress > 20);
    timerPanelEl.classList.toggle('danger', progress <= 20);
  }
}

function clearTimer() {
  if (timerIntervalId) {
    clearInterval(timerIntervalId);
    timerIntervalId = null;
  }
}

function finishGame(reason) {
  if (gameFinished) return;

  gameFinished = true;
  lockBoard = true;
  clearTimer();

  showVictory(reason);
}

function startTimer() {
  clearTimer();
  updateTimerUI();

  timerIntervalId = setInterval(() => {
    if (gameFinished) {
      clearTimer();
      return;
    }

    secondsLeft = Math.max(0, secondsLeft - 1);
    updateTimerUI();

    if (secondsLeft === 0) {
      finishGame('timeout');
    }
  }, 1000);
}

function renderBoardByDifficulty() {
  const { pairsCount, cols, timeLimitSec: difficultyTime } = getDifficultyConfig(currentDifficulty);
  timeLimitSec = difficultyTime;
  secondsLeft = difficultyTime;
  createBoard({ pairsCount, cols });
  if (board) board.style.gridTemplateColumns = `repeat(${cols}, var(--card-size))`;
  addCardListeners();
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
    startNewGame();
  });
}

function initRestart() {
  const restartBtn = document.getElementById('restart-btn');
  const playAgainBtn = document.getElementById('play-again-btn');

  restartBtn?.addEventListener('click', startNewGame);
  playAgainBtn?.addEventListener('click', startNewGame);
}

function addCardListeners() {
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    card.addEventListener('click', handleCardClick);
  });
}

function handleCardClick(e) {
  const card = e.currentTarget;

  if (lockBoard || gameFinished) return;
  if (card === firstCard) return;
  if (card.classList.contains('matched')) return;

  card.classList.add('flipped');

  if (!firstCard) {
    firstCard = card;
    return;
  }

  secondCard = card;
  lockBoard = true;
  checkMatch();
}

function checkMatch() {
  const isMatch = firstCard.dataset.emoji === secondCard.dataset.emoji;
  if (isMatch) {
    handleMatch();
  } else {
    handleError();
  }
}

function handleMatch() {
  firstCard.classList.add('matched');
  secondCard.classList.add('matched');

  showMatchMessage();

  score += 10;
  moves++;

  updateHUD();
  resetTurn();
  checkWin();
}

function handleError() {
  const first = firstCard;
  const second = secondCard;

  first.classList.add('error');
  second.classList.add('error');

  moves++;
  updateHUD();

  setTimeout(() => {
    first.classList.remove('flipped', 'error');
    second.classList.remove('flipped', 'error');
    resetTurn();
  }, MISMATCH_DELAY_MS);
}

function resetTurn() {
  firstCard = null;
  secondCard = null;
  lockBoard = gameFinished;
}

function resetGameState() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;
  gameFinished = false;

  moves = 0;
  score = 0;

  clearTimer();

  if (overlay) overlay.classList.add('hidden');
  if (overlayTitleEl) overlayTitleEl.textContent = '¡GANASTE!';
  if (board) board.classList.remove('show-match');

  updateHUD();
  updateTimerUI();
}

function checkWin() {
  const matched = document.querySelectorAll('.card.matched');
  const cards = document.querySelectorAll('.card');

  if (cards.length > 0 && matched.length === cards.length) {
    finishGame('win');
  }
}

function showVictory(reason = 'win') {
  if (finalScore) finalScore.textContent = String(score);
  if (finalMoves) finalMoves.textContent = String(moves);

  updateStars();

  if (overlayTitleEl) {
    overlayTitleEl.textContent = reason === 'timeout' ? '¡TIEMPO AGOTADO!' : '¡GANASTE!';
  }

  if (overlay) overlay.classList.remove('hidden');
}

function updateStars() {
  let stars = '★★★';
  if (moves > 20) stars = '★★';
  if (moves > 30) stars = '★';
  if (starsEl) starsEl.textContent = stars;
}

function showMatchMessage() {
  if (!board) return;

  board.classList.remove('show-match');
  void board.offsetWidth;
  board.classList.add('show-match');

  setTimeout(() => {
    board.classList.remove('show-match');
  }, 850);
}

function startNewGame() {
  resetGameState();
  renderBoardByDifficulty();
  startTimer();
}

function startGame() {
  initThemeToggle();
  initDifficultySelector();
  initRestart();
  startNewGame();
}

startGame();
