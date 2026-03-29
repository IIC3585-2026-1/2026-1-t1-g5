# 2026-1-t1-g5

Este proyecto implementa un juego tipo Memorice para jugar con elementos de CSS.

## Elementos de CSS implementados

### 1) Media queries y container queries
- Media queries para adaptar columnas del tablero según ancho de ventana:
  - `css/responsive.css` (`@media (max-width: 520px)` y `@media (max-width: 360px)`).
- Container queries para adaptar contenido interno de cada carta según su tamaño:
  - `css/card.css` (`container-type: inline-size`).
  - `css/responsive.css` (`@container (max-width: 85px)` y `@container (max-width: 65px)`).

### 2) Flexbox
- Se usa Flexbox para estructurar HUD, controles, panel de timer y overlay:
  - `css/layout.css` (`.game-wrapper`, `.hud`, `.controls`, `.overlay-box`, etc.).

### 3) Grid
- El tablero usa CSS Grid:
  - `css/layout.css` en `.board`.
- Además, la cantidad de columnas se ajusta por dificultad desde un código js:
  - `js/game.js` en `renderBoardByDifficulty()`.

### 4) Variables CSS y funciones (`calc`)
- Variables globales de color, tamaños y transición:
  - `css/variables.css` en `:root`.
- Uso de funciones modernas:
  - `calc()` en `--card-size` y en ancho de barra del timer.
  - `clamp()` en `--gap`.

### 5) Anidación de reglas
- Se utiliza nesting CSS con `&` para mantener reglas agrupadas por componente:
  - `css/card.css`.

### 6) Transformaciones
- Flip 3D de cartas con `rotateY`, además de transformaciones en keyframes:
  - `css/card.css`, `css/animations.css`.

### 7) Transiciones
- Transición de giro de cartas y transiciones en botones/timer:
  - `css/card.css`, `css/layout.css`.

### 8) Animaciones
- Animaciones con `@keyframes`:
  - `match-pulse`, `shake`, `win-drop`, `flash-in-out` en `css/animations.css`.
- Animación de variable CSS del timer:
  - `@property --timer-progress` en `css/animations.css`.

## Integración con el juego
- `js/board.js` construye dinámicamente las cartas y el tablero.
- `js/game.js` controla estado, clicks, score, timer, dificultad, overlay y reinicio.
- El CSS responde a clases de estado (`.flipped`, `.matched`, `.error`, `.show-match`) agregadas desde JS.

## Uso de IA

Durante el desarrollo usamos IAs como Codex o Claude como apoyo técnico y pedagógico, principalmente para:

- Crear una base template de organización de los archivos según responsabilidades.
- Revisar archivos del proyecto y explicar el rol de cada uno de estos cuando algo estaba poco claro.
- Proponer mejoras de diseño y organización (HTML/CSS/JS).
- Ayudar a documentar el código con comentarios más claros y mantenibles.
- Verificar cobertura de requisitos del enunciado (media/container queries, flexbox, grid, variables, anidación, transformaciones, transiciones y animaciones).

La IA se usó como asistente de desarrollo, no como reemplazo de decisiones:
- Se evaluó y adaptó las propuestas antes de integrarlas.
- Se priorizó comprender cada cambio antes de aceptarlo.
- Se mantuvo control manual del código final.