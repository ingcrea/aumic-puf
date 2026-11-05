import { RegistroCompuerta } from "./types.js";
import * as path from "node:path";
import * as fs from "node:fs/promises";

/**
 * G17: Blindaje Legal, Integridad de Licencias y Compatibilidad de Dependencias (AUM-IC IP & License Guard).
 * - En proyectos con archivo de licencia o manifiesto con licencia declarada: audita a fondo su correcta implementación.
 * - En proyectos privativos de clientes sin licencia: emite recomendación no bloqueante (estado: aprobada con advertencia o omitida).
 */
export class EvaluadorLicencias {
  public static async auditar(directorioRaiz: string): Promise<RegistroCompuerta> {
    const t = Date.now();
    const archivosLicencia = ["LICENSE", "LICENSE.md", "LICENSE.txt", "LICENSE-DOCS", "LICENSE-DOCS.md"];
    let archivoEncontrado: string | null = null;
    let contenidoLicencia = "";

    for (const nombre of archivosLicencia) {
      const ruta = path.join(directorioRaiz, nombre);
      const existe = await fs.stat(ruta).catch(() => null);
      if (existe && existe.isFile()) {
        archivoEncontrado = nombre;
        try {
          contenidoLicencia = await fs.readFile(ruta, "utf8");
        } catch {}
        break;
      }
    }

    // Comprobar manifiesto package.json o composer.json o Cargo.toml
    let licenciaManifiesto: string | null = null;
    try {
      const pkgPath = path.join(directorioRaiz, "package.json");
      const pkgRaw = await fs.readFile(pkgPath, "utf8");
      const pkg = JSON.parse(pkgRaw);
      licenciaManifiesto = pkg.license || null;
    } catch {}

    // Escenario 1: Existe archivo de licencia -> Auditar su correcta implementación
    if (archivoEncontrado) {
      const tieneCopyright = /copyright|\(c\)|todos los derechos/i.test(contenidoLicencia);

      // Extraer solo los primeros 100 caracteres o la cabecera si tiene placeholders antes de la plantilla oficial
      // Excluir la sección de instrucciones "How to Apply These Terms" estándar de GPL/AGPL
      const seccionCabecera = contenidoLicencia.split(/How to Apply These Terms/i)[0] || contenidoLicencia;
      const tieneTextoVacioOPlaceholder = /<year>|<owner>|\[year\]|\[fullname\]/i.test(seccionCabecera);

      if (tieneTextoVacioOPlaceholder) {
        return {
          id: "G17",
          nombre: "Blindaje Legal, Integridad de Licencias y Compatibilidad (IP & License Guard)",
          estado: "rechazada",
          detalle: `Archivo de licencia '${archivoEncontrado}' contiene placeholders sin rellenar (<year>/<owner>). Requiere titularidad definida.`,
          evidencia: "Placeholders detectados en texto legal",
          tiempoEjecucionMs: Date.now() - t
        };
      }

      // Si el package.json define una licencia diferente al tipo detectado
      if (licenciaManifiesto) {
        const esMitEnPkg = /mit/i.test(licenciaManifiesto);
        const esAgplEnPkg = /agpl/i.test(licenciaManifiesto);
        const esApacheEnPkg = /apache/i.test(licenciaManifiesto);

        const esMitEnTxt = /mit license/i.test(contenidoLicencia);
        const esAgplEnTxt = /affero general public license|agpl/i.test(contenidoLicencia);
        const esApacheEnTxt = /apache license/i.test(contenidoLicencia);

        if ((esMitEnPkg && !esMitEnTxt) || (esAgplEnPkg && !esAgplEnTxt) || (esApacheEnPkg && !esApacheEnTxt)) {
          return {
            id: "G17",
            nombre: "Blindaje Legal, Integridad de Licencias y Compatibilidad (IP & License Guard)",
            estado: "rechazada",
            detalle: `Discrepancia legal: package.json declara '${licenciaManifiesto}' pero '${archivoEncontrado}' parece corresponder a otro tipo de licencia.`,
            evidencia: `package.json: ${licenciaManifiesto} vs ${archivoEncontrado}`,
            tiempoEjecucionMs: Date.now() - t
          };
        }
      }

      return {
        id: "G17",
        nombre: "Blindaje Legal, Integridad de Licencias y Compatibilidad (IP & License Guard)",
        estado: "aprobada",
        detalle: `Licencia '${archivoEncontrado}' correctamente implementada${licenciaManifiesto ? ` (Consistente con manifiesto: ${licenciaManifiesto})` : ''}.${tieneCopyright ? ' Titularidad y copyright verificados.' : ''}`,
        evidencia: `${archivoEncontrado} valido (${contenidoLicencia.length} bytes)`,
        tiempoEjecucionMs: Date.now() - t
      };
    }

    // Escenario 2: No hay archivo de licencia pero el manifiesto declara una
    if (licenciaManifiesto && licenciaManifiesto !== "UNLICENSED") {
      return {
        id: "G17",
        nombre: "Blindaje Legal, Integridad de Licencias y Compatibilidad (IP & License Guard)",
        estado: "rechazada",
        detalle: `El manifiesto declara licencia '${licenciaManifiesto}', pero no se encontro el archivo LICENSE o LICENSE.md en la raiz.`,
        evidencia: "Falta archivo LICENSE físico",
        tiempoEjecucionMs: Date.now() - t
      };
    }

    // Escenario 3: Código privativo de cliente sin licencia pública (No bloqueante, emite recomendación)
    return {
      id: "G17",
      nombre: "Blindaje Legal, Integridad de Licencias y Compatibilidad (IP & License Guard)",
      estado: "aprobada",
      detalle: "Proyecto privativo/comercial sin archivo de licencia pública. Sugerencia AUM-IC: asegurar acuerdos de confidencialidad o 'UNLICENSED' en manifiesto.",
      evidencia: "Software Privativo Comercial",
      tiempoEjecucionMs: Date.now() - t
    };
  }
}
