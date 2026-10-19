/**
 * @file base.ts
 * @description Clase base abstracta para adaptadores con motor de puntuacion heuristica de confianza.
 * Extiende la interfaz AdaptadorLenguaje con G12 (Rutas Vivas) y G13 (Interactividad).
 * Estandar AUM-IC 7:2026.
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import type { AdaptadorLenguaje, ContextoDeteccion, EcosistemaLenguaje } from '../core/types.js';

export interface CriteriosHeuristicos {
  readonly manifiestos: readonly string[];
  readonly configuraciones: readonly string[];
  readonly lockfiles: readonly string[];
  readonly extensiones: readonly string[];
  readonly shebangs?: readonly string[];
}

export abstract class AdaptadorBase implements AdaptadorLenguaje {
  public abstract readonly ecosistema: EcosistemaLenguaje;
  public abstract readonly nombreLegible: string;
  protected abstract readonly criterios: CriteriosHeuristicos;

  /** Extensiones web que aplican para G12/G13 */
  private static readonly EXT_WEB = new Set(['.astro', '.jsx', '.tsx', '.html', '.php', '.vue', '.svelte']);

  /** G12: Regex que captura href/src/to con rutas locales (no http, no #, no {}) */
  private static readonly REGEX_RUTA_LOCAL =
    /(?:href|src|to|action)=["'](?!https?:\/\/|\/\/|#|\{)([^"']+)["']/gi;

  /** G13: Detecta handlers de eventos vacios o inertes */
  private static readonly REGEX_HANDLER_INERTE =
    /(?:onClick|on:click|@click|onPress)\s*=\s*["']{2}|onClick=\{undefined\}|onClick=\{\s*\}/gi;

  public async calcularPuntaje(contexto: ContextoDeteccion): Promise<number> {
    let puntaje = 0;
    const { directorioRaiz, archivosAfectados = [] } = contexto;

    for (const m of this.criterios.manifiestos) {
      const existe = await fs.stat(path.join(directorioRaiz, m)).catch(() => null);
      if (existe) puntaje += 40;
    }
    for (const c of this.criterios.configuraciones) {
      const existe = await fs.stat(path.join(directorioRaiz, c)).catch(() => null);
      if (existe) puntaje += 25;
    }
    for (const l of this.criterios.lockfiles) {
      const existe = await fs.stat(path.join(directorioRaiz, l)).catch(() => null);
      if (existe) puntaje += 20;
    }
    for (const archivo of archivosAfectados) {
      const ext = path.extname(archivo).toLowerCase();
      if (this.criterios.extensiones.includes(ext)) puntaje += 30;
    }

    return puntaje;
  }

  public async detectar(directorioRaiz: string): Promise<boolean> {
    const puntaje = await this.calcularPuntaje({ directorioRaiz });
    return puntaje >= 40;
  }

  public abstract ejecutarLinterEstricto(
    directorioRaiz: string
  ): Promise<{ exitoso: boolean; mensaje: string }>;

  public abstract generarAndamioTest(
    idIncidente: string,
    descripcionFallo: string
  ): Promise<string>;

  public abstract purgarEstado(
    directorioRaiz: string
  ): Promise<{ exitoso: boolean; mensaje: string }>;

  /**
   * G12: Dead Link Sweeper — detecta hrefs/srcs locales rotos en archivos web.
   * Implementacion base compartida; los adaptadores especializados pueden sobreescribirla.
   */
  public async auditarRutasVivas(
    archivosAfectados: readonly string[],
    directorioRaiz: string
  ): Promise<{ exitoso: boolean; violaciones: readonly string[] }> {
    const violaciones: string[] = [];

    for (const rutaRelativa of archivosAfectados) {
      const ext = path.extname(rutaRelativa).toLowerCase();
      if (!AdaptadorBase.EXT_WEB.has(ext)) continue;

      const rutaAbsoluta = path.resolve(directorioRaiz, rutaRelativa);
      const contenido = await fs.readFile(rutaAbsoluta, 'utf-8').catch(() => null);
      if (!contenido) continue;

      let m: RegExpExecArray | null;
      const regex = new RegExp(AdaptadorBase.REGEX_RUTA_LOCAL.source, 'gi');
      while ((m = regex.exec(contenido)) !== null) {
        const ruta = m[1];
        if (!ruta || ruta.startsWith('{') || ruta.startsWith('mailto:') || ruta.startsWith('tel:')) continue;
        const base = ruta.split('?')[0]!.split('#')[0]!;
        const rutaDestino = path.resolve(path.dirname(rutaAbsoluta), base);
        const existe = await fs.stat(rutaDestino).catch(() => null);
        if (!existe) {
          violaciones.push(`${rutaRelativa} -> "${ruta}" (no existe en filesystem)`);
        }
      }
    }

    return { exitoso: violaciones.length === 0, violaciones };
  }

  /**
   * G13: Living UI Actions — detecta handlers de eventos vacios o inertes.
   * Implementacion base compartida; los adaptadores especializados pueden sobreescribirla.
   */
  public async auditarInteractividad(
    archivosAfectados: readonly string[],
    directorioRaiz: string
  ): Promise<{ exitoso: boolean; violaciones: readonly string[] }> {
    const violaciones: string[] = [];

    for (const rutaRelativa of archivosAfectados) {
      const ext = path.extname(rutaRelativa).toLowerCase();
      if (!AdaptadorBase.EXT_WEB.has(ext)) continue;

      const rutaAbsoluta = path.resolve(directorioRaiz, rutaRelativa);
      const contenido = await fs.readFile(rutaAbsoluta, 'utf-8').catch(() => null);
      if (!contenido) continue;

      const lineas = contenido.split('\n');
      for (let i = 0; i < lineas.length; i++) {
        const linea = lineas[i] ?? '';
        if (AdaptadorBase.REGEX_HANDLER_INERTE.test(linea)) {
          violaciones.push(`${rutaRelativa}:${i + 1} -> handler inerte: ${linea.trim()}`);
        }
        AdaptadorBase.REGEX_HANDLER_INERTE.lastIndex = 0;
      }
    }

    return { exitoso: violaciones.length === 0, violaciones };
  }
}
