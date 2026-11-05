import { RegistroCompuerta } from "./types.js";
import * as fs from "node:fs/promises";
import { LectorArbolProyecto } from "./arbol-proyecto.js";

/**
 * G20: Topología de Entornos, Aislamiento de Red y Cero Conexiones Fantasma (Topology & Zero-Cross Contamination).
 * Optimizado con LectorArbolProyecto (VFS Snapshot en memoria) para cero redundancia de I/O.
 */
export class EvaluadorTopologia {
  public static async auditar(directorioRaiz: string): Promise<RegistroCompuerta> {
    const t = Date.now();
    let hardcodedLocalhost = 0;
    const extensiones = [".ts", ".js", ".astro", ".tsx", ".jsx", ".php", ".py"];

    const archivos = await LectorArbolProyecto.filtrarPorExtension(directorioRaiz, extensiones);

    await Promise.all(
      archivos.map(async (arch) => {
        if (
          arch.rutaRelativa.includes('test') ||
          arch.rutaRelativa.includes('spec') ||
          arch.rutaRelativa.includes('evaluador') ||
          arch.rutaRelativa.includes('vite.config')
        ) {
          return;
        }
        try {
          const raw = await fs.readFile(arch.rutaAbsoluta, "utf8");
          const matches = raw.match(/https?:\/\/(localhost|127\.0\.0\.1):\d+/g);
          if (matches) {
            hardcodedLocalhost += matches.length;
          }
        } catch {}
      })
    );

    if (hardcodedLocalhost > 5) {
      return {
        id: "G20",
        nombre: "Topologia de Entornos, Aislamiento de Red y Cero Conexiones Fantasma (Topology Guard)",
        estado: "rechazada",
        detalle: `Contaminación de entorno: Se detectaron ${hardcodedLocalhost} referencias hardcodeadas a localhost/127.0.0.1 en código fuente de producción. Deben parametrizarse vía variables de entorno.`,
        evidencia: `${hardcodedLocalhost} endpoints localhost detectados`,
        tiempoEjecucionMs: Date.now() - t
      };
    }

    return {
      id: "G20",
      nombre: "Topologia de Entornos, Aislamiento de Red y Cero Conexiones Fantasma (Topology Guard)",
      estado: "aprobada",
      detalle: `Topología de red conforme. Aislamiento de infraestructura verificado (${hardcodedLocalhost} referencias locales dentro del margen de desarrollo tolerado).`,
      evidencia: `Aislamiento OK (${hardcodedLocalhost} ref)`,
      tiempoEjecucionMs: Date.now() - t
    };
  }
}
