import { RegistroCompuerta } from "./types.js";
import * as path from "node:path";
import * as fs from "node:fs/promises";
import { LectorArbolProyecto } from "./arbol-proyecto.js";

/**
 * G18: Consistencia de Motores de Estilo y Erradicacion de Antipatrones (Style Engine Consistency).
 * Optimizado con LectorArbolProyecto (VFS Snapshot en memoria) para cero redundancia de I/O.
 */
export class EvaluadorEstilos {
  public static async auditar(directorioRaiz: string): Promise<RegistroCompuerta> {
    const t = Date.now();
    let tieneTailwind = false;
    let tieneBootstrap = false;
    let tieneScss = false;
    let contadorImportant = 0;
    const extensiones = [".astro", ".tsx", ".jsx", ".vue", ".html", ".css", ".scss"];

    // 1. Detectar dependencias o configs
    try {
      const pkgPath = path.join(directorioRaiz, "package.json");
      const pkgRaw = await fs.readFile(pkgPath, "utf8");
      const pkg = JSON.parse(pkgRaw);
      const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };

      if (allDeps["tailwindcss"] || allDeps["@tailwindcss/vite"] || allDeps["@astrojs/tailwind"]) {
        tieneTailwind = true;
      }
      if (allDeps["bootstrap"] || allDeps["react-bootstrap"]) {
        tieneBootstrap = true;
      }
      if (allDeps["sass"] || allDeps["sass-embedded"]) {
        tieneScss = true;
      }
    } catch {}

    const configs = ["tailwind.config.js", "tailwind.config.mjs", "tailwind.config.cjs", "tailwind.config.ts"];
    for (const c of configs) {
      if (await fs.stat(path.join(directorioRaiz, c)).catch(() => null)) {
        tieneTailwind = true;
        break;
      }
    }

    // 2. Escaneo ultrarrápido desde snapshot en memoria
    const archivos = await LectorArbolProyecto.filtrarPorExtension(directorioRaiz, extensiones);
    
    // Leer archivos en lotes paralelos
    await Promise.all(
      archivos.map(async (arch) => {
        // Excluir carpetas irrelevantes de UI interna o reportes
        if (arch.rutaRelativa.startsWith('test') || arch.rutaRelativa.includes('dashboard.astro')) {
          return;
        }
        try {
          const raw = await fs.readFile(arch.rutaAbsoluta, "utf8");
          const matches = raw.match(/!important/g);
          if (matches) {
            contadorImportant += matches.length;
          }
        } catch {}
      })
    );

    const motoresDetectados: string[] = [];
    if (tieneTailwind) motoresDetectados.push("Tailwind CSS");
    if (tieneBootstrap) motoresDetectados.push("Bootstrap");
    if (tieneScss) motoresDetectados.push("SCSS/Sass");

    if (tieneTailwind && tieneBootstrap) {
      return {
        id: "G18",
        nombre: "Consistencia de Motores de Estilo y Erradicacion de Antipatrones (Style Engine Consistency)",
        estado: "rechazada",
        detalle: "Conflicto de arquitectura: Coexistencia simultánea de Tailwind CSS y Bootstrap en el mismo proyecto. Rompe la coherencia y aumenta el payload.",
        evidencia: "Colisión Tailwind + Bootstrap detectada",
        tiempoEjecucionMs: Date.now() - t
      };
    }

    if (contadorImportant > 20) {
      return {
        id: "G18",
        nombre: "Consistencia de Motores de Estilo y Erradicacion de Antipatrones (Style Engine Consistency)",
        estado: "rechazada",
        detalle: `Deuda de especificidad CSS: Se detectaron ${contadorImportant} declaraciones '!important' en el código fuente (Máximo tolerable: 20).`,
        evidencia: `${contadorImportant} ocurrencias de !important`,
        tiempoEjecucionMs: Date.now() - t
      };
    }

    const motorPrincipal = motoresDetectados.length > 0 ? motoresDetectados.join(", ") : "CSS Moderno Puro";
    return {
      id: "G18",
      nombre: "Consistencia de Motores de Estilo y Erradicacion de Antipatrones (Style Engine Consistency)",
      estado: "aprobada",
      detalle: `Arquitectura de estilos homogénea [${motorPrincipal}]. Especificidad limpia (${contadorImportant} declaraciones '!important' controladas).`,
      evidencia: `Motor: ${motorPrincipal} | !important: ${contadorImportant}`,
      tiempoEjecucionMs: Date.now() - t
    };
  }
}
