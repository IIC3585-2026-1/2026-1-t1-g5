function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

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

function buildDeck(flags, pairsCount) {
  const safePairs = Math.max(1, Math.min(pairsCount, flags.length));
  const selected = shuffle(flags).slice(0, safePairs);
  return shuffle(selected.flatMap(flag => [flag, flag]));
}

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

  // Opción A (recomendada): usar variable CSS
  board.style.setProperty('--board-cols', String(cols));

  // Opción B (si no quieres tocar CSS):
  // board.style.gridTemplateColumns = `repeat(${cols}, var(--card-size))`;
}