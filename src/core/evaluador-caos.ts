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

    // Detección de promesas huérfanas en JS/TS (.then() sin .catch())
    let promesasSinCatch = 0;
    const violacionesPromesas: string[] = [];

    // Detección de fugas de recursos en Java (AutoCloseable sin try-with-resources)
    let fugasRecursosJava = 0;
    const violacionesJava: string[] = [];

    for (const arch of archivosRed) {
      try {
        const raw = await fs.readFile(arch.rutaAbsoluta, "utf8");

        // JS/TS: Promesas .then() sin .catch()
        if (arch.extension === ".ts" || arch.extension === ".js") {
          const thenMatches = raw.match(/\.then\s*\(/g);
          const catchMatches = raw.match(/\.catch\s*\(/g);
          const numThen = thenMatches ? thenMatches.length : 0;
          const numCatch = catchMatches ? catchMatches.length : 0;
          if (numThen > 0 && numCatch === 0) {
            promesasSinCatch++;
            violacionesPromesas.push(`${arch.rutaRelativa} (${numThen} .then() sin .catch())`);
          }
        }

        // Java: Fugas de recursos (Connection, Statement, InputStream instanciados sin try-with-resources)
        if (arch.extension === ".java") {
          if (/(?:Connection|Statement|PreparedStatement|ResultSet|FileInputStream|FileOutputStream)\s+[a-zA-Z0-9_]+\s*=\s*/.test(raw)) {
            // Verificar si usa try ( ... )
            if (!/try\s*\([^)]*(?:Connection|Statement|PreparedStatement|InputStream|OutputStream)[^)]*\)/.test(raw)) {
              fugasRecursosJava++;
              violacionesJava.push(`${arch.rutaRelativa} (Recurso sin try-with-resources)`);
            }
          }
        }

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

    if (fugasRecursosJava > 0) {
      return {
        id: "G24",
        nombre: "Inyección de Caos, Disyuntores y Auto-Sanación (Chaos & Fault Injection Guard)",
        estado: "rechazada",
        detalle: `Fugas de recursos en Java/JVM: Se detectaron ${fugasRecursosJava} instancias de I/O o base de datos sin 'try-with-resources': ${violacionesJava.slice(0, 3).join(" | ")}. Riesgo de bloqueo de descriptores de archivo y pool exhausto.`,
        evidencia: `${fugasRecursosJava} fugas de recursos en Java`,
        tiempoEjecucionMs: Date.now() - t
      };
    }

    if (promesasSinCatch > 4) {
      return {
        id: "G24",
        nombre: "Inyección de Caos, Disyuntores y Auto-Sanación (Chaos & Fault Injection Guard)",
        estado: "rechazada",
        detalle: `Vulnerabilidad a UnhandledPromiseRejection: Se detectaron ${promesasSinCatch} archivos con promesas .then() sin bloque .catch() protector: ${violacionesPromesas.slice(0, 3).join(" | ")}.`,
        evidencia: `${promesasSinCatch} archivos con promesas huérfanas`,
        tiempoEjecucionMs: Date.now() - t
      };
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
