---
name: aumic-puf15
description: Protocolo Universal contra Fallos (PUF-15) del Estándar AUM-IC 7:2026. Matriz de 15 compuertas de calidad agnóstica (Rust, Astro, Python, PHP, C#) para auditoría, detección, resolución metódica de fallos, refactorización limpia sin deuda técnica y blindaje de ergonomía del sistema operativo.
---
# Protocolo Universal contra Fallos (PUF-15) — AUM-IC 7:2026
### Matriz de Compuertas de Calidad Agnóstica (Rust, Astro, Python, PHP, C#)

Cuando el usuario invoque **PUF-15** (o PUF) o solicite resolver un fallo bajo este estándar, se debe ejecutar con rigor militar este ciclo cerrado de 15 compuertas consecutivas (G1 a G15), reportando el progreso y las evidencias en consola:

---

## Matriz de Compuertas de Calidad (G1 - G15)

### 1. G1: Mapeo de Comportamientos y Límites (Behavior & Boundary Mapping)
- **Alcance:** Analizar el flujo completo de ejecución y ciclo de vida de la UI.
- **Acciones:**
  - Identificar entradas, tipos, contratos, mutaciones y salidas esperadas.
  - Definir formalmente casos de borde: valores nulos (`None`, `null`, `Option::None`), cadenas vacías, desbordamientos numéricos, condiciones de carrera/concurrencia y accesos no autenticados o permisos insuficientes.
  - **Aislamiento del Bucle de UI:** Prohibido disparar I/O pesado, comandos o procesos síncronos dentro de temporizadores o callbacks de interfaz gráfica (`slint::Timer`, `setInterval`, `requestAnimationFrame`). Deben delegarse a tareas de fondo asíncronas con canales o cachearse de forma atómica.

### 2. G2: Test de Reproducción — Fase Roja (Reproduction Test-First)
- **Alcance:** Probar y demostrar empíricamente el defecto antes de tocar una sola línea de lógica.
- **Acciones:**
  - Escribir un test automatizado (unitario, integración o CLI determinista) que replique la falla reportada con fidelidad.
  - Ejecutar el test y confirmar que falle contra el código actual (*Red State*), validando que el bug ha sido capturado de forma determinista.

### 3. G3: Checkpoint Inmutable (State Snapshot)
- **Alcance:** Blindaje de rollback y preservación de estado pre-mutación.
- **Acciones:**
  - Generar un respaldo atómico timestamped en `checkpoints/` o tag git (`<archivo>.bak_YYYYMMDD_HHMMSS`).
  - Registrar hash de verificación o estado previo para permitir reversión instantánea sin pérdida de información ni corrupción colateral.

### 4. G4: Reparación Focalizada y Refactorización Limpia (Pure Logic Refactor)
- **Alcance:** Corrección quirúrgica de la causa raíz.
- **Acciones:**
  - Atacar la causa raíz sin aplicar parches superficiales ni parches ciegos.
  - Cero código muerto, cero dependencias circulares, bajo acoplamiento y alta cohesión.
  - Cumplir principios de código limpio del stack correspondiente:
    - **Rust:** Cero `unwrap()` no justificado; manejo exhaustivo con `Result` / `Option`.
    - **Astro:** Componentes puros, separación de lógica frontmatter y JSX estático/reactivo.
    - **Python:** Tipado estricto (Type hints), PEP 8, manejo explícito de excepciones.
    - **PHP:** POO fuertemente tipada, tipos estrictos (`declare(strict_types=1);`), inyección de dependencias.
  - **Prohibición Absoluta de CSS Inline:** Queda terminantemente prohibido inyectar atributos `style="..."` o estilos en línea en el HTML/PHP/JSX/Astro. Si se encuentran estilos inline preexistentes, es obligatorio refactorizarlos y extraerlos a su archivo `.css` o `.scss` respectivo con clases semánticas estructuradas.

### 5. G5: Validación de Test y No-Regresión — Fase Verde (Green State & Non-Regression)
- **Alcance:** Verificación de solución completa y estabilidad perimetral.
- **Acciones:**
  - Reejecutar el test de reproducción desarrollado en G2 y validar el 100% de aserciones aprobadas (*Green State*).
  - Ejecutar la suite de pruebas perimetral/completa para certificar cero efectos secundarios o regresiones colaterales.

### 6. G6: Análisis Estático, Tipado y Compilador Estricto (Static Gate)
- **Alcance:** Tolerancia cero a advertencias del compilador o linters.
- **Acciones:**
  - Ejecutar compilador y análisis estático en modo estricto según el stack:
    - **Rust:** `cargo clippy -- -D warnings` y `cargo check`.
    - **Astro / TypeScript:** `npx astro check` y `npx eslint`.
    - **Python:** `ruff check` y `mypy --strict`.
    - **PHP:** `php -l` (sintaxis) y `phpstan analyse --level=max`.
  - Cero advertencias o errores tolerados.

### 7. G7: Documentación Semántica y Registro ADR (Intent & Architecture Decision)
- **Alcance:** Memoria técnica e intención arquitectónica.
- **Acciones:**
  - Explicar en comentarios de código el *por qué* de la decisión y no solo el *qué hace*.
  - Registrar en `BITACORA.md` de la raíz del proyecto bajo el formato estricto:
    ```markdown
    [Timestamp] | Contexto | Decisión | Consecuencia
    ```

### 8. G8: Aplanadora POSIX y Sanitización Anti-Mojibake (aumic-sanitizer)
- **Alcance:** Integridad de codificación y terminación de línea.
- **Acciones:**
  - Barrer los archivos con `node C:\Users\NexoRemoto\Proyectos\aumic-sanitizer\index.js` (o `npx aumic-sanitizer`).
  - Purgar de raíz cualquier carácter corrupto Mojibake (ej. `ó`, `â€™`, `ñ`) forzando UTF-8 puro sin BOM.
  - Aplanar y forzar saltos de línea Unix LF (`\n`), erradicando Windows CRLF (`\r\n`).

### 9. G9: Integridad Operativa, Permisos y Secretos Zero-Trust (Ops Shield)
- **Alcance:** Blindaje de infraestructura y seguridad de credenciales.
- **Acciones:**
  - Verificar permisos restrictivos en sistema de archivos (`chmod 644` archivos / `755` directorios, llaves SSH `600`, propietario correcto del servicio `chown`).
  - Cero credenciales, tokens o contraseñas en texto plano. Gestionar accesos vía variables de entorno seguras o `SECRETOS.py`.

### 10. G10: Invalidación y Purga de Estado Efímero (State Flush)
- **Alcance:** Consumo garantizado del código fresco en runtime.
- **Acciones:**
  - Purgar deterministamente memoria compartida, caché de objetos (`wp cache flush`, Redis, Memcached, Opcache).
  - Limpiar transientes de base de datos o reiniciar workers (Gunicorn, Systemd, SSR Node, PM2) para garantizar que los clientes o servicios consuman el código recién validado sin residuos en memoria.

### 11. G11: Blindaje de Ergonomía del SO, Foco de Ventanas y Aislamiento UI (OS & Desktop Ergonomics Gate)
- **Alcance:** Experiencia de usuario inmaculada, ausencia total de robo de foco y persistencia limpia en el Sistema Operativo.
- **Acciones:**
  - **Inmunidad al Robo de Foco (Zero-Focus Stealing):** Toda invocación de subprocesos en Windows (`Command::new`, `powershell`, `cmd`, `sc`, `reg`, `net`) DEBE incorporar obligatoriamente `.creation_flags(0x08000000)` (`CREATE_NO_WINDOW`) para erradicar consolas emergentes o parpadeos (flickering) que desactiven la ventana activa del usuario.
  - **Zero-Ghost Processes:** Comprobar que al cerrar la aplicación no queden procesos huérfanos (`conhost`, workers zombies) consumiendo CPU.
  - **Caché de Consultas de Privilegios:** Consultas de privilegios (`is_admin`) o del SCM deben usar caché atómico perezoso (`AtomicU8` / `OnceLock`), evitando invocaciones repetidas de subprocesos en bucles de tiempo.

---
### 12. G12: Topología de Rutas Vivas & Dead Link Sweeper (Living Routes Gate)
- **Alcance:** Integridad de navegación sin pantallas 404 ni rutas huérfanas en Web (Astro, React, Next, Vue), Mobile (Flutter, React Native) y Desktop (Slint, C /WPF, Tauri).
- Cero enlaces rotos hacia destinos locales inexistentes.

### 13. G13: Grafo de Interactividad & Erradicación Zombie (Living UI Actions Gate)
- Cero botones decorativos, pseudoelementos inertes o acciones no conectadas que no responden al usuario.

- Todo control interactivo debe resolver en un evento real (API, modal, mutación o feedback).

### 14. G14: Traza de Contratos HTTP & Endpoints Vivos (Living API Contract Gate)
- Consistencia granular entre las llamadas del cliente y los controladores declarados en el backend.
- Cero llamadas fetch o solicitudes HTTP a paths huérfanos o inexistentes.

### 15. G15: Headless E2E Crawler & Runtime Exceptions (Headless Handshake Gate)
- Detección de errores silenciosos, excepciones de runtime y bloqueos de interfaz.
- Certificación del pase limpio de interactividad antes de liberar a producción.

## Reglas Inviolables de Ejecución

1. **Cero Complacencia o Respuestas Evasivas:** No dejar tareas a medias ni usar marcadores vacíos (`// el resto del código aquí`).
2. **Determinismo Técnico:** Todo entregable debe ser determinista, verificado en consola y listo para producción.
3. **Reporte por Compuerta:** Reportar siempre el estado de cada compuerta (G1 a G15) con su respectiva evidencia de consola.