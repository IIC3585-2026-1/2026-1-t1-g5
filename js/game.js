// Configuración base del juego por dificultad, cartas, grid y tiempo.
const DIFFICULTY_CONFIG = Object.freeze({
  easy: { pairsCount: 4, cols: 2, timeLimitSec: 45 },
  normal: { pairsCount: 8, cols: 4, timeLimitSec: 75 },
  hard: { pairsCount: 10, cols: 5, timeLimitSec: 90 },
});

const DEFAULT_DIFFICULTY = 'normal'; // Dificultad default cuando recién se llega al HTML base
const FLIP_BACK_DELAY_MS = 650; // Milisegundos de espera antes de volver a girar cartas cuando hay error
const MATCH_FLASH_MS = 900; // Duración del mensaje visual de Match

// Guardado masivo de referencias del DOM para manipular
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

// Variable de estado del juego, guardando dificultad, primer carta sacada, segunda
// Bloqueos de cartas por contexto de juego, progreso de movimientos, pares encontrados, puntaje
// Elementos de tiempo.
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

// Función de dificultad, toma la dificultad elegida o el fallback de la default
function getDifficultyConfig(difficulty) {
  return DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG[DEFAULT_DIFFICULTY];
}

// Función que calcula el puntaje de premio por matches y penalización por errores.
function calculateScore() {
  const misses = state.moves - state.matchedPairs;
  return Math.max(0, state.matchedPairs * 100 - misses * 20);
}

// Función de rating final de estrellas basado en el ratio de puntaje
function getStarsByScore() {
  const maxScore = state.totalPairs * 100;
  const ratio = maxScore === 0 ? 0 : state.score / maxScore;
  if (ratio >= 0.85) return '★★★';
  if (ratio >= 0.6) return '★★';
  return '★';
}

// Función de formateo simple para los segundos del timer
function formatTime(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Función de actualización del HUD con el estado del juego, en particular el score y los movimientos hechos
function updateHud() {
  if (scoreEl) scoreEl.textContent = String(state.score);
  if (movesEl) movesEl.textContent = String(state.moves);
}

// Función que actualiza el HUD del timer, primero formatea, luego calcula progreso y lo guarda en variable css --timer-progress para animar el ancho
// Aplica estados visuales según ciertos umbrales de tiempo, con warning de 40% a 21% y a danger de 20% hasta el final.
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

// Función que detiene el intervalo del temportizador si está activo, en esencia para evitar muchos timers en paralelo.
function clearTimer() {
  if (state.timerIntervalId) {
    clearInterval(state.timerIntervalId);
    state.timerIntervalId = null;
  }
}

// Función que inicia o reinicia el contenedor del timer del juego. Limpia el timer previo, actualiza UI inicial, resta 1 segundo por tick y termina la partida cuando llega a 0
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

// Función que limpia la selección actual de cartas del turno. Si el juego ya acabó, bloquea el tablero.
function resetTurn() {
  state.firstCard = null;
  state.secondCard = null;
  state.lockBoard = state.gameFinished;
}

// Función que Muestra por un breve tiempo el mensaje de Match.
// Reinicia la animación quitando y agregando la clase show-match.
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

// Función que rellena y muestra el overlay de resultado al terminar la partida.
function showOverlay(title) {
  if (overlayTitleEl) overlayTitleEl.textContent = title;
  if (finalScoreEl) finalScoreEl.textContent = String(state.score);
  if (finalMovesEl) finalMovesEl.textContent = String(state.moves);
  if (starsEl) starsEl.textContent = getStarsByScore();
  if (overlayEl) overlayEl.classList.remove('hidden');
}

// Función que oculta el overlay de resultado.
function hideOverlay() {
  if (overlayEl) overlayEl.classList.add('hidden');
}

// Función que cierra la partida de forma segura, bloqueando interacción, deteniendo el timer y muestra overlay según motivo.
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

// Función que maneja el caso de acierto en el juego, marca las cartas como matcheadas, actualiza los score en la HUD, muestra mensaje Flash
// y verifica si hay condiciones de victoria para terminar el juego.
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

// Función que maneja el caso de error en el match, aplica la clase de error, penaliza el score y revierte el flipeo tras delay.
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

// Función que maneja el clic en las cartas, valida si es una carta jugable, registra la primer y segunda carta y compara ambas cartas.
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

// Función que configura el tablero según la dificultad actual de juego, con sus números de pares, columnas y tiempo inicial.
function renderBoardByDifficulty() {
  const { pairsCount, cols, timeLimitSec } = getDifficultyConfig(state.difficulty);
  state.totalPairs = pairsCount;
  state.timeLimitSec = timeLimitSec;
  state.secondsLeft = timeLimitSec;
  createBoard({ pairsCount, cols });
  if (boardEl) boardEl.style.gridTemplateColumns = `repeat(${cols}, var(--card-size))`;
}

// Función que reinicia los estados, digase turno, score, flags visuales y timer.
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

// Función que reinicia por completo una partida, oculta overlay, resetea los estados, vuelve a renderizar e inicia timer. 
function startNewGame() {
  hideOverlay();
  resetGameState();
  renderBoardByDifficulty();
  updateTimerUi();
  startTimer();
}

// Función que inicializa botón de tema claro/oscuro.
function initThemeToggle() {
  if (!themeBtn) return;
  themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('light');
  });
}

// Función que inicializa selector de dificultad y reinicia partida al cambiarla.
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

// Funciín que inicializa botones de reinicio, el normal y desde overlay (pantalla que aparece encima del juego cuando termina la partida)
function initRestartButtons() {
  if (restartBtn) restartBtn.addEventListener('click', startNewGame);
  if (playAgainBtn) playAgainBtn.addEventListener('click', startNewGame);
}

// Función de entrada al juego, conecta todos los eventos y arranca la primera partida del juego.
function startGame() {
  if (boardEl) boardEl.addEventListener('click', onCardClick);
  initThemeToggle();
  initDifficultySelector();
  initRestartButtons();
  startNewGame();
}

startGame();
