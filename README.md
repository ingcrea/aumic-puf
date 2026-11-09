# AUM-IC PUF — Universal Failure Prevention Protocol (PUF-25)

[![AGPL-3.0 License](https://img.shields.io/badge/license-AGPL--3.0-blue.svg)](LICENSE)
[![AUM-IC 7:2026 Standard](https://img.shields.io/badge/standard-AUM--IC%207%3A2026-gold.svg)](https://github.com/ingcrea/aum-ic)
[![npm version](https://img.shields.io/badge/npm-v3.4.0-cb3837.svg)](https://www.npmjs.com/package/@ingcrea/aumic-puf)

> 🌐 **Navigation:** 🇺🇸 [Read in English](./README.md) | 🇲🇽 [Leer en Español](./README.es.md) | 📜 [Manifesto (EN)](./MANIFEST.md) | 📜 [Manifiesto (ES)](./MANIFEST.es.md) | 🌌 [AUM-IC 7 Standard](https://github.com/ingcrea/aum-ic)

Official deterministic quality assurance engine and 25-gate universal multi-language orchestrator (G0 to G24) implementing the **AUM-IC 7:2026 Standard**, engineered and maintained by **Ingeniería Creativa (IngCrea)**.

---

## Engine Philosophy and Architecture

The Universal Failure Prevention Protocol (PUF) is not a surface-level linter or a disjointed set of scripts. It is a **closed-loop deterministic audit engine** engineered to eradicate software entropy before code ever reaches production.

Operating agnostically via specialized language adapters for **Rust, TypeScript/JavaScript, Astro, Next.js, Python, PHP, Java/JVM, C#, C/C++, Flutter/Dart, and Shell**, it enforces compliance with international reliability (**ISO/IEC 25010**), information security (**ISO 27001**), and testability (**ISO 29119**) benchmarks.

### Key Engine Features in v3.4.0

* **Deterministic Surgical Auto-Fix (`puf sanar` / `puf fix`):** Automated deterministic resolution for G0, G8, G17, G20, and G22 violations, creating immutable G3 checkpoints with SHA-256 hashes prior to mutating files.
* **Dual Watch Sentinel (`puf watch`):** Reactive filesystem listener reporting both in ANSI terminal and native non-intrusive OS toast notifications (G11 ergonomic compliance).
* **Native MCP Server (`puf serve` / `puf mcp`):** Built-in Model Context Protocol server over stdio (JSON-RPC) enabling seamless, zero-latency integration with AI agents (Antigravity, Claude, Cursor).
* **In-Memory VFS Snapshot (`LectorArbolProyecto`):** Structured volatile filesystem snapshot caching. Enables all 25 gates to evaluate project structure and code concurrently with zero disk I/O bottleneck.
* **Indexed Forensic Persistence (`RepositorioSqliteAudit`):** Native SQLite engine persistence (`.aumic/puf_audit.sqlite`) recording execution latency, identified infractions, and historical audit telemetry with sub-20ms query overhead.
* **Integrated Advanced Testing:** Incorporates Mutation Resilience Verification (G23) and Chaos Fault Injection with Circuit Breaker inspection (G24).
* **Dynamic Audit Profiles (`--profile`):** Adaptable gate execution matching pipeline requirements (`enterprise`, `mvp`, `dev`, `security`).
* **Zero-Black-Box Telemetry:** Comprehensive HTML forensic dashboard (`puf-report.html`) complete with SVG compliance gauges, key impact KPI tiles, and pinpointed line-by-line violation reports.

---

## Comprehensive Matrix of Quality Gates (G0 to G24)

### G0: Forensic Anti-Entropy & Encoding Hygiene (In-Process Sanitizer)
* **Purpose:** Ensures zero corrupted bytes, phantom BOM markers, or invalid character sequences enter development streams.
* **What it does:** Runs in-process memory diagnostics via `aumic-sanitizer`, auditing that 100% of codebase files maintain **pure UTF-8 without BOM** and POSIX Unix **LF (`\n`)** line breaks. Automatically purges mojibake artifacts and prevents cross-platform runtime discrepancies.

### G1: Behavior & Boundary Mapping and UI Loop Isolation (Behavior & Boundary Mapping)
* **Purpose:** Fortifies runtime state integrity and prevents UI starvation or application lockups.
* **What it does:** Scans input contracts, signatures, and edge cases (`null`, `undefined`, `None`, empty strings, and numerical overflows). Strictly enforces that **no heavy disk I/O, synchronous commands, or network queries** run inside graphical UI timers or event callbacks (`slint::Timer`, `setInterval`, `requestAnimationFrame`), requiring delegation to detached asynchronous tasks or atomic memory caches.

### G2: Reproduction Test-First — Red Phase (Reproduction Test-First)
* **Purpose:** Prevents guesswork and subjective speculation during defect resolution.
* **What it does:** Mandates the presence or authoring of an automated test (unit, integration, or property-based) faithfully reproducing the reported flaw. Verifies that the test unmistakably fails against the current codebase (*Red State*) before any production code modification is allowed.

### G3: Immutable State Checkpoint (State Snapshot Guard)
* **Purpose:** Delivers immunity against destructive regressions or data loss during bug mitigation.
* **What it does:** Generates an atomic timestamped backup inside `checkpoints/` (`<file>.bak_YYYYMMDDHHMMSS`) hashing its state with SHA-256. Enables instant, lossless rollbacks via `puf revertir` if a fix deviates from expectations.

### G4: Pure Logic Refactor & Zero Inline CSS (Pure Logic Refactor)
* **Purpose:** Guarantees root-cause remediation without quick hacks, dead code, or coupled styling debt.
* **What it does:** Verifies that the patch addresses the root architectural flaw without producing side effects. Enforces clean-code practices per language (forbids unjustified `unwrap()` in Rust favoring `Result`/`Option`; mandates `declare(strict_types=1);` in PHP; separates frontmatter from JSX in Astro). Strictly bans inline `style="..."` attributes across HTML, JSX, PHP, or Astro, enforcing modular `.css` or `.scss` stylesheets.

### G5: Test Validation & Non-Regression — Green Phase (Green State & Non-Regression)
* **Purpose:** Mathematically validates defect resolution without adjacent module regressions.
* **What it does:** Re-executes the automated test introduced in G2, validating 100% passing assertions (*Green State*). Concurrently executes perimetral test suites to ensure zero pre-existing system behaviors were degraded.

### G6: Strict Static Analysis, Typing & Compiler Rigor (Static Gate Multi-Ecosystem)
* **Purpose:** Zero tolerance for compiler warnings, implicit types, and build-time slips.
* **What it does:** Executes official language toolchains under maximum rigor:
  * **TypeScript / Astro:** `npx astro check`, `npx tsc --noEmit`, and zero ESLint warnings tolerated.
  * **Rust:** `cargo check` and `cargo clippy -- -D warnings`.
  * **Python:** `mypy --strict` and `ruff check`.
  * **PHP:** `php -l` and `phpstan analyse --level=max`.
  * **Java / JVM:** Validation across Maven (`mvn test-compile`), Gradle, or `javac`.
  * **C# / .NET:** `dotnet build /warnaserror`.

### G7: Semantic Architecture Documentation & ADR Logging (Intent & Architecture Decision)
* **Purpose:** Safeguards technical memory and the rationale underlying design choices.
* **What it does:** Audits code comments for design intent beyond syntactic operation. Validates the existence and updates of `BITACORA.md` in the project root adhering to the canonical format:
  ```text
  [Timestamp] | Context | Decision | Consequence
  ```

### G8: POSIX Squasher & Character Sanitization (POSIX Squasher)
* **Purpose:** Prevents build breaks, noisy git diffs, and unexecutable scripts across Linux/Docker environments.
* **What it does:** Sweeps all repository files in memory, squashing Windows CRLF (`\r\n`) line endings into POSIX Unix LF (`\n`) and wiping out non-compliant character artifacts.

### G9: Operational Integrity, File Permissions & Zero-Trust Secrets (Ops Shield)
* **Purpose:** Shields infrastructure against exposed credentials and risky filesystem permissions.
* **What it does:** Inspects filesystem security modes (enforcing `644` for general files, `755` for directories/executables, and `600` for private credentials). Scans for hardcoded tokens, passwords, database credentials, or API keys in plaintext, forcing storage via environment variables or secret vaults.

### G10: Ephemeral State Flush & Cache Invalidation (State Flush)
* **Purpose:** Guarantees clients and developers consume fresh code, removing stale compilation artifacts.
* **What it does:** Locates and purges build trees and local caches (`.next`, `.turbo`, `dist`, `target`, `__pycache__`, `.phpunit.cache`, `storage/framework/cache`), dispatching graceful worker restart notifications (PM2, Systemd, Gunicorn) as required.

### G11: OS Ergonomics & Zero-Focus Stealing (Zero-Focus Stealing Guard)
* **Purpose:** Prevents user distraction and jarring command prompt flickers in native environments.
* **What it does:** In Windows desktop stacks, enforces that all native subprocess calls (`Command::new`, `powershell`, `cmd`, `exec`) supply `creation_flags(0x08000000)` (`CREATE_NO_WINDOW`), eliminating intrusive black console popups. Audits that repeated privilege lookups leverage atomic lazy caches (`AtomicU8` / `OnceLock`).

### G12: Living Routes Topology & Dead Link Sweeper (Living Routes Gate)
* **Purpose:** Eliminates 404 pages and dead local references prior to production deployment.
* **What it does:** Scans web markup and templates (`.astro`, `.tsx`, `.jsx`, `.vue`, `.html`, `.php`), extracting `href`, `src`, `to`, and `action` parameters. Confirms that all relative local references resolve directly to physical assets on the filesystem.

### G13: Living UI Actions Graph & Zombie Eradication (Living UI Actions Gate)
* **Purpose:** Ensures interactive interface elements are functionally wired rather than purely decorative.
* **What it does:** Statically evaluates UI code detecting zombie handlers (`onClick=""`, `onClick={undefined}`, `on:click=""`, `@click=""`, buttons missing actionable event bindings). Every control must lead to state mutation, API dispatch, modal presentation, or active user feedback.

### G14: HTTP Contract Traceability & Living Endpoints (Living API Contract Gate)
* **Purpose:** Prevents discrepancies between client-side requests and registered backend routes.
* **What it does:** Tracks client HTTP invocations (`fetch(...)`, `axios.get/post/...`, `ky`), asserting that no unmapped endpoints, deprecated APIs, or broken relative routes are queried.

### G15: Headless E2E Crawler & Runtime Exceptions (Headless Handshake Gate)
* **Purpose:** Catches silent runtime crashes, unresponsive UI flows, and unhandled console errors.
* **What it does:** Verifies the presence of E2E suites (Playwright `playwright.config.ts` or Cypress `cypress.config.ts`). If found, ensures deterministic invocation; if absent, flags the gate as `omitida` (skipped) with actionable recommendations without halting build certification.

### G16: Visual Quality, Core Web Vitals & Web Audit (Lighthouse / CWV Guard)
* **Purpose:** Enforces competitive search engine indexing and responsive, stutter-free user experiences.
* **What it does:** Measures Core Web Vitals (LCP - Largest Contentful Paint, CLS - Cumulative Layout Shift, INP - Interaction to Next Paint), accessibility compliance (a11y), SEO architecture, and best practices. Enforces a minimum aggregate score of 70/100 from local audits (`aumic-live-report.json`) or live browser telemetry.

### G17: Intellectual Property, License Integrity & Dependency Safety (IP & License Guard)
* **Purpose:** Protects corporate software ownership and defends against open-source licensing infractions.
* **What it does:** Validates alignment between package manifests (`package.json`, `Cargo.toml`, `composer.json`) and physical license files (`LICENSE`, `LICENSE.md`, `LICENSE-DOCS`). Purges unresolved license template placeholders (e.g. `<year>`, `<owner>`), checks third-party license compatibility, and provides non-blocking advisory modes for private client codebases.

### G18: Style Engine Consistency & Antipattern Eradication (Style Engine Consistency)
* **Purpose:** Maintains stylesheet predictability and avoids catastrophic layout engine collisions.
* **What it does:** Detects mutually antagonistic styling frameworks (such as bundling Tailwind CSS and Bootstrap together). Audits stylesheet specificity debt, flagging projects where `!important` declarations exceed acceptable tolerance thresholds (maximum 5 justified usages).

### G19: Attack Surface Shield & Zero Injection (Zero-Injection & Attack Surface Guard)
* **Purpose:** Neutralizes common attack vectors and blocks credential exposure or database intrusion.
* **What it does:** Inspects repository files ensuring no uncommitted database dumps (`dump.sql`, `backup.sql`), dangerous diagnostics (`phpinfo.php`, `xmlrpc.php`), or SSH private keys are exposed. Verifies `.env` files are strictly tracked inside `.gitignore`, and audits SQL execution against direct string concatenation, demanding parameterized queries or typed Query Builders.

### G20: Environment Topology & Zero Cross-Contamination (Topology Guard)
* **Purpose:** Prevents staging leaks and hardcoded developmental URLs in production releases.
* **What it does:** Sweeps source files for hardcoded developmental endpoints (`http://localhost`, `127.0.0.1`), requiring full decoupling through dedicated environment variables configured per target infrastructure (`dev`, `staging`, `prod`).

### G21: Official WordPress & WooCommerce Compliance (WPCS & WC Guidelines Guard)
* **Purpose:** Enforces secure, HPOS-ready, and resilient coding standards in WordPress and WooCommerce ecosystems.
* **What it does:** Activates automatically upon detecting WordPress/PHP codebases, running specialized inspection rules:
  * **`WP-SEC-01` (Sanitization & Nonces):** Requires sanitization of superglobals (`$_GET`, `$_POST`, `$_REQUEST`) and CSRF defense via `check_admin_referer()` / `wp_verify_nonce()`.
  * **`WP-SEC-02` (Prepared Queries):** Prohibits raw `$wpdb` queries missing `$wpdb->prepare()`.
  * **`WC-HPOS-01` (Mandatory CRUD Orders):** Forbids direct `wp_postmeta` access for order management, enforcing canonical `WC_Order` CRUD methods (`$order->get_id()`, `$order->get_meta()`, `$order->update_meta_data()`, `$order->save()`).
  * **`WC-CORE-01` (Deprecated Properties):** Flags legacy WooCommerce properties (such as accessing `$order->id` directly).
  * **`WP-ROBUST-OPT-01` (Empty Coalesce Guard):** Detects fragile usage of the null coalescing operator `??` over configuration arrays where empty strings (`''`) bypass fallback defaults.
  * **`WP-CIRCUIT-BREAKER-01` (Hardcoded Flags):** Identifies static boolean flags that silently obstruct transactional or payment processing pipelines.

### G22: Universal Syntax, Delimiter & Balance Guard (Universal Syntax Guard)
* **Purpose:** Diagnoses subtle syntax errors in milliseconds across diverse languages without external compilers.
* **What it does:** Fast in-memory parsing engine covering PHP, CSS/SCSS, JSON, JavaScript, TypeScript, and Java:
  * Spots missing semicolons (`;`) in PHP instructions and CSS/SCSS property declarations.
  * Audits JSON integrity (detecting unescaped structures, missing commas, or trailing commas).
  * Evaluates perfect bracket balance (`{ }`, `[ ]`, `( )`), smartly ignoring strings, inline comments, and regular expression literals to pinpoint the exact line of any imbalance.

### G23: Mutation Resilience & Assertions Verification (Mutation Resilience Guard)
* **Purpose:** Eradicates the illusion of safety provided by high coverage test suites lacking assertion power.
* **What it does:** Audits test effectiveness by detecting vacuous, complacently passed, or tautological assertions (`expect(true).toBe(true)`). Verifies that tests enforce genuine state contracts capable of catching mutant logic deviations if operators are inverted in production code.

### G24: Chaos Fault Injection & Circuit Breakers (Chaos & Fault Injection Guard)
* **Purpose:** Ensures distributed microservices and database clients survive high network latency and intermittent outages without process deadlock.
* **What it does:** Audits client HTTP transport and database connections for resilience engineering patterns:
  * Detects unbound fetch calls lacking abort timeouts or explicit `AbortController` signals.
  * Validates the integration of **Circuit Breakers** and **Exponential Backoff Reconnect Loops** to isolate degraded downstream dependencies without human intervention.

---

## Dynamic Audit Profiles (`--profile`)

To accelerate continuous integration pipelines and local pre-commit cycles, PUF provides four specialized execution profiles:

| Profile | Evaluated Gates | Primary Use Case |
| :--- | :--- | :--- |
| **`enterprise`** *(Default)* | **G0 through G24 (All 25 Gates)** | Complete gate certification required prior to production release or distribution. |
| **`mvp`** | `G0`, `G4`, `G6`, `G8`, `G22` | Rapid proof-of-concept audit: forensic hygiene, pure logic, strict static checks, and syntax. |
| **`dev`** | `G0`, `G4`, `G6`, `G8`, `G22` | Lightning-fast local development loop without external dependency overhead. |
| **`security`** | `G0`, `G8`, `G9`, `G17`, `G19`, `G20`, `G24` | Dedicated security, secret hygiene, topology, and network resilience audit. |

---

## Command Line Interface Manual (`puf` / `aumic-puf`)

### Installation

```bash
# Global installation from npm
npm install -g @ingcrea/aumic-puf

# Or direct zero-install execution via npx
npx @ingcrea/aumic-puf auditar
```

### Operational Commands

#### 1. Full Matrix Audit (Enterprise)
```bash
# Concurrently evaluates all 25 quality gates across the current directory
puf auditar

# Fail-fast execution (immediately halts upon encountering the first failure)
puf auditar --fast
```

#### 2. Dynamic Profile Auditing
```bash
# Fast local development check
puf auditar --profile=dev

# Dedicated security shield and resilience audit
puf auditar --profile=security

# Rapid prototype audit
puf auditar --profile=mvp
```

#### 3. Granular Gate Targeting
```bash
# Run only mutation tests, chaos injection, and WordPress compliance
puf auditar -g G21,G23,G24

# Run encoding hygiene, POSIX squasher, and universal syntax guard
puf auditar -g G0,G8,G22
```

#### 4. Incident Workflow & Rollback
```bash
# Initialize incident (generates G2 test harness and creates G3 immutable state snapshot)
puf iniciar INC-105 "Resilience hardening in gateway" src/checkout.ts

# Lossless rollback to SHA-256 pre-mutation state
puf revertir INC-105 src/checkout.ts
```

#### 5. Git Pre-Commit Hook Integration
```bash
# Installs native git hook at .git/hooks/pre-commit
puf instalar-hook

# Git staged check: blocks commit if G4 (dead code/inline CSS) or G7 (ADR) are violated
puf guard
```

#### 6. Version Inquiry
```bash
puf -v
# or
puf --version
```

---

## Continuous Integration (GitHub Actions)

The repository packages an official workflow template [`puf-github-action.yml`](puf-github-action.yml). To integrate into any GitHub repository:

```yaml
name: AUM-IC PUF-25 Certification
on: [push, pull_request]

jobs:
  puf-audit:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Run PUF Audit
        run: npx @ingcrea/aumic-puf auditar --profile=enterprise --fast
```

---

## License & Intellectual Property

Distributed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**. Refer to [LICENSE](LICENSE) for full licensing terms, freedoms, and legal provisions.

---

**[Ingeniería Creativa (IngCrea)](https://ingcrea.com)** | [AUM-IC 7:2026 Standard](https://github.com/ingcrea/aum-ic)
