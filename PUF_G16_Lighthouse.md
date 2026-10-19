# PUF G16 – Integración de auditorías Lighthouse

## Objetivo
Incorporar métricas críticas de rendimiento, accesibilidad, SEO y buenas prácticas que Lighthouse evalúa, para enriquecer el Protocolo Universal de Fallos (PUF) bajo el paradigma AUM‑IC 7:2026.

## KPI Prioritarios de Lighthouse (basados en Google PSI)
| Categoría | Métrica | Umbral de PASS | Umbral de WARN | Umbral de FAIL |
|-----------|---------|----------------|----------------|----------------|
| **Core Web Vitals** | **Largest Contentful Paint (LCP)** | < 2.5 s | 2.5 s – 4 s | > 4 s |
| | **Cumulative Layout Shift (CLS)** | < 0.1 | 0.1 – 0.25 | > 0.25 |
| | **First Input Delay (FID)** (o **Total Blocking Time** si FID no está disponible) | < 100 ms | 100 ms – 300 ms | > 300 ms |
| **Performance** | **Speed Index** | < 3 s | 3 s – 4.5 s | > 4.5 s |
| | **Time to Interactive (TTI)** | < 5 s | 5 s – 7 s | > 7 s |
| **Accessibility** | **Contrast Ratio** (texto vs fondo) | ≥ 4.5:1 (normal) ≥ 3:1 (large) | – | < 3:1 |
| | **ARIA roles & labels** | Todos presentes | – | Falta alguno |
| | **Form labels** | 100 % etiquetado | – | < 100 % |
| **SEO** | **Meta description** | Presente y 50‑160 caracteres | – | Ausente o fuera de rango |
| | **Title length** | 50‑60 caracteres | – | < 30 o > 70 |
| | **Canonical link** | Presente y válido | – | Ausente o inválido |
| **Best Practices** | **HTTPS** | Sí | – | No |
| | **Sin contenido mixto** | Sí | – | No |
| | **Política de caché** (Cache‑Control) | > 1 día para assets estáticos | – | < 1 día |

## Mapeo a checkpoints del PUF y pesos (siguiendo la distribución de Google PSI)
- **G16‑01**: LCP – **Peso 10 %** del bloque G16.
- **G16‑02**: CLS – **Peso 10 %**.
- **G16‑03**: FID/TBT – **Peso 10 %**.
- **G16‑04**: Speed Index – **Peso 8 %**.
- **G16‑05**: TTI – **Peso 7 %**.
- **G16‑06**: Accesibilidad (contrast, ARIA, labels) – **Peso 15 %**.
- **G16‑07**: SEO (meta, title, canonical) – **Peso 10 %**.
- **G16‑08**: Buenas prácticas (HTTPS, mixed‑content, cache) – **Peso 10 %**.
- **G16‑09**: Peso agregado de **Performance** dentro del PUF global – **40 %** del puntaje total (suma de los pesos anteriores).
- **G16‑10**: Peso de **Accesibilidad** dentro del PUF global – **15 %**.
- **G16‑11**: Peso de **SEO** dentro del PUF global – **10 %**.
- **G16‑12**: Peso de **Best Practices** dentro del PUF global – **10 %**.

## Umbrales de salud del PUF (Google PSI style)
- **Excelente**: Todos los KPI en PASS.
- **Adecuado**: Máximo 2 WARN, sin FAIL.
- **Deficiente**: ≥ 1 FAIL o > 2 WARN.

## Prototipo de auditoría Lighthouse (`lighthouse-audit.js`)
Se añadirá un script Node que:
1. Recibe una URL como argumento.
2. Ejecuta `lighthouse` con `--only-categories=performance,accessibility,seo,best-practices`.
3. Extrae los scores y métricas clave (LCP, CLS, FID/TBT, Speed Index, TTI, contrast, ARIA, etc.).
4. Genera un JSON compatible con el formato actual de `report-generator.js`.
5. Opcional: actualiza el puntaje global del PUF según los pesos definidos.

## Integración CI/CD (opciones)
- **GitHub Actions**: workflow que instala `node`, corre `npm ci`, ejecuta `node scripts/lighthouse-audit.js <URL>`, falla si algún KPI está en FAIL y publica artefacto HTML.
- **Azure Pipelines**: pipeline YAML con etapas `npm install`, `npm run lighthouse-audit -- <URL>`, `PublishTestResults` para fallos.
- **GitLab CI**: similar a GH Actions, usando `script:` secciones.
- **Local on‑demand**: ejecutable vía `npx lighthouse-audit <URL>` o `npm run lighthouse-audit -- <URL>`.

## Dependencias
```bash
npm i lighthouse chrome-launcher --save-dev
```

## Próximos pasos
1. Crear `scripts/lighthouse-audit.js` con el esqueleto descrito.
2. Extender `report-generator.js` para consumir los nuevos campos.
3. Añadir script a `package.json` (`"lighthouse-audit": "node scripts/lighthouse-audit.js"`).
4. Configurar CI (GitHub Actions o Azure Pipelines) según tu preferencia.
5. Ejecutar pruebas en `https://segurosiller.com/` y validar visualmente.

---
*Este documento está listo para ser versionado en el repositorio `aumic-puf`.*
