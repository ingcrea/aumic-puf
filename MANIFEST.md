# 📜 ARCHITECTURAL MANIFESTO: AUM-IC 7 STANDARD (2026 EDITION)

<p align="center">
  <img src="https://img.shields.io/badge/version-7.0.0-crimson?style=flat-square" alt="Version 7.0.0">
  <img src="https://img.shields.io/badge/nature-Pure%20Engineering%20Standard-38bdf8?style=flat-square" alt="Nature">
  <img src="https://img.shields.io/badge/suite-PUF--25%20Assurance-gold?style=flat-square" alt="PUF-25">
</p>

> 🌐 **Navigation:** 🇺🇸 [Read in English](./MANIFEST.md) | 🇲🇽 [Leer en Español](./MANIFEST.es.md) | 📖 [README (EN)](./README.md) | 📖 [README (ES)](./README.es.md) | 🌌 [AUM-IC 7 Standard](https://github.com/ingcrea/aum-ic)

This document governs the **Multidimensional Universe Architecture Paradigm (AUM-IC 7 Standard)** and its operational correspondence with the 25-gate matrix of the **Universal Failure Prevention Protocol (PUF-25)**.

It is neither an arbitrary folder recommendation nor a cosmetic convention: it is a deterministic framework of architecture, fractal symmetry, and software physics engineered to inherently satisfy international product quality (**ISO/IEC 25010**), information security (**ISO 27001**), testability (**ISO 29119**), and web accessibility standards (**ISO 40500 / WCAG 2.2**).

---

## 🌌 The Fundamental Philosophy: Entropy vs. Mathematical Precision

**Human software development without discipline is uncontrolled entropy.** It degrades into chaotic sprawl: circular imports, shallow monkey-patches, toxic coupling, memory leaks, and services collapsing under unanticipated concurrency spikes.

The physical universe, while seemingly chaotic, operates under immutable mathematical laws. From elementary quantum interactions to massive planetary mechanics, nothing is left to chance.

**The AUM-IC Paradigm binds software to these same universal laws.** It serves as an absolute mental model, **100% language-agnostic** (Rust, TypeScript, Python, Astro, PHP, Java, C#, Swift, Shell), categorizing systems into **Observable Matter** (fractal codebase structure), **Invisible Forces** (data flow and SRE resilience), and **Laws of Correspondence** (critical mass scalability).

---

## PART I: OBSERVABLE MATTER (Fractal Code Structure)

The Hermetic Principle of Correspondence dictates: *"As above, so below"*. Software components are arranged in strict fractal symmetry across the UI, API Controllers, and Persistence layers:

```text
src/
├── 1-atoms/       # Irreducible elements (Buttons, pure math helpers, primitives)
├── 2-molecules/   # Simple composite groups (Form fields with label/error, middlewares)
├── 3-cells/       # Functional interactive containers (Cards, ORM entities, unitary services)
├── 4-organisms/   # Autonomous business modules (Checkout flows, domain use-cases, orchestrators)
├── 5-planets/     # Full application views or API controllers (Dashboard screens, REST/gRPC handlers)
└── 6-layouts/     # Structural gravitational grid (Master templates, server bootstrap modules)
```

* **Zero-Gravity Rule:** Atoms (`1-atoms/`) must remain entirely stateless and cannot import higher-level modules, state managers, or database connections. Gravitational mass and logic density are reserved strictly for organisms and planets.

---

## PART II: THE 7 COSMIC FORCES (SRE & Security Core)

Every production system must enforce 7 dynamic laws governing data flow and runtime resilience:

1. **Dark Matter (Global State):** The invisible gravitational bond. Global application state (Zustand, Redux, background memory daemons) connects organisms without toxic coupling (*Prop Drilling is strictly forbidden*).
2. **Event Horizon (Perimeter Security):** The impenetrable boundary. Enforces strict Content Security Policy (CSP), rate limiting, bot challenges, and cryptographic JWT verification. Any payload lacking a valid spectral signature is rejected at the middleware gateway.
3. **Magnetic Field (ORM & Sanitization):** Shields the system core against cosmic radiation (SQL Injections and XSS attacks). Raw unparameterized SQL strings are banned. Matter cannot be arbitrarily destroyed: **Soft Deletes** and declarative schema migrations are mandatory.
4. **The Hadron Collider (PUF-25 Closed-Loop Assurance):** Chaos does not enter production. Prior to any release, code must clear the 25-gate matrix (**G0 to G24**), auditing everything from raw byte hygiene to API contracts, mutation testing resilience (G23), and chaos fault injection (G24).
5. **Wormholes (Cache & Offline-First Architecture):** Defeats network latency. Employs embedded local databases (SQLite, Realm) in desktop/mobile apps or distributed Redis clusters in cloud backends, guaranteeing uninterrupted operation and transactional capability during network dropouts.
6. **The Cosmic Web (Distributed Resilience):** Implements **Circuit Breakers (G24)** to isolate failing upstream dependencies and **Exponential Backoff Reconnect Loops** to revive degraded database connections autonomously.
7. **Cosmic Microwave Background (Forensic Observability & RUM):** Every user action leaves a forensic signature. Real User Monitoring (RUM), global runtime exception traps, 404 tracking, and immediate alerting dispatch to the incident response center.

---

## PART III: LAW OF CORRESPONDENCE (Critical Mass Scalability)

An asteroid obeys the exact same gravitational laws as a galaxy; however, architectural forces ignite proportionally to the system's **Critical Mass**:

### 🪨 Level 1: The Asteroid (Single-Purpose Systems)
* **Examples:** Landing pages, CLI utilities, single-screen mobile apps.
* **Dark Matter (Global State):** **OFF.** No heavy stores needed; state lives locally.
* **Perimeter Magnetic Field:** **MAXIMUM.** External input is lethal. Applies strict schema validation (Zod, TypeBox, serde) and bot challenges.
* **The Biosphere (Accessibility & SEO):** **MAXIMUM.** Semantic HTML structure and native OS accessibility APIs (VoiceOver/TalkBack).

### 🌍 Level 2: The Planet (Transactional Systems)
* **Examples:** E-Commerce platforms, Point of Sale (POS) applications, transactional mobile apps.
* **Wormholes (Offline-First):** **ON.** Local SQLite databases keep the business running during internet outages.
* **Spectral Signatures (Auth):** **ON.** Secrets saved in OS Keychains, Windows Credential Manager, or secure HttpOnly cookies. Plaintext credential storage is banned.

### 🌌 Level 3: The Galaxy (Massive Ecosystems)
* **Examples:** Cloud ERP systems, Core Banking, high-performance desktop suites.
* **The Cosmic Web (IPC & Microservices):** **MAXIMUM POWER.** Typed asynchronous messaging and decoupled execution threads.
* **Forensic Telemetry & Observability:** **MAXIMUM POWER.** Real-time log aggregation, distributed tracing, and automated failure isolation.

---

## MAPPING MATRIX: AUM-IC 7 vs. PUF-25

| Cosmic Force (AUM-IC) | Certifying PUF-25 Gates | Operational Objective |
| :--- | :--- | :--- |
| **Fundamental Hygiene** | **`G0`**, **`G8`**, **`G22`** | Pure UTF-8 encoding, LF line endings, mojibake eradication, and universal delimiter balance. |
| **Hadron Collider** | **`G2`**, **`G3`**, **`G5`**, **`G6`**, **`G23`** | Red/Green test cycle, SHA-256 rollback snapshots, strict static analysis, and mutation test resilience. |
| **Magnetic Field** | **`G4`**, **`G19`**, **`G21`** | Pure logic refactor, zero SQL injection, secret purge, and WordPress/WooCommerce compliance. |
| **Event Horizon** | **`G9`**, **`G17`**, **`G20`** | POSIX permissions, license integrity, and environment isolation (zero localhost in production). |
| **Zero Gravity & Layout** | **`G1`**, **`G11`**, **`G18`** | UI thread decoupling, zero-focus stealing (`CREATE_NO_WINDOW`), and clean styling engine consistency. |
| **Cosmic Web & Resilience** | **`G12`**, **`G13`**, **`G14`**, **`G24`** | Dead link eradication (no 404s), zombie UI action removal, HTTP contracts, and chaos fault isolation. |
| **Background Radiation** | **`G7`**, **`G10`**, **`G15`**, **`G16`** | ADR logging in `BITACORA.md`, stale cache flushes, E2E validation, and Core Web Vitals audit. |

---

## TACTICAL GLOSSARY: THE "WHY" BEHIND THE RULES

* **Why implement the Deterministic Surgical Auto-Fix (`puf sanar` / `puf fix`)?**  
  An audit engine that only flags errors without healing them introduces avoidable cognitive friction. The auto-fixer corrects mechanical deviations (BOM, CRLF linebreaks, license placeholders, CSS/PHP missing delimiters) in milliseconds, backing up original state with SHA-256 hashes (G3) before mutating disk.
* **Why integrate a Sentinel Watch with native OS Toasts (`puf watch`)?**  
  During frontend interaction or manual browser testing, engineers don't watch the terminal. The Watch Sentinel runs in the background and delivers non-intrusive toast notifications without stealing desktop focus (G11 compliance), alerting immediately if a mutation broke a gate.
* **Why expose a Native MCP Server (`puf serve`)?**  
  AI coding agents (Antigravity, Cursor, Claude) are full team members under the AUM-IC standard. Exposing stdio JSON-RPC tools allows autonomous agents to audit and remediate code in-memory with sub-5ms latency without messy script wrappers or brittle CLI scraping.
* **Why audit Mutation Testing Resilience (G23)?**  
  High test coverage with empty or tautological assertions is a dangerous illusion. G23 enforces that assertions genuinely evaluate state deviations, ensuring mutants are actively killed.
* **Why audit Chaos Fault Injection and Circuit Breakers (G24)?**  
  In distributed software, remote API and database delays are mathematically inevitable. G24 verifies that network queries include timeouts and circuit breakers, preventing whole-system lockups.
* **Why capture immutable SHA-256 checkpoints (G3)?**  
  Modifying code without verified checkpoints introduces irreversible entropy. An atomic cryptographic snapshot guarantees that any failed remediation step can be immediately collapsed and restored.

---

> 🏛️ Intellectual Property of **Ingeniería Creativa (IngCrea)**. Standard released under dual CC BY-SA 4.0 / MIT licensing.
