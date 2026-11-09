# AUM-IC PUF — Protocolo Universal contra Fallos (PUF-25)

[![Licencia AGPL-3.0](https://img.shields.io/badge/licencia-AGPL--3.0-blue.svg)](LICENSE)
[![Estándar AUM-IC 7:2026](https://img.shields.io/badge/est%C3%A1ndar-AUM--IC%207%3A2026-gold.svg)](https://github.com/ingcrea/aum-ic)
[![npm version](https://img.shields.io/badge/npm-v3.4.0-cb3837.svg)](https://www.npmjs.com/package/@ingcrea/aumic-puf)

> 🌐 **Navegación:** 🇲🇽 [Leer en Español](./README.es.md) | 🇺🇸 [Read in English](./README.md) | 📜 [Manifiesto (ES)](./MANIFEST.es.md) | 📜 [Manifesto (EN)](./MANIFEST.md) | 🌌 [Estándar AUM-IC 7](https://github.com/ingcrea/aum-ic)

Suite oficial de aseguramiento determinista de calidad y orquestador multi-lenguaje de 25 compuertas (G0 a G24) bajo el estándar **AUM-IC 7:2026**, diseñado y mantenido por **Ingeniería Creativa (IngCrea)**.

---

## Filosofía y Arquitectura del Motor

El Protocolo Universal contra Fallos (PUF) no es un linter superficial ni una colección dispersa de scripts. Es un **motor de auditoría determinista de ciclo cerrado** concebido para erradicar la entropía del software antes de que alcance entornos de producción.

Opera de forma agnóstica a través de adaptadores especializados para **Rust, TypeScript/JavaScript, Astro, Next.js, Python, PHP, Java/JVM, C#, C/C++, Flutter/Dart y Shell**, garantizando cumplimiento riguroso con normativas internacionales de fiabilidad (**ISO/IEC 25010**), seguridad de la información (**ISO 27001**) y testabilidad (**ISO 29119**).

### Características Clave del Motor v3.4.0

* **Auto-Sanador Quirúrgico (`puf sanar` / `puf fix`):** Remediación determinista automatizada de anomalías en G0, G8, G17, G20 y G22, asegurando respaldos inmutables G3 previos con hash SHA-256 antes de cada mutación.
* **Modo Centinela Dual (`puf watch`):** Vigilancia reactiva en caliente que reporta en consola ANSI y despacha notificaciones Toast nativas en el sistema operativo sin robar foco de ventana (cumplimiento ergonómico G11).
* **Servidor MCP Nativo (`puf serve` / `puf mcp`):** Protocolo Model Context Protocol por stdio (JSON-RPC) para integración directa con asistentes de IA (Antigravity, Claude, Cursor) sin latencia de subprocesos.
* **Snapshot VFS en Memoria (`LectorArbolProyecto`):** Mapeo virtual del sistema de archivos con caché volátil estructurado. Permite que las 25 compuertas analicen el repositorio de forma concurrente sin provocar saturación de I/O en disco.
* **Persistencia Forense Indexada (`RepositorioSqliteAudit`):** Almacenamiento nativo en SQLite (`.aumic/puf_audit.sqlite`) de cada ejecución, registrando métricas de latencia, violaciones detectadas y telemetría histórica con tiempos de consulta inferiores a 20 ms.
* **Testing Avanzado Integrado:** Incorpora pruebas de resistencia a mutaciones (G23) e inyección de caos con validación de disyuntores de red (G24).
* **Perfiles Dinámicos de Auditoría (`--profile`):** Flexibilidad de inspección según el ciclo de entrega (`enterprise`, `mvp`, `dev`, `security`).
* **Zero-Black-Box Telemetry:** Reportes forenses interactivos en HTML (`puf-report.html`) con diagramas SVG gauge, tarjetas KPI de impacto y trazabilidad exacta de archivo y línea.

---

## Matriz Exhaustiva de las 25 Compuertas de Calidad (G0 a G24)

### G0: Higiene Forense Anti-Entropía y Codificación Pura (In-Process Sanitizer)
* **Para qué sirve:** Garantiza que ningún byte corrupto, BOM invisible o secuencia de caracteres rotos ingrese al flujo de desarrollo.
* **Qué hace:** Ejecuta diagnósticos directos en memoria (vía motor `aumic-sanitizer`), auditando que el 100% de los archivos del proyecto mantengan codificación **UTF-8 pura sin BOM** y terminaciones de línea Unix **LF (`\n`)**, purgando de inmediato secuencias de mojibake y eliminando el riesgo de discrepancias entre sistemas operativos.

### G1: Mapeo de Comportamientos, Límites y Aislamiento de Hilos (Behavior & Boundary Mapping)
* **Para qué sirve:** Blinda la estabilidad del ciclo de vida y previene la degradación o congelamiento de las interfaces de usuario.
* **Qué hace:** Inspecciona contratos, firmas y puntos de entrada identificando valores extremos (`null`, `undefined`, `None`, cadenas vacías y desbordamientos numéricos). Audita que **ninguna operación pesada de I/O, comandos síncronos ni peticiones de red** se invoquen dentro de temporizadores o bucles directos de la interfaz (`slint::Timer`, `setInterval`, `requestAnimationFrame`), forzando su delegación a tareas asíncronas desacopladas o memorias caché atómicas.

### G2: Test de Reproducción — Fase Roja (Reproduction Test-First)
* **Para qué sirve:** Erradica correcciones a ciegas y asunciones subjetivas al resolver anomalías.
* **Qué hace:** Exige la existencia o creación previa de una prueba automatizada (unitaria, funcional o basada en propiedades) que replique con fidelidad el defecto reportado. El motor verifica que el test falle inequívocamente contra el código base actual (*Estado Rojo*) antes de permitir cualquier mutación de lógica.

### G3: Checkpoint Inmutable de Estado (State Snapshot Guard)
* **Para qué sirve:** Otorga inmunidad frente a pérdidas de código o regresiones destructivas durante una reparación.
* **Qué hace:** Captura una copia de seguridad atómica con marca de tiempo en el directorio `checkpoints/` (`<archivo>.bak_YYYYMMDDHHMMSS`) registrando su huella criptográfica SHA-256. Esto permite realizar reversiones instantáneas e íntegras mediante `puf revertir` si el proceso de remediación se descarrila.

### G4: Reparación Focalizada, Refactorización Limpia y Cero CSS Inline (Pure Logic Refactor)
* **Para qué sirve:** Asegura soluciones de raíz sin parches superficiales, código muerto ni deuda de estilos acoplados.
* **Qué hace:** Audita que la solución resuelva la causa fundamental sin generar efectos colaterales. Impone principios estrictos por lenguaje (en Rust prohíbe `unwrap()` injustificados forzando `Result`/`Option`; en PHP exige `declare(strict_types=1);`; en Astro separa lógica de frontmatter). Prohíbe de manera tajante el uso de atributos `style="..."` inline en HTML, JSX, PHP o Astro, exigiendo que todo diseño resida en hojas `.css` o `.scss` modulares.

### G5: Validación de Test y No-Regresión — Fase Verde (Green State & Non-Regression)
* **Para qué sirve:** Certifica matemáticamente que el defecto quedó subsanado sin romper módulos adyacentes.
* **Qué hace:** Reejecuta el test automatizado introducido en G2 constatando el 100% de aserciones aprobadas (*Estado Verde*). Simultáneamente lanza la suite de pruebas perimetral para validar que ninguna funcionalidad preexistente haya sufrido regresiones.

### G6: Análisis Estático, Tipado y Compilador Estricto (Static Gate Multi-Ecosystem)
* **Para qué sirve:** Cero tolerancia a advertencias, tipos implícitos y descuidos detectables en tiempo de compilación.
* **Qué hace:** Invoca el instrumental estático oficial del lenguaje detectado bajo banderas de rigor máximo:
  * **TypeScript / Astro:** `npx astro check`, `npx tsc --noEmit` y ESLint sin warnings permitidos.
  * **Rust:** `cargo check` y `cargo clippy -- -D warnings`.
  * **Python:** `mypy --strict` y `ruff check`.
  * **PHP:** `php -l` y `phpstan analyse --level=max`.
  * **Java / JVM:** Validación contra Maven (`mvn test-compile`), Gradle o `javac`.
  * **C# / .NET:** `dotnet build /warnaserror`.

### G7: Documentación Semántica y Registro ADR (Intent & Architecture Decision)
* **Para qué sirve:** Preserva la memoria técnica y el razonamiento del porqué se tomaron las decisiones.
* **Qué hace:** Verifica que el código cuente con comentarios que expliquen la intención arquitectónica y valida la existencia y actualización de la bitácora `BITACORA.md` en la raíz del proyecto bajo el formato estricto:
  ```text
  [Timestamp] | Contexto | Decisión | Consecuencia
  ```

### G8: Aplanadora POSIX y Sanitización Anti-Mojibake (POSIX Squasher)
* **Para qué sirve:** Evita fallos de build, inconsistencias en git diffs y scripts inutilizables en entornos Linux/Docker.
* **Qué hace:** Barre en memoria la totalidad de los archivos de código fuente, aplastando de manera definitiva los saltos de línea Windows CRLF (`\r\n`) para forzar Unix LF (`\n`) y erradicando caracteres residuales con codificaciones no compatibles con POSIX.

### G9: Integridad Operativa, Permisos y Secretos Zero-Trust (Ops Shield)
* **Para qué sirve:** Blinda la infraestructura contra fugas de credenciales y permisos de sistema inseguros.
* **Qué hace:** Inspecciona permisos en el sistema de archivos (forzando `644` para archivos regulares, `755` para ejecutables/directorios y `600` para llaves de acceso). Realiza análisis de patrones en búsqueda de credenciales, contraseñas, API keys o tokens expuestos en texto plano, obligando el uso de variables de entorno o bóvedas de secretos.

### G10: Invalidación y Purga de Estado Efímero (State Flush)
* **Para qué sirve:** Garantiza que clientes y desarrolladores consuman código fresco, descartando cachés corrompidas.
* **Qué hace:** Localiza y purga de forma determinista árboles de compilación residuales y cachés locales (`.next`, `.turbo`, `dist`, `target`, `__pycache__`, `.phpunit.cache`, `storage/framework/cache`), recomendando o ejecutando el reinicio controlado de workers (PM2, Systemd, Gunicorn) según corresponda.

### G11: Blindaje de Ergonomía del SO y Cero Robo de Foco (Zero-Focus Stealing Guard)
* **Para qué sirve:** Evita la degradación de la experiencia del usuario y parpadeos molestos en el sistema operativo.
* **Qué hace:** En entornos de escritorio Windows, audita que toda llamada a subprocesos nativos (`Command::new`, `powershell`, `cmd`, `exec`) incorpore obligatoriamente la bandera `creation_flags(0x08000000)` (`CREATE_NO_WINDOW`), impidiendo la aparición repentina de ventanas de consola negras que roben el foco del usuario. Igualmente audita que las consultas repetitivas de privilegios se resuelvan mediante cachés atómicos (`AtomicU8` / `OnceLock`).

### G12: Topología de Rutas Vivas y Barredora de Enlaces Rotos (Living Routes Gate)
* **Para qué sirve:** Erradica pantallas 404 y enlaces huérfanos antes del despliegue.
* **Qué hace:** Escanea archivos de plantillas y componentes (`.astro`, `.tsx`, `.jsx`, `.vue`, `.html`, `.php`), extrayendo atributos `href`, `src`, `to` y `action`. Verifica que cada ruta relativa local referenciada tenga una correspondencia física real en el árbol de rutas del proyecto.

### G13: Grafo de Interactividad y Erradicación Zombie (Living UI Actions Gate)
* **Para qué sirve:** Asegura que ningún control en pantalla sea un adorno inútil o carezca de respuesta.
* **Qué hace:** Analiza sintácticamente la interfaz buscando eventos interactivos huérfanos o inertes (`onClick=""`, `onClick={undefined}`, `on:click=""`, `@click=""`, botones sin atributo de tipo o sin listener). Todo elemento interactivo debe desencadenar un flujo concreto: llamada de API, apertura modal, mutación de estado o respuesta háptica/visual.

### G14: Traza de Contratos HTTP y Endpoints Vivos (Living API Contract Gate)
* **Para qué sirve:** Previene discrepancias entre los llamados frontend y los endpoints provistos por el backend.
* **Qué hace:** Rastrea invocaciones cliente (`fetch(...)`, `axios.get/post/...`, `ky`) contrastando que no existan rutas huérfanas, endpoints deprecados ni rutas locales relativas no mapeadas en los controladores del servidor.

### G15: Headless E2E Crawler y Runtime Exceptions (Headless Handshake Gate)
* **Para qué sirve:** Captura fallos silenciosos de renderizado, bloqueos de layout y excepciones de consola no controladas.
* **Qué hace:** Detecta la existencia de suites E2E (Playwright `playwright.config.ts` o Cypress `cypress.config.ts`). Si existen, valida su integración determinista; si no están configuradas, marca la compuerta como `omitida` con una recomendación técnica sin bloquear el proceso general de certificación.

### G16: Calidad Visual, Core Web Vitals y Auditoría Web (Lighthouse / CWV Guard)
* **Para qué sirve:** Asegura puntuaciones competitivas en motores de búsqueda y una experiencia de usuario de alto nivel.
* **Qué hace:** Evalúa métricas críticas de rendimiento web (LCP - Largest Contentful Paint, CLS - Cumulative Layout Shift, INP - Interaction to Next Paint), accesibilidad (a11y), cumplimiento de SEO y buenas prácticas. Exige una calificación mínima promedio de 70/100 sobre reportes locales (`aumic-live-report.json`) o telemetría en vivo.

### G17: Blindaje Legal, Integridad de Licencias y Compatibilidad (IP & License Guard)
* **Para qué sirve:** Protege la titularidad intelectual del software y previene litigios o incompatibilidades de código abierto.
* **Qué hace:** Audita la consistencia legal entre el manifiesto (`package.json`, `Cargo.toml`, `composer.json`) y los archivos físicos de licenciamiento (`LICENSE`, `LICENSE.md`, `LICENSE-DOCS`). Erradica placeholders sin llenar (ej. `<year>`, `<owner>`), valida compatibilidad de licencias de terceros y ofrece modo consultivo para código privativo de clientes.

### G18: Consistencia de Motores de Estilo y Erradicación de Antipatrones (Style Engine Consistency)
* **Para qué sirve:** Mantiene un diseño limpio y previene conflictos catastróficos entre librerías CSS.
* **Qué hace:** Audita que el proyecto no mezcle frameworks antagónicos (por ejemplo, Tailwind CSS y Bootstrap conviviendo en el mismo proyecto). Adicionalmente, fiscaliza la deuda técnica de especificidad CSS, marcando alerta o rechazo si la presencia de la regla `!important` excede el umbral tolerado (máximo 5 ocurrencias justificadas).

### G19: Blindaje de Superficie de Ataque y Cero Inyecciones (Zero-Injection & Attack Surface Guard)
* **Para qué sirve:** Cierra vectores de ataque comunes y previene intrusiones o robo de información.
* **Qué hace:** Escanea el repositorio descartando la presencia accidental de volcados de base de datos (`dump.sql`, `backup.sql`), scripts de diagnóstico peligrosos (`phpinfo.php`, `xmlrpc.php`) o llaves privadas SSH. Audita que el archivo `.env` se encuentre estrictamente ignorado en `.gitignore` e identifica patrones de concatenación directa de entradas de usuario en sentencias SQL, forzando consultas parametrizadas o Query Builders tipados.

### G20: Topología de Entornos y Cero Conexiones Fantasma (Topology Guard)
* **Para qué sirve:** Erradica fallos silenciosos y llamadas a servidores de desarrollo en despliegues a producción.
* **Qué hace:** Analiza el código fuente en búsqueda de direcciones locales (`http://localhost`, `127.0.0.1`) hardcodeadas dentro de controladores o servicios de producción, exigiendo su desacoplamiento absoluto mediante variables de entorno configuradas por entorno (`dev`, `staging`, `prod`).

### G21: Cumplimiento Oficial WordPress y WooCommerce (WPCS & WC Guidelines Guard)
* **Para qué sirve:** Garantiza código seguro, preparado para HPOS y resistente a fallos transaccionales en plataformas WordPress y WooCommerce.
* **Qué hace:** Se activa automáticamente al detectar proyectos PHP/WordPress ejecutando un conjunto de reglas especializadas:
  * **`WP-SEC-01` (Sanitización y Nonces):** Valida sanitización de superglobales (`$_GET`, `$_POST`, `$_REQUEST`) y verificación obligatoria de nonces con `check_admin_referer()` / `wp_verify_nonce()`.
  * **`WP-SEC-02` (Prepared Queries):** Prohíbe consultas directas a `$wpdb` sin `$wpdb->prepare()`.
  * **`WC-HPOS-01` (CRUD Mandatorio de Pedidos):** Prohíbe lecturas o escrituras directas a `wp_postmeta` para metadatos de pedidos, forzando los métodos canónicos de la API CRUD de `WC_Order` (`$order->get_id()`, `$order->get_meta()`, `$order->update_meta_data()`, `$order->save()`).
  * **`WC-CORE-01` (Propiedades Obsoletas):** Detecta accesos a propiedades deprecadas del core de WooCommerce (como `$order->id`).
  * **`WP-ROBUST-OPT-01` (Empty Coalesce Guard):** Previene fallos sutiles donde el operador `??` sobre arrays de opciones falla porque una cadena vacía (`''`) no se evalúa como nula, evadiendo los valores de respaldo indispensables.
  * **`WP-CIRCUIT-BREAKER-01` (Hardcoded Flags):** Detecta banderas booleanas fijas en código que bloquean silenciosamente flujos transaccionales o de pago.

### G22: Diagnóstico Universal de Sintaxis y Delimitadores (Universal Syntax Guard)
* **Para qué sirve:** Diagnostica en milisegundos errores sintácticos sutiles sin requerir compiladores pesados instalados en la máquina.
* **Qué hace:** Motor de análisis sintáctico in-memory multi-lenguaje (PHP, CSS/SCSS, JSON, JavaScript, TypeScript, Java) que:
  * Localiza omisiones exactas de punto y coma (`;`) en sentencias PHP y CSS/SCSS.
  * Audita la integridad de archivos JSON (detectando comas faltantes o trailing commas no permitidas).
  * Evalúa el balanceo perfecto de delimitadores (`{ }`, `[ ]`, `( )`), ignorando inteligentemente literales de cadenas, comentarios y expresiones regulares para reportar la línea precisa de cualquier desbalance.

### G23: Resistencia a Mutaciones y Aserciones Vacías (Mutation Resilience Guard)
* **Para qué sirve:** Erradica el falso confort de suites con 100% de cobertura que no tienen capacidad real de atrapar fallos lógicos.
* **Qué hace:** Audita la efectividad de las pruebas evaluando si las aserciones son vacías, complacientes o tautológicas (`expect(true).toBe(true)`). Comprueba que los tests sometan el código a validaciones de estado reales que fallen obligatoriamente si un operador lógico, aritmético o de bifurcación es alterado en la lógica intervenida.

### G24: Inyección de Caos, Disyuntores y Auto-Sanación (Chaos & Fault Injection Guard)
* **Para qué sirve:** Garantiza que la aplicación sobreviva a la latencia extrema, micro-cortes y caídas de servicios externos sin colapsar el sistema operativo ni el proceso principal.
* **Qué hace:** Inspecciona la arquitectura de transporte HTTP y conexiones a bases de datos en busca de vulnerabilidades ante fallas de red:
  * Detecta invocaciones cliente sin timeouts explícitos ni señales de aborto (`AbortController`).
  * Verifica la implementación de **Disyuntores (Circuit Breakers)** y bucles de reintento con retroceso exponencial (**Exponential Backoff**) para aislar dependencias degradadas y permitir la auto-recuperación sin intervención humana.

---

## Perfiles Dinámicos de Auditoría (`--profile`)

Para optimizar pipelines de integración continua o verificaciones rápidas antes de un commit, el PUF incorpora perfiles de auditoría seleccionables:

| Perfil | Compuertas Evaluadas | Caso de Uso |
| :--- | :--- | :--- |
| **`enterprise`** *(Predeterminado)* | **G0 a G24 (25 compuertas)** | Certificación integral obligatoria previa a releases y despliegues productivos. |
| **`mvp`** | `G0`, `G4`, `G6`, `G8`, `G22` | Verificación ágil de prototipos rápidos: higiene, lógica limpia, tipado estricto y sintaxis. |
| **`dev`** | `G0`, `G4`, `G6`, `G8`, `G22` | Ciclo de desarrollo local ultrarrápido sin bloqueos por suites accesorias. |
| **`security`** | `G0`, `G8`, `G9`, `G17`, `G19`, `G20`, `G24` | Auditoría de ciberseguridad, permisos POSIX, blindaje legal, topología, cero inyecciones y resiliencia ante caos. |

---

## Manual de Uso del CLI (`puf` / `aumic-puf`)

### Instalación

```bash
# Instalación global vía npm
npm install -g @ingcrea/aumic-puf

# O uso directo sin instalación vía npx
npx @ingcrea/aumic-puf auditar
```

### Comandos de Operación

#### 1. Auditoría Completa de la Matriz (Enterprise)
```bash
# Audita las 25 compuertas de calidad concurrentemente en el directorio actual
puf auditar

# Ejecución fail-fast (aborta de inmediato al primer fallo detectado)
puf auditar --fast
```

#### 2. Auditoría por Perfil Dinámico
```bash
# Auditoría rápida para entornos de desarrollo local
puf auditar --profile=dev

# Auditoría estricta de seguridad perimetral y resiliencia
puf auditar --profile=security

# Auditoría ligera de entrega rápida (MVP)
puf auditar --profile=mvp
```

#### 3. Auditoría Focalizada por Compuertas
```bash
# Evalúa mutaciones, resiliencia ante caos y compliance WordPress
puf auditar -g G21,G23,G24

# Evalúa higiene forense y sintaxis universal
puf auditar -g G0,G8,G22
```

#### 4. Gestión de Incidentes y Reversión Atómica
```bash
# Inicia un incidente (genera andamio de test G2 y captura checkpoint inmutable G3)
puf iniciar INC-105 "Blindaje de resiliencia en pasarela" src/checkout.ts

# Reversión de emergencia a partir del checkpoint SHA-256 en caso de error
puf revertir INC-105 src/checkout.ts
```

#### 5. Blindaje de Repositorio Git (Pre-commit Hook)
```bash
# Instala el guardián nativo en .git/hooks/pre-commit
puf instalar-hook

# Validación en staged: impide realizar commits si se violan G4 (código muerto/CSS inline) o G7 (ADR)
puf guard
```

#### 6. Consulta de Versión
```bash
puf -v
# o
puf --version
```

---

## Integración Continua (GitHub Actions)

El repositorio incluye la plantilla oficial [`puf-github-action.yml`](puf-github-action.yml). Para blindar cualquier repositorio en GitHub:

```yaml
name: Certificación AUM-IC PUF-25
on: [push, pull_request]

jobs:
  auditoria-puf:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout del Repositorio
        uses: actions/checkout@v4

      - name: Configurar Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Ejecutar Auditoría PUF
        run: npx @ingcrea/aumic-puf auditar --profile=enterprise --fast
```

---

## Licencia y Propiedad Intelectual

Distribuido bajo licencia **GNU Affero General Public License v3.0 (AGPL-3.0)**. Consulta el archivo [LICENSE](LICENSE) para mayores detalles sobre derechos y libertades de uso de software libre.

---

**[Ingeniería Creativa (IngCrea)](https://ingcrea.com)** | [Estándar AUM-IC 7:2026](https://github.com/ingcrea/aum-ic)
