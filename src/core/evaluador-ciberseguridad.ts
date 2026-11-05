import { RegistroCompuerta } from "./types.js";
import * as path from "node:path";
import * as fs from "node:fs/promises";
import { LectorArbolProyecto } from "./arbol-proyecto.js";

/**
 * G19: Blindaje de Superficie de Ataque, Cero Fugas e Inyecciones (Zero-Injection & Attack Surface Guard).
 * Optimizado con LectorArbolProyecto (VFS Snapshot en memoria) para cero redundancia de I/O.
 */
export class EvaluadorCiberseguridad {
  public static async auditar(directorioRaiz: string): Promise<RegistroCompuerta> {
    const t = Date.now();
    const archivosProhibidos = new Set([
      "dump.sql",
      "database.sql",
      "backup.sql",
      "id_rsa",
      "id_ed25519",
      "phpinfo.php",
      "xmlrpc.php"
    ]);

    const todosLosArchivos = await LectorArbolProyecto.obtenerSnapshot(directorioRaiz);
    const violacionesArchivos: string[] = [];

    for (const arch of todosLosArchivos) {
      const nombreBase = path.basename(arch.rutaAbsoluta);
      if (archivosProhibidos.has(nombreBase)) {
        violacionesArchivos.push(arch.rutaRelativa);
      }
    }

    // Verificar si .env está en gitignore
    let envIgnorado = true;
    const existeEnv = todosLosArchivos.some((a) => a.rutaRelativa === '.env' || a.rutaRelativa.endsWith('/.env'));
    if (existeEnv) {
      const gitignoreArch = todosLosArchivos.find((a) => a.rutaRelativa === '.gitignore');
      if (gitignoreArch) {
        try {
          const gitignore = await fs.readFile(gitignoreArch.rutaAbsoluta, "utf8");
          if (!gitignore.includes(".env")) {
            envIgnorado = false;
          }
        } catch {
          envIgnorado = false;
        }
      } else {
        envIgnorado = false;
      }
    }

    if (!envIgnorado) {
      return {
        id: "G19",
        nombre: "Blindaje de Superficie de Ataque y Cero Inyecciones (Zero-Injection Guard)",
        estado: "rechazada",
        detalle: "Vulnerabilidad crítica: Archivo sensible '.env' detectado sin protección en '.gitignore'. Riesgo de filtración de secretos.",
        evidencia: ".env sin blindaje en gitignore",
        tiempoEjecucionMs: Date.now() - t
      };
    }

    if (violacionesArchivos.length > 0) {
      return {
        id: "G19",
        nombre: "Blindaje de Superficie de Ataque y Cero Inyecciones (Zero-Injection Guard)",
        estado: "rechazada",
        detalle: `Archivos de alta exposición o riesgo detectados: ${violacionesArchivos.join(", ")}. Deben purgarse de inmediato.`,
        evidencia: `Archivos expuestos: ${violacionesArchivos.join(", ")}`,
        tiempoEjecucionMs: Date.now() - t
      };
    }

    // Escaneo pasivo paralelo de consultas SQL vulnerables
    let patronesConcatenacionSql = 0;
    const archivosBackend = await LectorArbolProyecto.filtrarPorExtension(directorioRaiz, [".ts", ".js", ".php", ".py"]);

    await Promise.all(
      archivosBackend.map(async (arch) => {
        if (arch.rutaRelativa.includes('test') || arch.rutaRelativa.includes('evaluador')) return;
        try {
          const raw = await fs.readFile(arch.rutaAbsoluta, "utf8");
          if (/SELECT\s+.*\s+FROM\s+.*\s+WHERE\s+.*(\+|`.*(\$\{.*\}).*`|\.\s*\$)/i.test(raw)) {
            patronesConcatenacionSql++;
          }
        } catch {}
      })
    );

    if (patronesConcatenacionSql > 0) {
      return {
        id: "G19",
        nombre: "Blindaje de Superficie de Ataque y Cero Inyecciones (Zero-Injection Guard)",
        estado: "rechazada",
        detalle: `Posible vector de Inyección SQL: Se detectaron ${patronesConcatenacionSql} consultas SQL construidas con concatenación dinámica directa. Utilizar consultas preparadas/parametrizadas obligatoriamente.`,
        evidencia: `${patronesConcatenacionSql} queries no parametrizadas`,
        tiempoEjecucionMs: Date.now() - t
      };
    }

    return {
      id: "G19",
      nombre: "Blindaje de Superficie de Ataque y Cero Inyecciones (Zero-Injection Guard)",
      estado: "aprobada",
      detalle: "Superficie de ataque sellada: Cero fugas de credenciales en .env, cero endpoints legacy vulnerables y consultas parametrizadas conformes.",
      evidencia: "Cero vectores de inyeccion pasiva",
      tiempoEjecucionMs: Date.now() - t
    };
  }
}
