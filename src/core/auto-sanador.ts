/**
 * @file auto-sanador.ts
 * @description Módulo de remediación quirúrgica determinista para PUF (puf sanar / puf fix).
 * Estándar AUM-IC 7:2026.
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { LectorArbolProyecto } from './arbol-proyecto.js';
import { GestorPuntoControl } from './punto-control.js';

export interface ResultadoSanacion {
  readonly compuerta: string;
  readonly archivosModificados: string[];
  readonly reparacionesAplicadas: number;
  readonly detalle: string;
}

export class AutoSanador {
  /**
   * Ejecuta la auto-remediación determinista sobre una compuerta o todas las sanables.
   */
  public static async sanar(
    directorioRaiz: string,
    compuertasObjetivo?: readonly string[]
  ): Promise<ResultadoSanacion[]> {
    const resultados: ResultadoSanacion[] = [];
    const compuertas = compuertasObjetivo && compuertasObjetivo.length > 0
      ? compuertasObjetivo.map(c => c.toUpperCase().trim())
      : ['G0', 'G8', 'G17', 'G20', 'G22'];

    const snapshot = await LectorArbolProyecto.obtenerSnapshot(directorioRaiz);
    const gestorCheckpoint = new GestorPuntoControl(directorioRaiz);

    // 1. Sanar G0 y G8 (Higiene Forense, Mojibake, BOM y saltos LF)
    if (compuertas.includes('G0') || compuertas.includes('G8')) {
      const resG0G8 = await this.sanarG0G8(directorioRaiz, snapshot, gestorCheckpoint);
      resultados.push(resG0G8);
    }

    // 2. Sanar G17 (Placeholders en Archivos de Licencia)
    if (compuertas.includes('G17')) {
      const resG17 = await this.sanarG17(directorioRaiz, gestorCheckpoint);
      if (resG17) resultados.push(resG17);
    }

    // 3. Sanar G20 (Localhost a variables de entorno en producción)
    if (compuertas.includes('G20')) {
      const resG20 = await this.sanarG20(directorioRaiz, snapshot, gestorCheckpoint);
      if (resG20) resultados.push(resG20);
    }

    // 4. Sanar G22 (Puntos y comas faltantes en CSS/SCSS y PHP)
    if (compuertas.includes('G22')) {
      const resG22 = await this.sanarG22(directorioRaiz, snapshot, gestorCheckpoint);
      if (resG22) resultados.push(resG22);
    }

    return resultados;
  }

  /**
   * Sanación de G0 y G8: Purgar BOM, normalizar a UTF-8 y forzar LF (\n).
   */
  private static async sanarG0G8(
    directorioRaiz: string,
    snapshot: readonly { rutaAbsoluta: string; rutaRelativa: string; extension: string }[],
    gestorCheckpoint: GestorPuntoControl
  ): Promise<ResultadoSanacion> {
    const modificados: string[] = [];
    let arreglos = 0;

    const extensionesTexto = new Set([
      '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
      '.json', '.css', '.scss', '.html', '.astro',
      '.php', '.py', '.rs', '.java', '.cs', '.cpp',
      '.md', '.yml', '.yaml', '.sh'
    ]);

    for (const arch of snapshot) {
      if (!extensionesTexto.has(arch.extension)) continue;
      const r = arch.rutaRelativa;
      if (r.includes('node_modules/') || r.includes('vendor/') || r.includes('.git/') || r.includes('dist/')) continue;

      try {
        const buf = await fs.readFile(arch.rutaAbsoluta);
        let texto = buf.toString('utf8');
        let modificado = false;

        // Purgar BOM (\uFEFF)
        if (texto.charCodeAt(0) === 0xFEFF) {
          texto = texto.slice(1);
          modificado = true;
          arreglos++;
        }

        // Normalizar CRLF (\r\n) a LF (\n)
        if (texto.includes('\r\n')) {
          texto = texto.replace(/\r\n/g, '\n');
          modificado = true;
          arreglos++;
        }

        if (modificado) {
          await gestorCheckpoint.respaldarArchivo('AUTO_FIX_G0_G8', arch.rutaRelativa, directorioRaiz);
          await fs.writeFile(arch.rutaAbsoluta, texto, 'utf8');
          modificados.push(arch.rutaRelativa);
        }
      } catch {}
    }

    return {
      compuerta: 'G0/G8',
      archivosModificados: modificados,
      reparacionesAplicadas: arreglos,
      detalle: `Normalizados ${modificados.length} archivos a UTF-8 puro sin BOM y saltos Unix LF.`
    };
  }

  /**
   * Sanación de G17: Sustituir placeholders comunes (<year>, <owner>, etc.) en LICENSE
   */
  private static async sanarG17(
    directorioRaiz: string,
    gestorCheckpoint: GestorPuntoControl
  ): Promise<ResultadoSanacion | null> {
    const nombres = ['LICENSE', 'LICENSE.md', 'LICENSE.txt'];
    for (const n of nombres) {
      const ruta = path.join(directorioRaiz, n);
      try {
        let contenido = await fs.readFile(ruta, 'utf8');
        const anio = new Date().getFullYear().toString();
        let autor = 'Ingeniería Creativa';

        try {
          const pkg = JSON.parse(await fs.readFile(path.join(directorioRaiz, 'package.json'), 'utf8'));
          if (pkg.author) autor = typeof pkg.author === 'string' ? pkg.author.split('<')[0].trim() : pkg.author.name || autor;
        } catch {}

        let modificado = false;
        if (/<year>|\[year\]/i.test(contenido)) {
          contenido = contenido.replace(/<year>|\[year\]/gi, anio);
          modificado = true;
        }
        if (/<owner>|\[fullname\]|<name of author>/i.test(contenido)) {
          contenido = contenido.replace(/<owner>|\[fullname\]|<name of author>/gi, autor);
          modificado = true;
        }

        if (modificado) {
          await gestorCheckpoint.respaldarArchivo('AUTO_FIX_G17', n, directorioRaiz);
          await fs.writeFile(ruta, contenido, 'utf8');
          return {
            compuerta: 'G17',
            archivosModificados: [n],
            reparacionesAplicadas: 1,
            detalle: `Actualizados placeholders de copyright en ${n} con el año ${anio} y titular "${autor}".`
          };
        }
      } catch {}
    }
    return null;
  }

  /**
   * Sanación de G20: Reemplazar http://localhost o 127.0.0.1 por fallbacks de env.
   */
  private static async sanarG20(
    directorioRaiz: string,
    snapshot: readonly { rutaAbsoluta: string; rutaRelativa: string; extension: string }[],
    gestorCheckpoint: GestorPuntoControl
  ): Promise<ResultadoSanacion | null> {
    const extensiones = new Set(['.ts', '.js', '.astro', '.tsx', '.jsx', '.php']);
    const modificados: string[] = [];
    let arreglos = 0;

    for (const arch of snapshot) {
      if (!extensiones.has(arch.extension)) continue;
      const r = arch.rutaRelativa;
      if (r.includes('node_modules/') || r.includes('test') || r.includes('spec') || r.includes('evaluador') || r.includes('vite.config')) continue;

      try {
        let texto = await fs.readFile(arch.rutaAbsoluta, 'utf8');
        const regex = /["']https?:\/\/(localhost|127\.0\.0\.1):[0-9]+["']/g;
        if (regex.test(texto)) {
          await gestorCheckpoint.respaldarArchivo('AUTO_FIX_G20', arch.rutaRelativa, directorioRaiz);
          texto = texto.replace(regex, '(process.env.API_URL || "https://api.ingcrea.com")');
          await fs.writeFile(arch.rutaAbsoluta, texto, 'utf8');
          modificados.push(arch.rutaRelativa);
          arreglos++;
        }
      } catch {}
    }

    if (modificados.length === 0) return null;

    return {
      compuerta: 'G20',
      archivosModificados: modificados,
      reparacionesAplicadas: arreglos,
      detalle: `Parametrizadas ${arreglos} referencias hardcodeadas a localhost en ${modificados.length} archivos.`
    };
  }

  /**
   * Sanación de G22: Inyección de punto y coma faltante en CSS/SCSS.
   */
  private static async sanarG22(
    directorioRaiz: string,
    snapshot: readonly { rutaAbsoluta: string; rutaRelativa: string; extension: string }[],
    gestorCheckpoint: GestorPuntoControl
  ): Promise<ResultadoSanacion | null> {
    const extensiones = new Set(['.css', '.scss']);
    const modificados: string[] = [];
    let arreglos = 0;

    for (const arch of snapshot) {
      if (!extensiones.has(arch.extension)) continue;
      const r = arch.rutaRelativa;
      if (r.includes('node_modules/') || r.includes('dist/')) continue;

      try {
        const lineas = (await fs.readFile(arch.rutaAbsoluta, 'utf8')).split('\n');
        let modificado = false;

        for (let i = 0; i < lineas.length; i++) {
          const l = lineas[i];
          if (!l) continue;
          const limpia = l.trim();
          // Patrón propiedad CSS: valor sin ';' y siguiente línea no es cierre '}'
          if (/^[a-zA-Z\-]+:\s*[^;{}]+$/.test(limpia)) {
            const sig = lineas[i + 1]?.trim();
            if (sig && sig !== '}') {
              lineas[i] = l + ';';
              modificado = true;
              arreglos++;
            }
          }
        }

        if (modificado) {
          await gestorCheckpoint.respaldarArchivo('AUTO_FIX_G22', arch.rutaRelativa, directorioRaiz);
          await fs.writeFile(arch.rutaAbsoluta, lineas.join('\n'), 'utf8');
          modificados.push(arch.rutaRelativa);
        }
      } catch {}
    }

    if (modificados.length === 0) return null;

    return {
      compuerta: 'G22',
      archivosModificados: modificados,
      reparacionesAplicadas: arreglos,
      detalle: `Inyectados ${arreglos} delimitadores de punto y coma en ${modificados.length} hojas de estilo.`
    };
  }
}
