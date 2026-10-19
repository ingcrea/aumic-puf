/**
 * @file linter-inline-css.ts
 * @description Linter forense estricto contra CSS Inline (Compuerta G4).
 * Prohibición Absoluta de atributos `style="..."` en HTML/PHP/JSX/Astro.
 * Estándar AUM-IC 7:2026.
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';

export interface ViolacionCssInline {
  readonly rutaArchivo: string;
  readonly numeroLinea: number;
  readonly contenidoLinea: string;
}

export class LinterCssInline {
  private static readonly REGEX_STYLE = /<[^>]+?\sstyle\s*=\s*["'][^"']*?["'][^>]*?>/gi;
  private static readonly EXTENSIONES = new Set(['.php', '.html', '.astro', '.jsx', '.tsx']);

  /**
   * Escanea recursivamente un directorio o lista de archivos buscando estilos en línea
   */
  public static async auditar(
    rutasArchivos: readonly string[],
    directorioRaiz: string
  ): Promise<readonly ViolacionCssInline[]> {
    const violaciones: ViolacionCssInline[] = [];

    for (const rutaRelativa of rutasArchivos) {
      const extension = path.extname(rutaRelativa).toLowerCase();
      if (!this.EXTENSIONES.has(extension)) continue;

      const rutaAbsoluta = path.resolve(directorioRaiz, rutaRelativa);
      const contenido = await fs.readFile(rutaAbsoluta, 'utf-8').catch(() => null);
      if (!contenido) continue;

      const lineas = contenido.split('\n');
      for (let i = 0; i < lineas.length; i++) {
        const linea = lineas[i] ?? '';
        if (this.REGEX_STYLE.test(linea)) {
          violaciones.push({
            rutaArchivo: rutaRelativa,
            numeroLinea: i + 1,
            contenidoLinea: linea.trim(),
          });
        }
      }
    }

    return violaciones;
  }
}