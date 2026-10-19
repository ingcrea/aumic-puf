# AUM-IC PUF — Protocolo Universal contra Fallos

[![Licencia AGPL-3.0](https://img.shields.io/badge/license-AGPL--3.0-blue.svg)](LICENSE)
[![Estándar AUM-IC 7:2026](https://img.shields.io/badge/est%C3%A1ndar-AUM--IC%207%3A2026-gold.svg)](https://github.com/ingcrea/aum-ic)

> Suite oficial de aseguramiento de calidad y orquestador determinista para facilitar el cumplimiento del estándar [AUM-IC 7:2026](https://github.com/ingcrea/aum-ic) por **Ingeniería Creativa (IngCrea)**.

---

## Matriz de Compuertas de Calidad (G1 - G15)

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
