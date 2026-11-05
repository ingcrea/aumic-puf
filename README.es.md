# AUM-IC PUF — Protocolo Universal contra Fallos (PUF-23)

[![Licencia AGPL-3.0](https://img.shields.io/badge/license-AGPL--3.0-blue.svg)](LICENSE)
[![Estándar AUM-IC 7:2026](https://img.shields.io/badge/est%C3%A1ndar-AUM--IC%207%3A2026-gold.svg)](https://github.com/ingcrea/aum-ic)
[![npm version](https://img.shields.io/badge/npm-v3.0.0-cb3837.svg)](https://www.npmjs.com/package/@ingcrea/aumic-puf)

> 🌐 **Navegación:** 🇺🇸 [Read in English](./README.md) | 📜 [Manifiesto (ES)](./MANIFEST.es.md) | 📜 [Manifesto (EN)](./MANIFEST.md) | 🌌 [Estándar AUM-IC 7](https://github.com/ingcrea/aum-ic)

> Suite oficial de aseguramiento de calidad y orquestador determinista para facilitar el cumplimiento del estándar [AUM-IC 7:2026](https://github.com/ingcrea/aum-ic) por **Ingeniería Creativa (IngCrea)**.

---

## Matriz de 23 Compuertas de Calidad (G0 - G22)

### 0. G0: Higiene Forense Anti-Entropía y Codificación Pura (aumic-sanitizer Audit)
- **Alcance:** Diagnóstico in-process de mojibake, entropía de caracteres, saltos CRLF y codificación UTF-8 pura.

### 1. G1: Mapeo de Comportamientos y Límites (Behavior & Boundary Mapping)
- **Alcance:** Analizar el flujo completo de ejecución, ciclo de vida de la UI y desacoplamiento de hilos pesados.

### 2. G2: Test de Reproducción — Fase Roja (Reproduction Test-First)
- **Alcance:** Escribir y verificar test automatizado previo a tocar código de lógica (*Red State*).

### 3. G3: Checkpoint Inmutable (State Snapshot)
- **Alcance:** Respaldos atómicos con hash SHA-256 en `checkpoints/` para permitir reversión instantánea.

### 4. G4: Reparación Focalizada y Cero CSS Inline (Pure Logic Refactor)
- **Alcance:** Erradicación de causa raíz, cero código muerto y prohibición de atributos `style="..."` inline.

### 5. G5: Validación de Test y No-Regresión — Fase Verde (Green State & Non-Regression)
- **Alcance:** 100% de aserciones aprobadas y verificación perimetral contra regresiones colaterales.

### 6. G6: Análisis Estático Estricto (Static Gate Multi-Ecosystem)
- **Alcance:** Compiladores y linters en modo estricto (Rust, TypeScript, Python, PHP, Java, C#, C++, Swift, etc.).

### 7. G7: Documentación Semántica y Registro ADR (Intent & Architecture Decision)
- **Alcance:** Registro obligatorio de decisiones de arquitectura en `BITACORA.md`.

### 8. G8: Aplanadora POSIX y Sanitización Anti-Mojibake
- **Alcance:** Blindaje de bytes LF puros y UTF-8 estricto sin BOM.

### 9. G9: Integridad Operativa, Permisos y Secretos Zero-Trust
- **Alcance:** Permisos POSIX (644/755) y cero credenciales en texto plano.

### 10. G10: Invalidación y Purga de Estado Efímero
- **Alcance:** Purga de cachés de compilación (.next, .turbo, target, __pycache__, .phpunit.cache).

### 11. G11: Ergonomía del SO, Foco de Ventanas y Aislamiento UI (Zero-Focus Stealing)
- **Alcance:** Compuerta obligatoria contra robo de foco en Windows (`CREATE_NO_WINDOW`) e I/O desacoplado de loops UI.

### 12. G12: Topología de Rutas Vivas & Dead Link Sweeper
- **Alcance:** Detección de enlaces y destinos locales rotos en código web.

### 13. G13: Grafo de Interactividad & Erradicación Zombie
- **Alcance:** Erradicación de botones decorativos o handlers de eventos inertes.

### 14. G14: Traza de Contratos HTTP & Endpoints Vivos
- **Alcance:** Detección estática de contratos HTTP rotos o paths huérfanos.

### 15. G15: Headless E2E Crawler & Runtime Exceptions
- **Alcance:** Suites E2E (Playwright / Cypress) para verificación de flujo funcional.

### 16. G16: Calidad Visual, Core Web Vitals y Auditoría Web (Lighthouse / CWV)
- **Alcance:** Puntuación de experiencia de usuario, layouts DOM estables y Core Web Vitals.

### 17. G17: Blindaje Legal, Integridad de Licencias y Compatibilidad (IP & License Guard)
- **Alcance:** Consistencia entre manifiestos (`package.json`, `Cargo.toml`) y archivos `LICENSE`, titularidad y copyright.

### 18. G18: Consistencia de Motores de Estilo y Erradicación de Antipatrones (Style Engine Consistency)
- **Alcance:** Prevención de colisión entre frameworks (ej. Tailwind + Bootstrap) y control de deuda de `!important`.

### 19. G19: Blindaje de Superficie de Ataque y Cero Inyecciones (Zero-Injection Guard)
- **Alcance:** Erradicación de archivos expuestos (`.env`, `dump.sql`) y prevención de concatenación SQL directa.

### 20. G20: Topología de Entornos, Aislamiento de Red y Cero Conexiones Fantasma (Topology Guard)
- **Alcance:** Erradicación de referencias hardcodeadas a `localhost` / `127.0.0.1` en entornos de producción.

### 21. G21: Cumplimiento Oficial WordPress & WooCommerce (WPCS & WC Guidelines)
- **Alcance:** Auditoría estricta de sanitización de superglobales, prepared queries en `$wpdb`, compatibilidad obligatoria con High-Performance Order Storage (HPOS) y métodos CRUD canónicos de `WC_Order`.

### 22. G22: Diagnóstico Universal de Sintaxis y Delimitadores (Universal Syntax Guard)
- **Alcance:** Localización exacta de omisiones de punto y coma (`;`), comas en JSON y llaves/corchetes/paréntesis desbalanceados en memoria sin requerir compiladores externos.

---

## Uso del Orquestador (CLI)

```bash
# Instalación global desde npm
npm install -g @ingcrea/aumic-puf

# Auditar todas las compuertas de la matriz (G0 a G22)
puf auditar

# Auditar compuertas focalizadas (G0, G21, G22)
puf auditar -g G0,G21,G22

# Modo fail-fast (aborta al primer fallo detectado)
puf auditar --fast

# Consultar versión instalada
puf -v
```

### 1. G1: Mapeo de Comportamientos y Limites (Behavior & Boundary Mapping)
- **Alcance:** Analizar el flujo completo de ejecucion y ciclo de vida de la UI.
- **Acciones:**
  - Identificar entradas, tipos, contratos, mutaciones y salidas esperadas.
  - Definir formalmente casos de borde: valores nulos (`None`, `null`, `Option::None`), cadenas vacias, desbordamientos numericos, condiciones de carrera/concurrencia y accesos no autenticados.
  - **Aislamiento del Bucle de UI:** Prohibido disparar I/O pesado, comandos o procesos sincronos dentro de temporizadores o callbacks de interfaz grafica (`slint::Timer`, `setInterval`, `requestAnimationFrame`). Deben delegarse a tareas de fondo asincronas o cachearse atomicamente.

### 2. G2: Test de Reproduccion -- Fase Roja (Reproduction Test-First)
- **Alcance:** Probar y demostrar empiricamente el defecto antes de tocar una sola linea de logica.
- **Acciones:**
  - Escribir un test automatizado (unitario, integracion o CLI determinista) que replique la falla reportada con fidelidad.
  - Ejecutar el test y confirmar que falle contra el codigo actual (*Red State*).

### 3. G3: Checkpoint Inmutable (State Snapshot)
- **Alcance:** Blindaje de rollback y preservacion de estado pre-mutacion.
- **Acciones:**
  - Generar un respaldo atomico timestamped en `checkpoints/` (`<archivo>.bak_YYYYMMDDHHMMSS`).
  - Registrar hash SHA-256 para permitir reversion instantanea sin perdida de informacion.

### 4. G4: Reparacion Focalizada y Refactorizacion Limpia (Pure Logic Refactor)
- **Alcance:** Correccion quirurgica de la causa raiz.
- **Acciones:**
  - Atacar la causa raiz sin parches superficiales. Cero codigo muerto, cero dependencias circulares.
  - Cumplir principios de codigo limpio del stack correspondiente:
    - **Rust:** Cero `unwrap()` no justificado; manejo exhaustivo con `Result` / `Option`.
    - **Astro:** Componentes puros, separacion de logica frontmatter y JSX estatico/reactivo.
    - **Python:** Tipado estricto (Type hints), PEP 8, manejo explicito de excepciones.
    - **PHP:** POO fuertemente tipada, `declare(strict_types=1);`, inyeccion de dependencias.
  - **Prohibicion Absoluta de CSS Inline:** Queda terminantemente prohibido inyectar `style="..."` en HTML/PHP/JSX/Astro. Si existen estilos inline preexistentes, refactorizarlos a archivos `.css`/`.scss`.

### 5. G5: Validacion de Test y No-Regresion -- Fase Verde (Green State & Non-Regression)
- **Alcance:** Verificacion de solucion completa y estabilidad perimetral.
- **Acciones:**
  - Reejecutar el test de G2 y validar el 100% de aserciones aprobadas (*Green State*).
  - Ejecutar la suite de pruebas perimetral/completa para certificar cero regresiones colaterales.

### 6. G6: Analisis Estatico, Tipado y Compilador Estricto (Static Gate)
- **Alcance:** Tolerancia cero a advertencias del compilador o linters.
- **Acciones:**
  - Ejecutar compilador y analisis estatico en modo estricto segun el stack:
    - **Rust:** `cargo clippy -- -D warnings` y `cargo check`.
    - **Astro / TypeScript:** `npx astro check` y `npx eslint`.
    - **Python:** `ruff check` y `mypy --strict`.
    - **PHP:** `php -l` y `phpstan analyse --level=max`.
  - Cero advertencias o errores tolerados.

### 7. G7: Documentacion Semantica y Registro ADR (Intent & Architecture Decision)
- **Alcance:** Memoria tecnica e intencion arquitectonica.
- **Acciones:**
  - Explicar en comentarios de codigo el *por que* de la decision y no solo el *que hace*.
  - Registrar en `BITACORA.md` de la raiz del proyecto bajo el formato estricto:
    ```
    [Timestamp] | Contexto | Decision | Consecuencia
    ```

### 8. G8: Aplanadora POSIX y Sanitizacion Anti-Mojibake (aumic-sanitizer)
- **Alcance:** Integridad de codificacion y terminacion de linea.
- **Acciones:**
  - Barrer los archivos con `node C:\Users\NexoRemoto\Proyectos\aumic-sanitizer\dist\index.js audit .`
  - Purgar caracteres Mojibake forzando UTF-8 puro sin BOM.
  - Aplanar y forzar saltos de linea Unix LF (`\n`), erradicando Windows CRLF (`\r\n`).

### 9. G9: Integridad Operativa, Permisos y Secretos Zero-Trust (Ops Shield)
- **Alcance:** Blindaje de infraestructura y seguridad de credenciales.
- **Acciones:**
  - Verificar permisos restrictivos en sistema de archivos (`chmod 644` archivos / `755` directorios, llaves SSH `600`).
  - Cero credenciales, tokens o contrasenas en texto plano. Gestionar accesos via variables de entorno seguras o `SECRETOS.py`.

### 10. G10: Invalidacion y Purga de Estado Efimero (State Flush)
- **Alcance:** Consumo garantizado del codigo fresco en runtime.
- **Acciones:**
  - Purgar deterministamente cache de objetos (Redis, Memcached, Opcache, `.next`, `dist`).
  - Reiniciar workers (Gunicorn, Systemd, SSR Node, PM2) para garantizar que los clientes consuman el codigo validado.

### 11. G11: Blindaje de Ergonomia del SO, Foco de Ventanas y Aislamiento UI (OS & Desktop Ergonomics Gate)
- **Alcance:** Experiencia de usuario inmaculada, ausencia total de robo de foco.
- **Acciones:**
  - **Inmunidad al Robo de Foco (Zero-Focus Stealing):** Toda invocacion de subprocesos en Windows (`Command::new`, `powershell`, `cmd`) DEBE incorporar `.creation_flags(0x08000000)` (`CREATE_NO_WINDOW`).
  - **Zero-Ghost Processes:** Al cerrar la aplicacion, no deben quedar procesos huerfanos consumiendo CPU.
  - **Cache de Consultas de Privilegios:** Usar cache atomico perezoso (`AtomicU8` / `OnceLock`), evitando invocaciones repetidas en bucles.

---

### 12. G12: Topologia de Rutas Vivas & Dead Link Sweeper (Living Routes Gate)
- **Alcance:** Integridad de navegacion sin pantallas 404 ni rutas huerfanas en Web (Astro, React, Next, Vue), Mobile (Flutter) y Desktop (Slint, C#/WPF, Tauri).
- **Acciones:**
  - Escanear los archivos HTML/JSX/Astro/PHP afectados con el metodo `auditarRutasVivas()` del adaptador.
  - Detectar atributos `href`, `src`, `to`, `action` que apunten a rutas locales que no existen en el filesystem.
  - Cero enlaces rotos hacia destinos locales inexistentes. Toda ruta relativa debe resolverse a un archivo real.
  - El orquestador informa la lista exacta: `archivo.astro -> "/ruta/inexistente" (no existe en filesystem)`.
  - **Solo aplica a extensiones web:** `.astro`, `.jsx`, `.tsx`, `.html`, `.php`, `.vue`, `.svelte`.

### 13. G13: Grafo de Interactividad & Erradicacion Zombie (Living UI Actions Gate)
- **Alcance:** Cero botones decorativos, pseudoelementos inertes o acciones no conectadas.
- **Acciones:**
  - Escanear los archivos web afectados con el metodo `auditarInteractividad()` del adaptador.
  - Detectar patrones de handler inerte: `onClick=""`, `onClick={undefined}`, `on:click=""`, `@click=""`.
  - Todo control interactivo debe resolver en un evento real (API call, modal, mutacion de estado o feedback visual).
  - El orquestador reporta exactamente que archivo y linea contiene el handler zombie.
  - **Solo aplica a extensiones web:** `.astro`, `.jsx`, `.tsx`, `.html`, `.php`, `.vue`, `.svelte`.

### 14. G14: Traza de Contratos HTTP & Endpoints Vivos (Living API Contract Gate)
- **Alcance:** Consistencia granular entre las llamadas del cliente y los controladores declarados en el backend.
- **Acciones:**
  - Analizar los archivos afectados buscando llamadas `fetch(...)` o `axios.get/post/...` con rutas hardcodeadas locales (no `/api/`, no variables de entorno `${}`).
  - Cero llamadas HTTP a paths huerfanos o inexistentes detectados estaticamente.
  - Si se detectan inconsistencias, listar exactamente el archivo y el endpoint problematico.

### 15. G15: Headless E2E Crawler & Runtime Exceptions (Headless Handshake Gate)
- **Alcance:** Deteccion de errores silenciosos, excepciones de runtime y bloqueos de interfaz.
- **Acciones:**
  - Verificar si existe suite E2E (Playwright `playwright.config.ts`, Cypress `cypress.config.ts`) en la raiz del proyecto.
  - Si existe: marcar como **APROBADA** e instruir al Jefe Maestro a ejecutarla manualmente para certificacion completa.
  - Si NO existe: marcar como **OMITIDA** (no bloquea certificacion) con recomendacion de configurar Playwright.
  - **G15 OMITIDA no es un fallo:** `todasAprobadas` acepta tanto `aprobada` como `omitida`.

---

## Reglas Inviolables de Ejecucion

1. **Cero Complacencia:** No dejar tareas a medias ni usar marcadores vacios (`// el resto del codigo aqui`).
2. **Determinismo Tecnico:** Todo entregable debe ser determinista, verificado en consola y listo para produccion.
3. **Reporte por Compuerta:** Reportar siempre el estado de cada compuerta (G1 a G15) con su respectiva evidencia.
4. **G15 es OMITIDA, no RECHAZADA:** Si no hay suite E2E, G15 se omite sin bloquear la certificacion.
5. **G12 y G13 aplican solo a archivos web:** Para proyectos Rust/Python/Shell sin frontend, estas compuertas se aprueban automaticamente por ausencia de extensiones web en los archivos afectados.

## Uso del Orquestador (CLI)

```bash
# Inicializar incidente (crea andamio G2 + checkpoints G3)
puf iniciar INC-042 "Descripcion del fallo" src/archivo.ts

# Auditar las 15 compuertas concurrentemente
puf auditar INC-042 src/archivo.ts

# Modo fail-fast (aborta al primer fallo)
puf auditar INC-042 src/archivo.ts --fast

# Revertir a estado pre-fallo (usando checkpoint G3)
puf revertir INC-042 archivo.ts

# Instalar guardian de Git (pre-commit hook)
puf instalar-hook
```

## Licencia

Distribuido bajo licencia **GNU Affero General Public License v3.0 (AGPL-3.0)**. Ver [LICENSE](LICENSE).

---

**[Ingeniería Creativa](https://ingcrea.com)** | [Estándar AUM-IC](https://github.com/ingcrea/aum-ic)
