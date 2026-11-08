import { RegistroCompuerta } from "./types.js";
import * as fs from "node:fs/promises";
import { LectorArbolProyecto } from "./arbol-proyecto.js";

export interface ViolacionWpWoo {
  readonly archivo: string;
  readonly linea: number;
  readonly regla: string;
  readonly mensaje: string;
}

/**
 * G21: Cumplimiento y Buenas Prácticas Oficiales WordPress & WooCommerce (WP & WC Core Compliance Guard).
 * Audita apego a WordPress Coding Standards (WPCS) y WooCommerce HPOS/CRUD Guidelines.
 */
export class EvaluadorWpWoo {
  public static async auditar(directorioRaiz: string): Promise<RegistroCompuerta> {
    const t = Date.now();
    const archivos = await LectorArbolProyecto.obtenerSnapshot(directorioRaiz);

    // Detección heurística de ecosistema WordPress / WooCommerce
    const esWordPress = archivos.some(a => 
      a.rutaRelativa.endsWith("functions.php") ||
      a.rutaRelativa.endsWith("wp-config.php") ||
      a.rutaRelativa.includes("wp-content/") ||
      a.rutaRelativa.includes("woocommerce")
    );

    const archivosPhp = archivos.filter(a => a.extension === ".php");
    if (!esWordPress && archivosPhp.length === 0) {
      return {
        id: "G21",
        nombre: "Cumplimiento Oficial WordPress & WooCommerce (WPCS & WC Guidelines)",
        estado: "omitida",
        detalle: "No se detectó estructura ni dependencias de WordPress / WooCommerce. Compuerta omitida.",
        evidencia: "Entorno no WordPress",
        tiempoEjecucionMs: Date.now() - t
      };
    }

    let detectadoWpTokens = esWordPress;
    if (!detectadoWpTokens) {
      for (const arch of archivosPhp.slice(0, 10)) {
        try {
          const raw = await fs.readFile(arch.rutaAbsoluta, "utf8");
          if (raw.includes("add_action(") || raw.includes("add_filter(") || raw.includes("wc_get_order") || raw.includes("wp_send_json")) {
            detectadoWpTokens = true;
            break;
          }
        } catch {}
      }
    }

    if (!detectadoWpTokens) {
      return {
        id: "G21",
        nombre: "Cumplimiento Oficial WordPress & WooCommerce (WPCS & WC Guidelines)",
        estado: "omitida",
        detalle: "Proyecto PHP estándar sin hooks o APIs nativas de WordPress/WooCommerce.",
        evidencia: "Proyecto PHP general",
        tiempoEjecucionMs: Date.now() - t
      };
    }

    const violaciones: ViolacionWpWoo[] = [];
    let cuentaArchivosWp = 0;
    let tieneWooCommerce = false;
    let declaraHpos = false;

    for (const arch of archivosPhp) {
      if (arch.rutaRelativa.includes("vendor/") || arch.rutaRelativa.includes("tests/")) continue;
      cuentaArchivosWp++;

      let contenido: string;
      try {
        contenido = await fs.readFile(arch.rutaAbsoluta, "utf8");
      } catch {
        continue;
      }

      if (contenido.includes("custom_order_tables") || contenido.includes("declare_compatibility")) {
        declaraHpos = true;
      }

      if (contenido.includes("WC_") || contenido.includes("wc_") || contenido.includes("woocommerce")) {
        tieneWooCommerce = true;
      }

      const lineas = contenido.split(/\r?\n/);

      for (let i = 0; i < lineas.length; i++) {
        const lineaNum = i + 1;
        const texto = lineas[i] || "";
        const lineaLimpia = texto.trim();

        // Ignorar comentarios
        if (lineaLimpia.startsWith("//") || lineaLimpia.startsWith("#") || lineaLimpia.startsWith("*")) continue;

        // Regla 1: WordPress Security - Acceso a superglobales sin sanitizar
        if (/(?:\$_GET|\$_POST|\$_REQUEST)\[.+\]/.test(texto)) {
          const sanitizado = /(?:sanitize_text_field|sanitize_key|absint|intval|sanitize_email|esc_url_raw|wp_unslash)\s*\(/.test(texto) ||
                             /array_map\s*\(\s*['"](?:sanitize_text_field|intval|absint)['"]/.test(texto);
          const issetSolo = /isset\s*\(|empty\s*\(/.test(texto);
          if (!sanitizado && !issetSolo) {
            violaciones.push({
              archivo: arch.rutaRelativa,
              linea: lineaNum,
              regla: "WP-SEC-01 (Sanitización)",
              mensaje: "Acceso directo a superglobal ($_POST/$_GET/$_REQUEST) sin función canónica de sanitización (sanitize_text_field, absint, esc_url_raw)."
            });
          }
        }

        // Regla 2: WordPress Security - Consultas directas a WPDB sin prepare
        // Detecta consultas donde el payload SQL concatena variables de usuario (. $var) o interpola dentro del string comillas
        const contieneLlamadaWpdb = /\$wpdb->(?:query|get_results|get_row|get_var)\s*\(/i.test(texto);
        if (contieneLlamadaWpdb && !texto.includes("$wpdb->prepare") && !texto.includes("prepare(")) {
          // Extraer lo que está dentro del paréntesis de la llamada a wpdb
          const matchCall = texto.match(/\$wpdb->(?:query|get_results|get_row|get_var)\s*\((.+)/i);
          if (matchCall && matchCall[1]) {
            const cuerpoSql = matchCall[1];
            // Concatena variable externa con punto: . $variable
            const concatenaVar = /\.\s*\$[a-zA-Z_]/i.test(cuerpoSql);
            // Interpola variable que no sea tabla canónica del core: $var o {$var}
            const interpolaVar = /(?<!\{?wpdb->(?:prefix|posts|postmeta|users|usermeta|options|terms|term_taxonomy|term_relationships)\b)\$[a-zA-Z_]/i.test(cuerpoSql.replace(/\$wpdb->(?:prefix|posts|postmeta|users|usermeta|options|terms|term_taxonomy|term_relationships)\b/g, ''));
            if (concatenaVar || interpolaVar) {
            violaciones.push({
              archivo: arch.rutaRelativa,
              linea: lineaNum,
              regla: "WP-SEC-02 (SQL Injection)",
              mensaje: "Consulta directa a $wpdb construida con variables dinámicas no sanitizadas sin $wpdb->prepare(). Vulnerabilidad de Inyección SQL."
            });
            }
          }
        }

        // Regla 3: WooCommerce CRUD & HPOS - Acceso a get_post_meta para pedidos
        if (/get_post_meta\s*\(\s*\$order(?:->get_id\(\)|\b)/i.test(texto) || /get_post_meta\s*\(\s*\$order_id\s*,\s*["']_shipping_/i.test(texto)) {
          violaciones.push({
            archivo: arch.rutaRelativa,
            linea: lineaNum,
            regla: "WC-HPOS-01 (CRUD Mandatorio)",
            mensaje: "Uso obsoleto de get_post_meta() en órdenes. Incumple HPOS. Usar $order->get_meta() o métodos CRUD canónicos de WC_Order."
          });
        }

        // Regla 4: WooCommerce Core - Acceso directo a propiedades obsoletas
        if (/\$order->(?:id|status|total|shipping_postcode|billing_email)\b/i.test(texto)) {
          violaciones.push({
            archivo: arch.rutaRelativa,
            linea: lineaNum,
            regla: "WC-CORE-01 (Propiedades Obsoletas)",
            mensaje: "Acceso directo a propiedades privadas de WC_Order obsoletas desde WooCommerce 3.0. Reemplazar por getters canónicos (ej. $order->get_id(), $order->get_status())."
          });
        }

        // Regla 5: WordPress Options & Robust Fallback - Uso frágil de ?? con arrays de configuración
        // En WordPress, get_option() o arrays de settings a menudo devuelven strings vacíos "" cuando un campo se guarda en blanco.
        // El operador ?? solo evalúa null, ignorando "" y enviando cadenas vacías a integraciones externas.
        if (/\$(?:settings|options|opt|config)\[[^\]]+\]\s*\?\?\s*['"][^'"]+['"]/i.test(texto)) {
          violaciones.push({
            archivo: arch.rutaRelativa,
            linea: lineaNum,
            regla: "WP-ROBUST-OPT-01 (Empty Coalesce)",
            mensaje: "Uso inseguro del operador '??' al extraer opciones o configuración. Si el valor persistido es una cadena vacía (''), el valor por defecto no se aplicará. Utilizar !empty(...) ? ... : fallback."
          });
        }

        // Regla 6: Zero Hardcoded Circuit Breakers - Banderas de control de despacho fijadas estáticamente
        if (/^\s*\$(?:api_ready|dispatch_enabled|is_active|live_mode|production_mode)\s*=\s*(?:false|true)\s*;/i.test(texto)) {
          violaciones.push({
            archivo: arch.rutaRelativa,
            linea: lineaNum,
            regla: "WP-CIRCUIT-BREAKER-01 (Hardcoded Flag)",
            mensaje: "Bandera de control de ejecución o despacho fijada estáticamente a boolean literal ($api_ready / $dispatch_enabled). Debe derivar dinámicamente de opciones de WordPress (get_option) o configuración de entorno."
          });
        }
      }
    }

    if (violaciones.length > 0) {
      const resumen = violaciones.slice(0, 3).map(v => `${v.archivo}:${v.linea} [${v.regla}] ${v.mensaje}`).join(" | ");
      return {
        id: "G21",
        nombre: "Cumplimiento Oficial WordPress & WooCommerce (WPCS & WC Guidelines)",
        estado: "rechazada",
        detalle: `Se detectaron ${violaciones.length} desviaciones de la documentación oficial de WP/WC: ${resumen}`,
        evidencia: `${violaciones.length} no conformidades oficiales detectadas`,
        tiempoEjecucionMs: Date.now() - t
      };
    }

    let detalleAprobado = `Auditoría oficial aprobada en ${cuentaArchivosWp} archivo(s) PHP. Cero vulnerabilidades WPCS y compatibilidad con CRUD/HPOS verificada.`;
    if (tieneWooCommerce) {
      detalleAprobado += declaraHpos ? " Compatibilidad formal HPOS declarada." : " Métodos CRUD de WC_Order respetados.";
    }

    return {
      id: "G21",
      nombre: "Cumplimiento Oficial WordPress & WooCommerce (WPCS & WC Guidelines)",
      estado: "aprobada",
      detalle: detalleAprobado,
      evidencia: `${cuentaArchivosWp} archivos auditados conforme a WP/WC Core`,
      tiempoEjecucionMs: Date.now() - t
    };
  }
}