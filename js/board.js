function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  
  function createBoard() {
    const board = document.getElementById('board');
    board.innerHTML = '';
  
    const pairs = shuffle([...FLAGS, ...FLAGS]);
  
    pairs.forEach(flag => {
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
  
      board.appendChild(card);
    });
  }