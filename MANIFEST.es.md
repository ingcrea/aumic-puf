# 📜 MANIFIESTO ARQUITECTÓNICO: ESTÁNDAR AUM-IC 7 (EDICIÓN 2026)

<p align="center">
  <img src="https://img.shields.io/badge/version-7.0.0-crimson?style=flat-square" alt="Versión 7.0.0">
  <img src="https://img.shields.io/badge/naturaleza-Estandar%20de%20Ingenieria%20Pura-38bdf8?style=flat-square" alt="Naturaleza">
  <img src="https://img.shields.io/badge/suite-PUF--25%20Aseguramiento-gold?style=flat-square" alt="PUF-25">
</p>

> 🌐 **Navegación:** 🇲🇽 [Leer en Español](./MANIFEST.es.md) | 🇺🇸 [Read in English](./MANIFEST.md) | 📖 [README (ES)](./README.es.md) | 📖 [README (EN)](./README.md) | 🌌 [Estándar AUM-IC 7](https://github.com/ingcrea/aum-ic)

Este documento rige el **Paradigma de Universos Multidimensionales de Ingeniería Creativa (Estándar AUM-IC 7)** y su correspondencia operativa con la matriz de 25 compuertas del **Protocolo Universal contra Fallos (PUF-25)**.

No es una convención arbitraria de directorios ni una sugerencia cosmética: es un marco riguroso de arquitectura, física fractal e ingeniería de software concebido para satisfacer de forma nativa los estándares internacionales de calidad de producto (**ISO/IEC 25010**), seguridad de la información (**ISO 27001**), testabilidad (**ISO 29119**) y accesibilidad web (**ISO 40500 / WCAG 2.2**).

---

## 🌌 El Porqué Fundamental: Entropía vs. Precisión Matemática

**El desarrollo de software sin rigor es entropía descontrolada.** Es dispersión caótica: dependencias circulares, parches superficiales, acoplamiento destructivo, pérdidas de memoria y sistemas que colapsan ante condiciones imprevistas de concurrencia.

El universo físico, aunque parezca caótico, opera bajo un equilibrio matemático implacable. Desde las interacciones cuánticas elementales hasta la mecánica de cuerpos celestes masivos, nada queda al azar.

**El Paradigma AUM-IC somete el código a estas mismas leyes universales.** Es un modelo mental absoluto, **100% agnóstico al lenguaje** (Rust, TypeScript, Python, Astro, PHP, Java, C#, Swift, Shell), que divide el desarrollo en **Materia Observable** (estructura fractal del código), **Fuerzas Invisibles** (flujo de datos y resiliencia SRE) y **Leyes de Correspondencia** (escalabilidad por masa crítica).

---

## PARTE I: LA MATERIA OBSERVABLE (Estructura Fractal)

El Principio de Correspondencia establece: *"Como es arriba, es abajo"*. Los componentes del software se organizan en simetría fractal estricta tanto en Frontend (interfaces de usuario), como en Backend (controladores y microservicios) y Persistencia (modelos de datos):

```text
src/
├── 1-atoms/       # Elementos puros e indivisibles (Botones, inputs, helpers matemáticos puros)
├── 2-molecules/   # Agrupaciones simples (Campos de formulario con label/error, middlewares)
├── 3-cells/       # Contenedores funcionales (Tarjetas de producto, entidades ORM, servicios unitarios)
├── 4-organisms/   # Módulos autónomos de negocio (Formulario de checkout, casos de uso, orquestadores)
├── 5-planets/     # Vistas completas o controladores API (Páginas de dashboard, endpoints REST/gRPC)
└── 6-layouts/     # Malla espacial y contenedores maestros (Plantillas estructurales, server app modules)
```

* **Regla de Gravedad Cero:** Los átomos (`1-atoms/`) no pueden depender de capas superiores ni importar estado mutable o conexiones a base de datos. La densidad y gravedad se reservan para los organismos y planetas.

---

## PARTE II: LAS 7 FUERZAS CÓSMICAS (Núcleo SRE y Seguridad)

Todo sistema en producción debe operar bajo 7 leyes dinámicas que rigen el flujo de datos:

1. **Materia Oscura (Estado Global):** La gravedad invisible. La información global de la aplicación (Zustand, Redux, Daemons de memoria) unifica a los organismos sin acoplarlos de forma directa (*Prop Drilling* prohibido).
2. **Horizonte de Eventos (Seguridad Perimetral):** Frontera impenetrable. Aplica Content Security Policy (CSP), Rate Limiting estricto, challenge anti-bots y validación criptográfica de firmas JWT. Todo payload sin firma válida es repelido en el middleware.
3. **Campo Magnético (ORM y Sanitización):** Protege el núcleo del sistema contra radiación cósmica (inyecciones SQL y ataques XSS). Queda prohibido el SQL en texto plano sin parametrizar. La materia no se destruye arbitrariamente: se exige el **Borrado Lógico (Soft Deletes)** y el control estricto de esquemas mediante migraciones declarativas.
4. **El Colisionador de Hadrones (Ciclo Cerrado de Calidad PUF-25):** El caos no entra a producción. Antes de un release, el código debe superar la matriz de 25 compuertas de aseguramiento (**G0 a G24**), auditando desde la codificación de bytes hasta contratos de API, pruebas de mutación (G23) y resiliencia ante caos (G24).
5. **Agujeros de Gusano (Caché y Arquitectura Offline-First):** Supera la latencia de la red. Despliega bases de datos locales incrustadas (SQLite, Realm) en clientes Desktop/Mobile o clústeres Redis en la nube, garantizando que el sistema opere y facture aun en condiciones de desconexión.
6. **La Malla Cósmica (Resiliencia Distribuida):** Implementación obligatoria de **Circuit Breakers (G24)** para aislar servicios externos caídos y bucles exponenciales de reconexión (**Exponential Backoff**) para revivir enlaces a bases de datos de forma autónoma.
7. **Radiación Cósmica de Fondo (Observabilidad Forense y RUM):** Toda interacción deja una huella digital determinista. Telemetría de usuario real (RUM), captura de excepciones de runtime globales, monitoreo de 404s y despacho inmediato de alertas al centro de comando.

---

## PARTE III: LEY DE CORRESPONDENCIA (Escalabilidad por Masa Crítica)

Un asteroide obedece las mismas leyes fundamentales que una galaxia; sin embargo, las fuerzas activas se encienden en proporción a su **Masa Crítica**:

### 🪨 Nivel 1: El Asteroide (Sistemas de Propósito Único)
* **Ejemplos:** Landing pages, herramientas CLI, scripts de procesamiento, utilidades de una sola pantalla.
* **Materia Oscura (Estado Global):** **APAGADA.** No requiere almacenes pesados; el estado reside localmente.
* **Campo Magnético Perimetral:** **MÁXIMO.** Todo input exterior es letal. En web se aplican filtros contra tráfico malicioso; en mobile/desktop se aplican validadores tipados estrictos (Zod, TypeBox, serde).
* **La Biósfera (Accesibilidad y SEO):** **MÁXIMA.** Marcado semántico riguroso y consumo nativo de APIs de accesibilidad del sistema operativo.

### 🌍 Nivel 2: El Planeta (Sistemas Transaccionales)
* **Ejemplos:** Plataformas de comercio electrónico, puntos de venta (POS), aplicaciones móviles transaccionales.
* **Agujeros de Gusano (Offline-First):** **ENCENDIDO.** Bases de datos SQLite locales mantienen la operatividad continua si la conexión a internet colapsa.
* **Firmas Espectrales (Seguridad de Sesión):** **ENCENDIDO.** Almacenamiento seguro en Credential Manager de Windows, Keychain de macOS o cookies HttpOnly con banderas `Secure` y `SameSite`. Prohibido el almacenamiento en texto plano.

### 🌌 Nivel 3: La Galaxia (Ecosistemas Masivos y Distribuidos)
* **Ejemplos:** Sistemas ERP en la nube, plataformas Fintech / Core Bancario, suites industriales de escritorio.
* **La Malla Cósmica (IPC y Microservicios):** **MÁXIMA POTENCIA.** Comunicación asíncrona tipada y desacoplamiento de subprocesos. Si un microservicio o worker falla, el resto de la galaxia permanece intacto.
* **Telemetría y Observabilidad:** **MÁXIMA POTENCIA.** Auditoría continua de logs, monitoreo de tiempos de respuesta, trazas distribuidas y mitigación proactiva de incidentes.

---

## MATRIZ DE CORRESPONDENCIA: AUM-IC 7 vs. PUF-25

| Fuerza Cósmica AUM-IC | Compuertas PUF-25 que la Certifican | Objetivo Operativo |
| :--- | :--- | :--- |
| **Higiene Fundamental** | **`G0`**, **`G8`**, **`G22`** | Codificación UTF-8 pura, saltos LF, erradicación de mojibake y balanceo universal de delimitadores. |
| **Colisionador de Hadrones** | **`G2`**, **`G3`**, **`G5`**, **`G6`**, **`G23`** | Ciclo rojo/verde de tests, snapshots SHA-256 de reversión, rigor estático y resistencia a mutaciones lógicas. |
| **Campo Magnético** | **`G4`**, **`G19`**, **`G21`** | Refactor limpio, cero inyecciones SQL, erradicación de secretos y compliance estricto WordPress/WooCommerce. |
| **Horizonte de Eventos** | **`G9`**, **`G17`**, **`G20`** | Permisos POSIX restrictivos, consistencia de licencias y aislamiento de entornos (cero localhost en producción). |
| **Gravedad Cero y Estructura** | **`G1`**, **`G11`**, **`G18`** | Desacoplamiento de hilos UI, cero robo de foco (`CREATE_NO_WINDOW`) y coexistencia limpia de motores CSS. |
| **Malla Cósmica y Resiliencia** | **`G12`**, **`G13`**, **`G14`**, **`G24`** | Cero enlaces 404, erradicación de botones zombies, contratos API y tolerancia a caos de red (Circuit Breakers). |
| **Radiación de Fondo** | **`G7`**, **`G10`**, **`G15`**, **`G16`** | Registro ADR en `BITACORA.md`, purga de cachés corruptas, pruebas E2E y Core Web Vitals. |

---

## GLOSARIO TÁCTICO: EL PORQUÉ DE LAS REGLAS

* **¿Por qué auditar la Resistencia a Mutaciones (G23)?**  
  Una suite con 100% de cobertura que no falla cuando un operador se invierte es una ilusión de seguridad. G23 verifica que las aserciones validen lógica de estado real y no existan tests complacientes.
* **¿Por qué inyectar Caos y Disyuntores de Red (G24)?**  
  En un sistema distribuido, las caídas no son una excepción sino una certeza matemática. G24 audita que el cliente no se quede bloqueado indefinidamente esperando una respuesta de red, forzando timeouts y disyuntores.
* **¿Por qué capturar Checkpoints inmutables con SHA-256 (G3)?**  
  Toda modificación de código sin respaldo verificado introduce riesgo de entropía irreversible. Un checkpoint criptográfico asegura que cualquier intento fallido de reparación pueda colapsarse y revertirse al estado exacto previo al fallo.

---

> 🏛️ Propiedad Intelectual de **Ingeniería Creativa (IngCrea)**. Estándar libre publicado bajo licenciamiento dual CC BY-SA 4.0 / MIT.
