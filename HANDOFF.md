# Handoff — Juan Packaging Solutions landing page

**Última actualización:** 2026-09-29
**Estado:** Desplegado y en producción en https://juanpackaging.com
**Repo:** https://github.com/JorgeVexus/JPS (rama `main`)

---

## 1. Qué es esto

Landing page "coming soon" de una sola página para Juan Packaging Solutions,
construida en HTML/CSS/JS puro (sin framework, sin build step) a partir de un
diseño de Figma, pixel-perfect, responsive, con micro-interacciones estilo
Apple, y empaquetada con la estructura típica de carpetas para subir a un
hosting cPanel vía Administrador de Archivos.

**Figma fuente:** https://www.figma.com/design/xAoNdOt9uNDWb4DzC4WI4H/juan-packaging
Nodos usados durante el build (por si hay que volver a consultarlos):
- `723-3269` — página completa
- `723-3889` — sección hero
- `723-3890` — lockup del logo + wordmark + tagline
- `723-3919` — bloque título/párrafo/botón del hero
- `723-3960` — sección "The Next Chapter"
- `827-3419` — el nodo exacto del logo (usado para exportar el asset correcto, ver sección 4)

## 2. Estructura de archivos

```
index.html
assets/
  css/style.css
  js/main.js
  img/            (todos los assets exportados de Figma)
.claude/launch.json   (config del dev server, no se sube al repo ni al zip)
.gitignore            (excluye .claude/, *.zip, node_modules/)
```

Es la estructura completa que hay que subir a `public_html` en cPanel. El
`index.html` referencia todo con rutas relativas (`assets/css/...`), así que
funciona igual sin importar el subdominio/carpeta donde se despliegue.

## 3. Cómo correrlo en local

No requiere build ni dependencias. El dev server es solo para servir los
archivos estáticos con rutas relativas funcionando (abrir `index.html`
directo con doble clic también funciona en un navegador normal, pero el
panel de preview de Claude Code necesita un servidor real).

```bash
npx serve .   # o usar el preview_start del panel con el config "static-site" en .claude/launch.json
```

Sirve en `http://localhost:5173`.

## 4. Cómo generar el zip de despliegue

```powershell
$proj = "C:\Users\asahi\OneDrive\Desktop\Proyectos Vexus\JPS Calude"
$zipPath = Join-Path $proj "juan-packaging-solutions.zip"
if (Test-Path $zipPath) { [System.IO.File]::Delete($zipPath) }
Compress-Archive -Path "$proj\index.html", "$proj\assets" -DestinationPath $zipPath
```

**Importante:** si el dev server (`npx serve`) está corriendo, `Compress-Archive`
falla con "el proceso no puede obtener acceso al archivo" porque los archivos
quedan bloqueados. Detener el preview server antes de generar el zip.

Para desplegar: subir el zip a `public_html` en el Administrador de Archivos
de cPanel → seleccionar → **Extract**. Sobrescribe el `index.html` de la
plantilla default de cPanel. Las carpetas viejas de la plantilla
(`css/`, `fonts/`, `img/`, `js/` sueltas en la raíz) no se tocan porque todo
nuestro código vive dentro de `assets/` — se pueden borrar si se quiere dejar
limpio, pero no interfieren.

## 5. Decisiones de diseño y gotchas importantes

### 5.1 El hero SIEMPRE debe caber en 100vh (requisito explícito del usuario)

`.hero{ min-height:100vh; min-height:100svh; }` y `.hero__inner{ justify-content:center; }`.
Esto es un balance MUY ajustado porque hay elementos con tamaño fijo
(no-responsivo) por requisitos explícitos posteriores del usuario:

- **Logo:** ancho mínimo fijo de 528px (`--width:clamp(33rem, 30vw, 40rem)`)
  → esto fija también su alto (~184px) porque escala por aspect ratio.
- **Wordmark "JUAN PACKAGING SOLUTIONS":** 21px fijo, bold.
- **Botón "Start a conversation":** padding exacto de Figma (`.875rem 2.1875rem`),
  no vh-clamped.

Como esos ya no se encogen en pantallas bajas, TODO lo demás (título, párrafo,
gaps, footnote, padding del hero__inner) está afinado con `clamp(floor, Nvh, ceiling)`
muy ajustados para compensar y que la suma total siga cabiendo en ~700px de
alto útil (probado hasta 1920×700 sin overflow).

**Si se agrega o agranda algo en el hero, hay que volver a probar en alturas
cortas (700–850px) porque el margen es mínimo.** Ya pasó una vez que un
cambio de tamaño de fuente rompió el ajuste y hubo que re-comprimir varios
`clamp()` (ver commit `c18f15d`).

### 5.2 El logo: por qué el archivo importa más que el CSS

El PNG "en bruto" que exporta la API de Figma para este layer
(`imgJpsLogoGk4` / nodo `827:3419`) es **cuadrado (834×834)**, con mucho
padding transparente — NO es la proporción ancha (528:184) que se ve en el
diseño. Intentar forzarlo con CSS (aspect-ratio, object-fit:cover, crops
manuales) nunca dio el resultado correcto porque no se sabía el offset
exacto del recorte interno de Figma.

**La solución que funcionó:** usar `get_screenshot` sobre el nodo exacto del
logo (`827:3419`) para obtener el render YA recortado como se ve en Figma
(528×184, proporción correcta) — pero ese render viene con fondo blanco
sólido horneado (no transparente), porque es un screenshot, no un asset
aislado. Se le quitó el fondo blanco con un script de PowerShell que
convierte a transparente cualquier píxel con R,G,B ≥ 246 (el dorado metálico
nunca llega a ese umbral, así que no se comió brillos). El archivo resultante
es `assets/img/hero-logo.png` — **no volver a reemplazarlo por el asset
"en bruto" de Figma, se rompe la proporción.**

### 5.3 Gotcha de Flexbox: `align-items: stretch` es el default

Pasó dos veces en esta sesión que un elemento con `max-width` dentro de un
contenedor flex-column se quedaba pegado a la izquierda en vez de centrarse,
porque el padre no tenía `align-items` explícito (default = `stretch`) y el
hijo, al no poder estirarse hasta el ancho completo (por el `max-width`), se
quedaba anclado al inicio.

- `.brand-lockup` necesita `align-self:center` explícito por esto (commit `bb607e1`).
- `.hero__content` necesita `align-items:flex-start` explícito, si no el
  botón dentro se estira a lo ancho de todo el contenedor (commit fue parte
  de arreglar el botón "muy largo").

**Si algo se centra mal o se estira sin explicación, revisar primero si el
contenedor flex padre tiene `align-items` explícito.**

### 5.4 Gotcha del parallax: el JS tenía un `scale()` hardcodeado

`assets/js/main.js` mueve el fondo del hero con `translateY` on scroll, y el
`transform` completo (incluyendo el zoom `scale()`) se escribe desde JS, NO
desde CSS — el `transform` en `style.css` para `.hero__bg` solo aplica en el
primer render antes de que el JS lo pise. **Si se cambia el zoom del fondo
del hero, hay que cambiarlo en DOS lugares:**
- `assets/css/style.css` → `.hero__bg{ transform:scale(X); }`
- `assets/js/main.js` → dentro de `updateParallax()`, la línea
  `parallaxLayer.style.transform = 'scale(X) translateY(...)'`

Esto causó un bug real (commit `5b757dd`): se bajó el zoom en CSS pero se
olvidó actualizar el JS, así que en producción seguía aplicando el zoom
viejo y el texto de la derecha se encimaba con la botella en monitores
grandes (1920px+).

### 5.5 Posicionamiento de las fotos de fondo (`background-position`)

- **Hero** (`hero-overlay.jpg`): `background-position: 62% bottom;` desktop,
  `85% bottom` en el breakpoint móvil/tablet (≤1100px). El anclaje a `bottom`
  es para no cortar la base de mármol / los tapones de las botellas (la foto
  tiene poco margen abajo). El `62%` (antes `78%`) se bajó para que la lista
  "SPIRITS/WINE/PREMIUM BRANDS/GLOBAL MARKETS" no quede pegada al vidrio de
  la botella en pantallas anchas.
- **Next Chapter** (`next-chapter-bg.jpg`): es una foto ÚNICA que ya contiene
  tanto la botella (lado izquierdo) como el espacio negativo crema (lado
  derecho) donde se superpone el texto — NO está dividida en columnas de
  grid, es un fondo a todo el ancho de la sección con el texto posicionado
  encima vía `margin-left:auto` (importante: NO usar `margin-left` con
  porcentaje+rem-cap, eso causó que el bloque de texto se quedara pegado a
  la izquierda en pantallas anchas — ver commit `bda6ca0`). En
  tablet/móvil se le aplica `background-size:240% auto; background-position:left center;`
  para recortar el espacio vacío y que la botella llene el banner completo.

### 5.6 Textos: se preservaron los typos del diseño, luego se corrigieron

El texto originalmente traía errores tipográficos del archivo de Figma
("packgaging", "PACKAGING PACKAGING", "DISTINTIVE", "Ambiticuos", "fdrom").
Se mantuvieron al pie de la letra en la primera pasada (por instrucción
explícita de fidelidad al diseño), y luego el usuario pidió corregirlos
todos — ya están corregidos en el HTML actual. Si se vuelve a importar texto
desde Figma en el futuro, **revisar por estos mismos typos**, siguen en el
archivo de diseño original aunque no en el código.

### 5.7 Título del hero: salto de línea forzado

`<h1>` del hero tiene un `<br>` manual entre "Engineered" y "As A" para
garantizar que siempre se parta en "Packaging, Engineered" / "As A Strategic
Advantage" en dos líneas, sin importar el ancho del contenedor (antes
dependía del wrap natural y podía partirse distinto o quedar en una sola
línea). Si se cambia el copy del título, hay que decidir conscientemente
dónde va el salto.

### 5.8 Micro-interacciones — estado actual

- **Reveal on scroll:** `IntersectionObserver`, fade + translateY, con
  stagger por `data-reveal-group` (nth-child delays en CSS).
- **Magnético (sigue al cursor):** SOLO en el botón "Start a conversation"
  del hero y el ícono de LinkedIn del footer (`data-magnetic`). Se quitó de
  "Contact JPS" y "Connect on LinkedIn" de la sección Next Chapter porque el
  usuario lo pidió más "clean" (commit `b104e83`). Fuerza actual: `0.15`
  (antes `0.28`, se bajó por pedido de "menos exagerado").
- **Hover de botones:** simplificado, sin `translateY` ni sombras fuertes —
  solo transición de color de fondo/borde. Si se agregan botones nuevos,
  mantener ese estilo minimalista salvo indicación contraria.
- **Parallax del fondo del hero:** rango de movimiento `±14px` (antes `±40px`,
  se redujo junto con el zoom — ver 5.4).

### 5.9 Botones: anchos

Ningún botón tiene ancho forzado — todos son `fit-content` (auto, según su
padding + contenido). El botón del hero tiene `max-width:36.5rem` como techo
pero no se estira a menos que el contenido lo requiera. Esto fue un ajuste
explícito ("hazlo más pequeño en cuanto a width") — no volver a poner
`width:100%` ni `justify-content:space-between` en esos botones sin que lo
pidan.

## 6. Contactos y enlaces actuales (verificar si cambian)

| Elemento | Texto visible | Destino (href) |
|---|---|---|
| Botón "Start a conversation" (hero) | — | `mailto:juan.xu@juanpackaging.com` |
| Botón "Contact JPS" (Next Chapter) | — | `mailto:juan.xu@juanpackaging.com` |
| Email en footer | `info@juanpackaging.com` | `mailto:juan.xu@juanpackaging.com` ⚠️ texto y destino son distintos a propósito |
| Botón "Connect on LinkedIn" (Next Chapter) | — | `https://www.linkedin.com/in/juan-hsu-22841713` (perfil personal) |
| Ícono LinkedIn (footer) | — | `https://www.linkedin.com/company/juan-packaging-solutions/home/` (página de empresa) |

## 7. Breakpoints

- `1100px` — hero y footer pasan de layout de 2 columnas a apilado/centrado;
  Next Chapter pasa de foto-full-bleed-con-texto-superpuesto a foto arriba +
  texto abajo a ancho completo.
- `760px` — capabilities strip pasa a columna única, botones de Next Chapter
  se apilan a ancho completo, se agrega línea divisora dorada entre las dos
  listas de eyebrow del hero (SPIRITS.../IDEAS...) — **esta línea es SOLO
  para teléfono, a propósito no aparece en tablet (768px)**.
- `480px` — ajustes finales de tamaño de logo/tipografía para pantallas muy
  chicas.

## 8. Cosas que NO se tocaron / posibles pendientes

No quedó ninguna tarea explícitamente pendiente al cierre de esta sesión.
Si se retoma el proyecto, buenos puntos de partida para revisar con el
cliente:
- Favicon: actualmente usa `hero-logo.png` directo vía `<link rel="icon">`,
  no hay un favicon `.ico` dedicado ni tamaños múltiples (16x16/32x32/apple-touch-icon).
- No hay `sitemap.xml` ni `robots.txt` (no se pidieron, se puede agregar si el
  cliente quiere SEO básico).
- El copy "SAME ESSENCE. A BRIGHTER TOMORROW." y otros textos del footer no
  se revisaron con el mismo nivel de detalle que el hero — si el cliente pide
  ajustes ahí, aplicar la misma metodología (comparar con Figma vía
  `get_design_context`/`get_screenshot` antes de adivinar).
- No se probó en Safari/iOS real, solo en el panel de preview (Chromium). El
  `background-attachment`/`transform` del parallax debería funcionar pero
  vale la pena confirmar en un dispositivo real si el cliente reporta algo raro ahí.

## 9. Comandos útiles

```bash
# Ver historial de cambios de esta sesión
git log --oneline

# Traer el estado actual del repo antes de seguir trabajando
git pull

# Después de cambios, siempre probar en estos anchos antes de dar por bueno:
# 1920x1080, 1536x700 (el más ajustado para 100vh), 1300x800, 768 (tablet), 375 (móvil)
```
