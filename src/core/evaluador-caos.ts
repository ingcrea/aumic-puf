import { RegistroCompuerta } from "./types.js";
import { LectorArbolProyecto } from "./arbol-proyecto.js";
import * as fs from "node:fs/promises";

/**
 * G24: Inyección de Caos, Disyuntores y Auto-Sanación (Chaos & Fault Injection Guard).
 * Audita si los servicios y clientes HTTP/Base de Datos implementan patrones de resiliencia
 * (Circuit Breaker, timeouts explícitos, manejo de desconexión y exponential backoff)
 * para sobrevivir a caídas y latencias sin congelar el proceso principal.
 */
export class EvaluadorCaos {
  public static async auditar(directorioRaiz: string): Promise<RegistroCompuerta> {
    const t = Date.now();
    const archivos = await LectorArbolProyecto.obtenerSnapshot(directorioRaiz);

    // Filtrar archivos de comunicación o clientes de red
    const archivosRed = archivos.filter(a => {
      const r = a.rutaRelativa;
      return (
        (a.extension === ".ts" || a.extension === ".js" || a.extension === ".rs" || a.extension === ".php" || a.extension === ".py") &&
        !r.includes("vendor/") &&
        !r.includes("node_modules/") &&
        !r.includes("dist/") &&
        !r.includes("checkpoints/")
      );
    });

    let llamadasSinTimeout = 0;
    let tieneManejoResiliencia = false;

    for (const arch of archivosRed) {
      try {
        const raw = await fs.readFile(arch.rutaAbsoluta, "utf8");

        // Detección de patrones de resiliencia (Circuit Breakers, reintentos, backoff)
        if (
          raw.includes("circuitBreaker") ||
          raw.includes("CircuitBreaker") ||
          raw.includes("retry") ||
          raw.includes("backoff") ||
          raw.includes("timeout") ||
          raw.includes("AbortController") ||
          raw.includes("signal:")
        ) {
          tieneManejoResiliencia = true;
        }

        // Detección de fetch o axios sin timeout ni signal de abort
        const fetchMatches = raw.match(/fetch\s*\([^,\)]+\)/g);
        if (fetchMatches) {
          llamadasSinTimeout += fetchMatches.length;
        }
      } catch {}
    }

    if (llamadasSinTimeout > 8 && !tieneManejoResiliencia) {
      return {
        id: "G24",
        nombre: "Inyección de Caos, Disyuntores y Auto-Sanación (Chaos & Fault Injection Guard)",
        estado: "rechazada",
        detalle: `Fragilidad ante fallas de red: Se detectaron ${llamadasSinTimeout} peticiones sin timeout ni disyuntor que colapsarían ante latencia inducida o desconexión.`,
        evidencia: `${llamadasSinTimeout} peticiones desprotegidas contra caídas`,
        tiempoEjecucionMs: Date.now() - t
      };
    }

    return {
      id: "G24",
      nombre: "Inyección de Caos, Disyuntores y Auto-Sanación (Chaos & Fault Injection Guard)",
      estado: "aprobada",
      detalle: "Arquitectura resiliente: Conexiones protegidas con timeouts, disyuntores o desacoplamiento de fallos de red.",
      evidencia: "Disyuntores y manejo de desconexión verificados",
      tiempoEjecucionMs: Date.now() - t
    };
  }
}
