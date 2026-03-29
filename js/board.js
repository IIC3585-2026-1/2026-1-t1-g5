// Función que mezcla un arreglo sin modificar el original, en esencia para aleatoriezar el orden de las cartas en la partida
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Construye el HTML de una carta, cpon el reverso con un signo de interrogación
// y el frente con bandera. data-emoji se usa después en game.js para comparar pares.
function createCardElement(flag) {
  const card = document.createElement('div');
  card.classList.add('card');
  card.dataset.emoji = flag.emoji;

  card.innerHTML = `
    <div class="card-inner">
      <div class="card-face card-back">
        <div class="pixel-grid"></div>
        <span class="card-question">?</span>
      </div>
      <div class="card-face card-front">
        <span class="flag-emoji">${flag.emoji}</span>
        <span class="flag-name">${flag.name}</span>
      </div>
    </div>`;

  return card;
}

// Función que Genera el mazo del juego, toma N banderas aleatorias
// duplica cada una para formar pares y baraja el resultado final.
function buildDeck(flags, pairsCount) {
  const safePairs = Math.max(1, Math.min(pairsCount, flags.length));
  const selected = shuffle(flags).slice(0, safePairs);
  return shuffle(selected.flatMap(flag => [flag, flag]));
}

// Renderiza todo el tablero a partir de una configuración específica.
// boardId en el contenedor destino, flags es el catálogo de cartas
// pairsCount en la cantidad de pares a usar y cols son columnas del grid, pensando en las dificultades
function createBoard({
  boardId = 'board',
  flags = FLAGS,
  pairsCount = 8,
  cols = 4,
} = {}) {
  const board = document.getElementById(boardId);
  if (!board) return;

  const deck = buildDeck(flags, pairsCount);
  board.replaceChildren(...deck.map(createCardElement));

  board.style.setProperty('--board-cols', String(cols));
}