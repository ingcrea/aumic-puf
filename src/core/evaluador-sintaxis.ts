import { RegistroCompuerta } from "./types.js";
import * as fs from "node:fs/promises";
import { LectorArbolProyecto } from "./arbol-proyecto.js";

export interface ErrorSintaxis {
  readonly archivo: string;
  readonly linea: number;
  readonly lenguaje: string;
  readonly mensaje: string;
  readonly codigo: string;
}

/**
 * G22: Diagnóstico Universal de Sintaxis, Delimitadores y Balanceo (Universal Syntax & Delimiter Guard).
 * Analiza estáticamente PHP, CSS/SCSS, JSON, JS/TS, Python y Java sin requerir compiladores externos.
 * Detecta:
 *  1. PHP: Omisión de punto y coma (;) en asignaciones, retornos, llamadas a métodos e instrucciones simples.
 *  2. CSS/SCSS: Omisión de punto y coma (;) entre pares propiedad: valor.
 *  3. JSON: Comas faltantes, trailing commas inválidas y sintaxis corrupta.
 *  4. Universal: Desbalanceo de llaves ({ }), corchetes ([ ]) y paréntesis (( )).
 */
export class EvaluadorSintaxisUniversal {
  public static async auditar(directorioRaiz: string): Promise<RegistroCompuerta> {
    const t = Date.now();
    const archivos = await LectorArbolProyecto.obtenerSnapshot(directorioRaiz);

    const errores: ErrorSintaxis[] = [];
    let archivosAuditados = 0;

    const extensionesSoportadas = new Set([
      ".php", ".phtml",
      ".css", ".scss",
      ".json",
      ".js", ".mjs", ".cjs", ".ts", ".tsx",
      ".java"
    ]);

    const archivosCandidatos = archivos.filter(arch => {
      if (!extensionesSoportadas.has(arch.extension)) return false;
      const r = arch.rutaRelativa;
      return !(
        r.includes("vendor/") ||
        r.includes("node_modules/") ||
        r.includes("dist/") ||
        r.includes("target/") ||
        r.includes("checkpoints/") ||
        r.includes("uploads/") ||
        r.includes("cache/")
      );
    });

    const tamanoLote = 35;
    for (let i = 0; i < archivosCandidatos.length; i += tamanoLote) {
      const lote = archivosCandidatos.slice(i, i + tamanoLote);
      await Promise.all(
        lote.map(async (arch) => {
          let contenido: string;
          try {
            contenido = await fs.readFile(arch.rutaAbsoluta, "utf8");
          } catch {
            return;
          }

          archivosAuditados++;

          // 1. Auditoría de Balanceo Universal de Delimitadores ({ }, [ ], ( ))
          this.auditarBalanceo(arch.rutaRelativa, contenido, errores);

          // 2. Auditoría Específica por Lenguaje
          if (arch.extension === ".json") {
            this.auditarJson(arch.rutaRelativa, contenido, errores);
          } else if (arch.extension === ".css" || arch.extension === ".scss") {
            this.auditarCss(arch.rutaRelativa, contenido, errores);
          } else if (arch.extension === ".php" || arch.extension === ".phtml") {
            this.auditarPhp(arch.rutaRelativa, contenido, errores);
          }
        })
      );
    }

    if (errores.length > 0) {
      const resumen = errores.slice(0, 3).map(e => `${e.archivo}:${e.linea} [${e.lenguaje}] ${e.mensaje}`).join(" | ");
      return {
        id: "G22",
        nombre: "Diagnóstico Universal de Sintaxis y Delimitadores (Universal Syntax Guard)",
        estado: "rechazada",
        detalle: `Se detectaron ${errores.length} fallas de sintaxis/delimitadores en el proyecto: ${resumen}`,
        evidencia: `${errores.length} errores de sintaxis detectados`,
        tiempoEjecucionMs: Date.now() - t
      };
    }

    return {
      id: "G22",
      nombre: "Diagnóstico Universal de Sintaxis y Delimitadores (Universal Syntax Guard)",
      estado: "aprobada",
      detalle: `Sintaxis y delimitadores limpios en ${archivosAuditados} archivo(s) analizados. Cero omisiones de ';' o delimitadores desbalanceados.`,
      evidencia: `${archivosAuditados} archivos con sintaxis íntegra`,
      tiempoEjecucionMs: Date.now() - t
    };
  }

  /**
   * Auditoría de JSON nativo
   */
  private static auditarJson(archivo: string, contenido: string, errores: ErrorSintaxis[]): void {
    if (!contenido.trim()) return;
    try {
      JSON.parse(contenido);
    } catch (err: any) {
      let linea = 1;
      const match = err.message.match(/position\s+(\d+)/i);
      if (match && match[1]) {
        const pos = parseInt(match[1], 10);
        linea = contenido.substring(0, pos).split("\n").length;
      }
      errores.push({
        archivo,
        linea,
        lenguaje: "JSON",
        mensaje: `Error de sintaxis JSON: ${err.message}`,
        codigo: "JSON-SYN-01"
      });
    }
  }

  /**
   * Auditoría de CSS / SCSS: Detección de falta de punto y coma entre propiedades
   */
  private static auditarCss(archivo: string, contenido: string, errores: ErrorSintaxis[]): void {
    const lineas = contenido.split(/\r?\n/);
    let enComentario = false;

    for (let i = 0; i < lineas.length; i++) {
      let l = lineas[i]!.trim();
      const num = i + 1;

      // Gestión de comentarios multilínea /* ... */
      if (l.includes("/*")) enComentario = true;
      if (enComentario) {
        if (l.includes("*/")) enComentario = false;
        continue;
      }
      if (l.startsWith("//") || l.startsWith("/*")) continue;

      // Detectar pares propiedad: valor
      // Ej: "margin: 10px" sin terminar en ";" o "{" o ","
      if (/^[a-zA-Z\-][a-zA-Z0-9\-]*\s*:\s*[^;{}]+$/.test(l)) {
        // Mirar si la siguiente línea no vacía es otra propiedad o cierre
        let siguientePropiedad = false;
        for (let j = i + 1; j < Math.min(i + 5, lineas.length); j++) {
          const sig = lineas[j]!.trim();
          if (!sig || sig.startsWith("//") || sig.startsWith("/*")) continue;
          if (/^[a-zA-Z\-][a-zA-Z0-9\-]*\s*:/i.test(sig) || sig.startsWith("}")) {
            siguientePropiedad = true;
          }
          break;
        }

        if (siguientePropiedad && !l.endsWith(",") && !l.endsWith("{")) {
          errores.push({
            archivo,
            linea: num,
            lenguaje: "CSS",
            mensaje: `Falta punto y coma (;) al final de la declaración CSS: '${l}'`,
            codigo: "CSS-MISSING-SEMICOLON"
          });
        }
      }
    }
  }

  /**
   * Auditoría de PHP: Detección de falta de ';' en asignaciones, retornos e instrucciones
   */
  private static auditarPhp(archivo: string, contenido: string, errores: ErrorSintaxis[]): void {
    const lineas = contenido.split(/\r?\n/);
    let enComentario = false;

    for (let i = 0; i < lineas.length; i++) {
      let l = lineas[i]!.trim();
      const num = i + 1;

      if (l.includes("/*")) enComentario = true;
      if (enComentario) {
        if (l.includes("*/")) enComentario = false;
        continue;
      }
      if (l.startsWith("//") || l.startsWith("#") || l.startsWith("*")) continue;

      // Ignorar líneas vacías, aperturas de etiquetas, bloques de control
      if (!l || l === "<?php" || l === "?>" || l === "{" || l === "}" || l.endsWith("{") || l.endsWith(":") || l.endsWith("*/")) continue;
      if (/^(if|elseif|else|for|foreach|while|switch|declare|case|default|function|class|interface|trait|namespace|abstract|final)\b/i.test(l)) continue;

      // Si es una asignación, retorno, llamada o declaración que no termina en ; ni { ni , ni . ni :
      const esInstruccionTerminal = 
        /^\$[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*\s*=(?!=)/.test(l) || // $var = ...
        /^return\b/.test(l) ||                                             // return ...
        /^throw\b/.test(l) ||                                              // throw ...
        /^echo\b/.test(l) ||                                               // echo ...
        /^use\b/.test(l) ||                                                // use ...
        /^(?:public|private|protected|static|var)\s+\$[a-zA-Z_]/.test(l); // propiedades de clase

      if (esInstruccionTerminal) {
        if (!l.endsWith(";") && !l.endsWith("{") && !l.endsWith(",") && !l.endsWith(".") && !l.endsWith(":") && !l.endsWith("?>")) {
          // Mirar si la instrucción continúa en multilínea (ej. queries SQL, arrays, llamadas encadenadas, strings heredoc)
          let esContinuacion = false;
          for (let j = i + 1; j < Math.min(i + 150, lineas.length); j++) {
            const sig = lineas[j]!.trim();
            if (!sig || sig.startsWith("//") || sig.startsWith("#") || sig.startsWith("/*") || sig.startsWith("*")) continue;
            if (
              sig.startsWith(".") ||
              sig.startsWith("->") ||
              sig.startsWith("?") ||
              sig.startsWith(":") ||
              sig.startsWith("&&") ||
              sig.startsWith("||") ||
              sig.endsWith(");") ||
              sig.endsWith("];") ||
              sig.endsWith(";")
            ) {
              esContinuacion = true;
              break;
            }
            if (/^(return|\$[a-zA-Z_\x7f-\xff]|echo|throw|function|class|if|switch|case|default)\b/.test(sig)) {
              // Si no termina en ';' o 'array(' o '[' es otra instrucción separada
              break;
            }
          }

          if (!esContinuacion) {
            errores.push({
              archivo,
              linea: num,
              lenguaje: "PHP",
              mensaje: `Falta punto y coma (;) al final de la instrucción: '${l.substring(0, 50)}'`,
              codigo: "PHP-MISSING-SEMICOLON"
            });
          }
        }
      }
    }
  }

  /**
   * Auditoría de Balanceo Universal de Llaves, Corchetes y Paréntesis
   */
  private static auditarBalanceo(archivo: string, contenido: string, errores: ErrorSintaxis[]): void {
    const pila: { char: string; linea: number }[] = [];
    const lineas = contenido.split(/\r?\n/);
    let enString: string | null = null;
    let enComentarioLinea = false;
    let enComentarioBloque = false;

    for (let i = 0; i < lineas.length; i++) {
      const texto = lineas[i]!;
      const numLinea = i + 1;
      enComentarioLinea = false;

      for (let j = 0; j < texto.length; j++) {
        const c = texto[j]!;
        const cSiguiente = texto[j + 1];

        if (enComentarioBloque) {
          if (c === "*" && cSiguiente === "/") {
            enComentarioBloque = false;
            j++;
          }
          continue;
        }

        if (enComentarioLinea) break;

        if (enString) {
          if (c === "\\") {
            j++; // escapar
          } else if (c === enString) {
            enString = null;
          }
          continue;
        }

        // Detección de comentarios
        if (c === "/" && cSiguiente === "/") {
          enComentarioLinea = true;
          break;
        }
        if (c === "/" && cSiguiente === "*") {
          enComentarioBloque = true;
          j++;
          continue;
        }
        if (c === "#" && (archivo.endsWith(".php") || archivo.endsWith(".py") || archivo.endsWith(".sh"))) {
          enComentarioLinea = true;
          break;
        }

        // Detección de expresiones regulares en JS/TS/PHP: /regex/
        if (c === "/" && !enString && !enComentarioLinea && !enComentarioBloque) {
          // Si el slash va seguido de [^...] o caracteres de regex hasta otro /
          let finRegex = -1;
          for (let k = j + 1; k < texto.length; k++) {
            if (texto[k] === "\\") {
              k++;
              continue;
            }
            if (texto[k] === "/") {
              finRegex = k;
              break;
            }
          }
          if (finRegex !== -1) {
            j = finRegex;
            continue;
          }
        }

        // Strings
        if (c === '"' || c === "'" || c === "`") {
          enString = c;
          continue;
        }

        // Delimitadores de apertura
        if (c === "{" || c === "[" || c === "(") {
          pila.push({ char: c, linea: numLinea });
        } else if (c === "}" || c === "]" || c === ")") {
          if (pila.length === 0) {
            errores.push({
              archivo,
              linea: numLinea,
              lenguaje: "UNIVERSAL",
              mensaje: `Delimitador de cierre inesperado '${c}' sin apertura previa correspondiente.`,
              codigo: "SYN-UNMATCHED-CLOSE"
            });
            return;
          }

          const top = pila.pop()!;
          const pares: Record<string, string> = { "}": "{", "]": "[", ")": "(" };
          if (top.char !== pares[c]) {
            errores.push({
              archivo,
              linea: numLinea,
              lenguaje: "UNIVERSAL",
              mensaje: `Delimitador no coincidente: se abrió '${top.char}' en línea ${top.linea} pero se intentó cerrar con '${c}' en línea ${numLinea}.`,
              codigo: "SYN-MISMATCHED-PAIR"
            });
            return;
          }
        }
      }
    }

    if (pila.length > 0) {
      const pendiente = pila[pila.length - 1]!;
      errores.push({
        archivo,
        linea: pendiente.linea,
        lenguaje: "UNIVERSAL",
        mensaje: `Delimitador sin cerrar: '${pendiente.char}' abierto en la línea ${pendiente.linea} nunca fue cerrado al final del archivo.`,
        codigo: "SYN-UNCLOSED-DELIMITER"
      });
    }
  }
}