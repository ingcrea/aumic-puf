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

    // Escaneo de enlaces externos con target="_blank" sin rel="noopener noreferrer" (Reverse Tabnabbing)
    const archivosFrontend = await LectorArbolProyecto.filtrarPorExtension(directorioRaiz, [
      ".astro",
      ".html",
      ".jsx",
      ".tsx",
      ".vue",
      ".svelte",
      ".php",
    ]);

    const violacionesTabnabbing: string[] = [];

    await Promise.all(
      archivosFrontend.map(async (arch) => {
        if (
          arch.rutaRelativa.startsWith('test') ||
          arch.rutaRelativa.includes('evaluador') ||
          arch.rutaRelativa.startsWith('dist') ||
          arch.rutaRelativa.startsWith('.astro')
        ) {
          return;
        }

        try {
          const raw = await fs.readFile(arch.rutaAbsoluta, "utf8");
          const lineas = raw.split("\n");
          for (let i = 0; i < lineas.length; i++) {
            const linea = lineas[i] ?? "";
            const matches = linea.matchAll(/<(?:a|Button)\b([^>]*)>/gi);
            for (const m of matches) {
              const attrs = m[1] ?? "";
              if (/target\s*=\s*["']_blank["']/i.test(attrs)) {
                // Verificar si incluye rel con noopener
                if (!/rel\s*=\s*["'][^"']*noopener[^"']*["']/i.test(attrs)) {
                  violacionesTabnabbing.push(
                    `${arch.rutaRelativa}:${i + 1} -> Enlace target="_blank" sin rel="noopener noreferrer"`
                  );
                }
              }
            }
          }
        } catch {}
      })
    );

    if (violacionesTabnabbing.length > 0) {
      return {
        id: "G19",
        nombre: "Blindaje de Superficie de Ataque y Cero Inyecciones (Zero-Injection Guard)",
        estado: "rechazada",
        detalle: `Vulnerabilidad Web (Reverse Tabnabbing): Se detectaron ${violacionesTabnabbing.length} enlaces target="_blank" desprovistos de rel="noopener noreferrer": ${violacionesTabnabbing.slice(0, 3).join(" | ")}`,
        evidencia: `${violacionesTabnabbing.length} enlaces sin noopener`,
        tiempoEjecucionMs: Date.now() - t
      };
    }

    // Escaneo de inyecciones XSS en React / Next.js vía dangerouslySetInnerHTML sin sanitizador
    const violacionesXssReact: string[] = [];
    await Promise.all(
      archivosFrontend.map(async (arch) => {
        if (
          arch.rutaRelativa.startsWith('test') ||
          arch.rutaRelativa.startsWith('dist') ||
          (!arch.extension.includes('tsx') && !arch.extension.includes('jsx') && !arch.extension.includes('js'))
        ) {
          return;
        }

        try {
          const raw = await fs.readFile(arch.rutaAbsoluta, "utf8");
          const lineas = raw.split("\n");
          for (let i = 0; i < lineas.length; i++) {
            const linea = lineas[i] ?? "";
            if (linea.includes("dangerouslySetInnerHTML")) {
              // Si no contiene sanitizer (DOMPurify, sanitizeHtml, etc.) en el archivo
              const tieneSanitizer = /DOMPurify|sanitize|xss|cleanHtml/i.test(raw);
              if (!tieneSanitizer) {
                violacionesXssReact.push(
                  `${arch.rutaRelativa}:${i + 1} -> Uso de dangerouslySetInnerHTML sin sanitizador (DOMPurify/sanitizeHtml)`
                );
              }
            }
          }
        } catch {}
      })
    );

    if (violacionesXssReact.length > 0) {
      return {
        id: "G19",
        nombre: "Blindaje de Superficie de Ataque y Cero Inyecciones (Zero-Injection Guard)",
        estado: "rechazada",
        detalle: `Vulnerabilidad XSS en React/Next.js: Se detectaron ${violacionesXssReact.length} usos de 'dangerouslySetInnerHTML' sin sanitización: ${violacionesXssReact.slice(0, 3).join(" | ")}`,
        evidencia: `${violacionesXssReact.length} XSS potenciales con dangerouslySetInnerHTML`,
        tiempoEjecucionMs: Date.now() - t
      };
    }

    return {
      id: "G19",
      nombre: "Blindaje de Superficie de Ataque y Cero Inyecciones (Zero-Injection Guard)",
      estado: "aprobada",
      detalle: "Superficie de ataque sellada: Cero fugas en .env, tabnabbing mitigado, XSS React sanitizado y consultas parametrizadas conformes.",
      evidencia: "Cero vectores de inyeccion pasiva, XSS y tabnabbing blindados",
      tiempoEjecucionMs: Date.now() - t
    };
  }
}
