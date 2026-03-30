# 2026-1-t1-g5

Este proyecto implementa un juego tipo Memorice para mostrar elementos modernos de CSS.

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
- Además, la cantidad de columnas se ajusta por dificultad desde js:
  - `js/game.js` en `renderBoardByDifficulty()`.

### 4) Variables CSS y funciones (`calc`)
- Variables globales de color, tamaños y transición:
  - `css/variables.css` en `:root`.
- Uso de funciones modernas:
  - `calc()` en `--card-size` y en ancho de barra del timer.
  - `clamp()` en `--gap`.

### 5) Anidación de reglas
- Se utiliza nesting con `&` para mantener reglas agrupadas por componente:
  - `css/card.css`.

### 6) Transformaciones
- Flip 3D de cartas con `rotateY`, además de transformaciones en `@keyframes`:
  - `css/card.css`, `css/animations.css`.

### 7) Transiciones
- Transición de giro de cartas y transiciones en botones/timer:
  - `css/card.css`, `css/layout.css`.

### 8) Animaciones
- Animaciones con `@keyframes`:
  - `match-pulse`, `shake`, `win-drop`, `flash-in-out` en `css/animations.css`.
- Animación de variable CSS del timer:
  - `@property --progress` en `css/animations.css`.

## Integración con el juego
- `js/board.js` construye dinámicamente las cartas y el tablero.
- `js/game.js` controla estado, clicks, puntaje, timer, dificultad, overlay y reinicio.
- El CSS responde a clases de estado (`.flipped`, `.matched`, `.error`, `.show-match`) agregadas desde JS.

## Uso

Simplemente abrir el HTML en algún browser.

## Uso de IA

Durante el desarrollo usamos herramientas de IA (como Codex y Claude) como apoyo técnico, principalmente para:
- Crear una base de organización de archivos según cada responsabilidad.
- Revisar archivos del proyecto y explicar el rol de cada uno cuando algo no estaba claro.
- Proponer mejoras de diseño y organización.
- Ayudar a documentar el código con comentarios más claros para la presentación.

La IA se usó como asistente de desarrollo:
- Se evaluó y adaptó cada propuesta antes de integrarla.
- Se priorizó comprender cada cambio antes de aceptarlo.
