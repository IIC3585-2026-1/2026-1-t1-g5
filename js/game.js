const DIFFICULTY_CONFIG = Object.freeze({
  easy:   { pairsCount: 4, cols: 2 },
  normal: { pairsCount: 8, cols: 4 },
  hard:   { pairsCount: 10, cols: 5 },
});

const DEFAULT_DIFFICULTY = 'normal';
let currentDifficulty = DEFAULT_DIFFICULTY;

let firstCard = null;
let secondCard = null;
let lockBoard = false;

let moves = 0;
let score = 0;

const board = document.getElementById("board");
const scoreEl = document.getElementById("score");
const movesEl = document.getElementById("moves");

const overlay = document.getElementById("overlay");
const finalScore = document.getElementById("final-score");
const finalMoves = document.getElementById("final-moves");
const starsEl = document.getElementById("stars");

function getDifficultyConfig(difficulty) {
  return DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG[DEFAULT_DIFFICULTY];
}

function renderBoardByDifficulty() {
  const { pairsCount, cols } = getDifficultyConfig(currentDifficulty);
  createBoard({ pairsCount, cols });
  resetGameState();
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
    renderBoardByDifficulty();
  });
}

function initRestart() {
  const restartBtn = document.getElementById('restart-btn');
  const playAgainBtn = document.getElementById('play-again-btn');

  restartBtn?.addEventListener('click', renderBoardByDifficulty);
  playAgainBtn?.addEventListener('click', renderBoardByDifficulty);
}

function addCardListeners() {
  const cards = document.querySelectorAll(".card");

  cards.forEach(card => {
    card.addEventListener("click", handleCardClick);
  });
}

function handleCardClick(e) {
  const card = e.currentTarget;

  if (lockBoard) return;
  if (card === firstCard) return;
  if (card.classList.contains("matched")) return;

  card.classList.add("flipped");

  if (!firstCard) {
    firstCard = card;
    return;
  }

  secondCard = card;
  lockBoard = true;

  checkMatch();
}

function checkMatch() {
  const isMatch =
    firstCard.dataset.emoji === secondCard.dataset.emoji;

  if (isMatch) {
    handleMatch();
  } else {
    handleError();
  }
}

function handleMatch() {
  firstCard.classList.add("matched");
  secondCard.classList.add("matched");

  showMatchMessage();

  score += 10;
  moves++;

  updateHUD();
  resetTurn();
  checkWin();
}

function handleError() {
  firstCard.classList.add("error");
  secondCard.classList.add("error");

  moves++;
  updateHUD();

  setTimeout(() => {
    firstCard.classList.remove("flipped", "error");
    secondCard.classList.remove("flipped", "error");

    resetTurn();
  }, 1000);
}

function resetTurn() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;
}

function resetGameState() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;

  moves = 0;
  score = 0;

  overlay.classList.add("hidden");
  updateHUD();
}

function updateHUD() {
  scoreEl.textContent = score;
  movesEl.textContent = moves;
}

function checkWin() {
  const matched = document.querySelectorAll(".card.matched");

  if (matched.length === document.querySelectorAll(".card").length) {
    showVictory();
  }
}

function showVictory() {
  finalScore.textContent = score;
  finalMoves.textContent = moves;

  updateStars();

  overlay.classList.remove("hidden");
}

function updateStars() {
  let stars = "★★★";

  if (moves > 20) stars = "★★";
  if (moves > 30) stars = "★";

  starsEl.textContent = stars;
}

function showMatchMessage() {
  const msg = document.createElement("div");
  msg.textContent = "¡MATCH!";
  msg.classList.add("match-message");

  document.body.appendChild(msg);

  setTimeout(() => msg.remove(), 800);
}

function startGame() {
  initThemeToggle();
  initDifficultySelector();
  initRestart();
  renderBoardByDifficulty();
}

startGame();
