// Configuración base del juego por dificultad: cantidad de pares, columnas del tablero y tiempo límite.
const DIFFICULTY_CONFIG = Object.freeze({
  easy: { pairsCount: 4, cols: 2, timeLimitSec: 45 },
  normal: { pairsCount: 8, cols: 4, timeLimitSec: 75 },
  hard: { pairsCount: 10, cols: 5, timeLimitSec: 90 },
});

const DEFAULT_DIFFICULTY = 'normal'; // Dificultad inicial al cargar la página
const MISMATCH_DELAY_MS = 1000; // Espera antes de volver a ocultar cartas cuando no hay match

let currentDifficulty = DEFAULT_DIFFICULTY;

// Estado del turno de cartas
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let gameFinished = false;

// Estado de progreso del juego
let moves = 0;
let score = 0;

// Estado del temporizador
let timerIntervalId = null;
let timeLimitSec = DIFFICULTY_CONFIG[DEFAULT_DIFFICULTY].timeLimitSec;
let secondsLeft = timeLimitSec;

// Referencias principales del DOM
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

// Obtiene la configuración de una dificultad o hace fallback a la dificultad por defecto.
function getDifficultyConfig(difficulty) {
  return DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG[DEFAULT_DIFFICULTY];
}

// Convierte segundos a formato mm:ss para mostrar en la UI del timer.
function formatTime(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Actualiza HUD principal del juego: score y movimientos.
function updateHUD() {
  if (scoreEl) scoreEl.textContent = String(score);
  if (movesEl) movesEl.textContent = String(moves);
}

// Función que actualiza UI del timerm actualiza texto mm:ss, calcula porcentaje de progreso
// actualiza variable CSS --progress para animar la barra y aplica clases visuales warning/danger según umbral
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

// Función que detiene el intervalo del timer si existe, para evitar timers duplicados.
function clearTimer() {
  if (timerIntervalId) {
    clearInterval(timerIntervalId);
    timerIntervalId = null;
  }
}

// Función que cierra la partida de forma segura,
// bloquea interacción, detiene timer y muestra resultado final.
function finishGame(reason) {
  if (gameFinished) return;

  gameFinished = true;
  lockBoard = true;
  clearTimer();

  showVictory(reason);
}

// Función que inicia o reinicia el countdown del juego.
// Cada segundo descuenta tiempo, actualiza UI y termina partida al llegar a 0.
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

// Función que renderiza tablero según dificultad seleccionada:
// define pares, columnas y tiempo base de esa dificultad.
function renderBoardByDifficulty() {
  const { pairsCount, cols, timeLimitSec: difficultyTime } = getDifficultyConfig(currentDifficulty);
  timeLimitSec = difficultyTime;
  secondsLeft = difficultyTime;
  createBoard({ pairsCount, cols });
  if (board) board.style.gridTemplateColumns = `repeat(${cols}, var(--card-size))`;
  addCardListeners();
}

// Función que inicializa botón de tema claro/oscuro.
function initThemeToggle() {
  const themeBtn = document.getElementById('theme-btn');
  if (!themeBtn) return;

  themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('light');
  });
}

// Función que inicializa selector de dificultad y reinicia partida cuando cambia el valor.
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

// Función que inicializa botones de reinicio, restart en controles y play again dentro del overlay final
function initRestart() {
  const restartBtn = document.getElementById('restart-btn');
  const playAgainBtn = document.getElementById('play-again-btn');

  restartBtn?.addEventListener('click', startNewGame);
  playAgainBtn?.addEventListener('click', startNewGame);
}

// Función que conecta evento click a cada carta actual del tablero.
function addCardListeners() {
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    card.addEventListener('click', handleCardClick);
  });
}

// Función principal de click en cartam valida estado de turno, voltea carta y comparación de par.
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

// Función que compara cartas seleccionadas por su emoji.
function checkMatch() {
  const isMatch = firstCard.dataset.emoji === secondCard.dataset.emoji;
  if (isMatch) {
    handleMatch();
  } else {
    handleError();
  }
}

// Función que maneja caso correcto, marca cartas como matched, suma puntaje/moves, actualiza HUD y revisa victoria.
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

// Función que maneja caso incorrectom, marca error, suma movimiento y luego revierte el flip tras delay.
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

// Funciín que limpia selección de cartas y desbloquea tablero según estado del juego.
function resetTurn() {
  firstCard = null;
  secondCard = null;
  lockBoard = gameFinished;
}

// Función que reinicia estado completo de partida, cartas seleccionadas, flags de bloqueo, puntaje/moves, timer y estado visual.
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

// Función que verifica victoria, todas las cartas están en estado matched.
function checkWin() {
  const matched = document.querySelectorAll('.card.matched');
  const cards = document.querySelectorAll('.card');

  if (cards.length > 0 && matched.length === cards.length) {
    finishGame('win');
  }
}

// Función que muestra overlay final con datos de partida y título según motivo de cierre.
function showVictory(reason = 'win') {
  if (finalScore) finalScore.textContent = String(score);
  if (finalMoves) finalMoves.textContent = String(moves);

  updateStars();

  if (overlayTitleEl) {
    overlayTitleEl.textContent = reason === 'timeout' ? '¡TIEMPO AGOTADO!' : '¡GANASTE!';
  }

  if (overlay) overlay.classList.remove('hidden');
}

// Función que ajusta estrellas del overlay final según cantidad de movimientos.
function updateStars() {
  let stars = '★★★';
  if (moves > 20) stars = '★★';
  if (moves > 30) stars = '★';
  if (starsEl) starsEl.textContent = stars;
}

// Función que muestra mensaje temporal de match reutilizando clase CSS show-match en el tablero.
function showMatchMessage() {
  if (!board) return;

  board.classList.remove('show-match');
  void board.offsetWidth;
  board.classList.add('show-match');

  setTimeout(() => {
    board.classList.remove('show-match');
  }, 850);
}

// Función que reinicia partida completa, limpia estado, renderiza tablero y arranca timer.
function startNewGame() {
  resetGameState();
  renderBoardByDifficulty();
  startTimer();
}

// Función principal del juego, inicializa controles y arranca primera partida.
function startGame() {
  initThemeToggle();
  initDifficultySelector();
  initRestart();
  startNewGame();
}

startGame();
