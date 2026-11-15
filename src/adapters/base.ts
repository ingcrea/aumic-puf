/**
 * @file base.ts
 * @description Clase base abstracta para adaptadores con motor de puntuacion heuristica de confianza.
 * Extiende la interfaz AdaptadorLenguaje con G12 (Rutas Vivas) y G13 (Interactividad).
 * Estandar AUM-IC 7:2026.
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import type { AdaptadorLenguaje, ContextoDeteccion, EcosistemaLenguaje } from '../core/types.js';
import { LectorArbolProyecto } from '../core/arbol-proyecto.js';

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
    /(?:href|src|to)\s*=\s*["'](?!https?:\/\/|\/\/|#|\{)([^"']+)["']/gi;

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
   * G12: Dead Link Sweeper — detecta hrefs/srcs locales rotos y enlaces huérfanos (#) sin manejador.
   * Implementacion base compartida; los adaptadores especializados pueden sobreescribirla.
   */
  public async auditarRutasVivas(
    archivosAfectados: readonly string[],
    directorioRaiz: string
  ): Promise<{ exitoso: boolean; violaciones: readonly string[] }> {
    const violaciones: string[] = [];

    // Si no se pasaron archivos afectados específicos, escanear todo el árbol del proyecto
    let archivosAEscanear: readonly string[] = archivosAfectados;
    if (!archivosAEscanear || archivosAEscanear.length === 0) {
      const snap = await LectorArbolProyecto.obtenerSnapshot(directorioRaiz);
      archivosAEscanear = snap.map((e) => e.rutaRelativa);
    }

    // Filtrar archivos web reales (excluyendo dist, build, .astro, .next, etc.)
    const archivosWeb = archivosAEscanear.filter((r) => {
      const ext = path.extname(r).toLowerCase();
      if (!AdaptadorBase.EXT_WEB.has(ext)) return false;
      const partes = r.replace(/\\/g, '/').split('/');
      return !partes.some((p) => p.startsWith('dist') || p === 'build' || p === 'out' || p === '.astro');
    });

    for (const rutaRelativa of archivosWeb) {
      const rutaAbsoluta = path.resolve(directorioRaiz, rutaRelativa);
      const contenido = await fs.readFile(rutaAbsoluta, 'utf-8').catch(() => null);
      if (!contenido) continue;

      const lineas = contenido.split('\n');

      for (let i = 0; i < lineas.length; i++) {
        const linea = lineas[i] ?? '';

        // 1. Detección de Enlaces Huérfanos: <a ... href="#" ...> o <a ... href='#' ...>
        const linkMatches = linea.matchAll(/<a\b([^>]*)>/gi);
        for (const m of linkMatches) {
          const attrs = m[1] ?? '';
          if (/href\s*=\s*["']#["']/i.test(attrs)) {
            // Verificar si cuenta con controlador de acción legítimo
            const tieneManejador =
              /onclick|on:click|@click|\(click\)|v-on:click|data-aum-|data-action|data-modal|data-drawer|data-tab|data-toggle|data-target|data-utility|data-copy|role=["']button["']/i.test(
                attrs
              );
            if (!tieneManejador) {
              violaciones.push(
                `${rutaRelativa}:${i + 1} -> Enlace huérfano con href="#" sin manejador interactivo ni data-aum-* action`
              );
            }
          }
        }

        // 2. Rutas relativas locales no resolubles en filesystem
        let mRuta: RegExpExecArray | null;
        const regex = new RegExp(AdaptadorBase.REGEX_RUTA_LOCAL.source, 'gi');
        while ((mRuta = regex.exec(linea)) !== null) {
          const ruta = mRuta[1];
          if (
            !ruta ||
            ruta.startsWith('{') ||
            ruta.startsWith('mailto:') ||
            ruta.startsWith('tel:') ||
            ruta.startsWith('javascript:') ||
            ruta.startsWith('#')
          ) {
            continue;
          }
          // Rutas absolutas de servidor web (/catalog, /telemetry, /api/...) se excluyen de chequeo fs directo
          if (ruta.startsWith('/')) continue;

          const base = ruta.split('?')[0]!.split('#')[0]!;
          const rutaDestino = path.resolve(path.dirname(rutaAbsoluta), base);
          const existe = await fs.stat(rutaDestino).catch(() => null);
          if (!existe) {
            violaciones.push(`${rutaRelativa}:${i + 1} -> "${ruta}" (ruta relativa no existe en filesystem)`);
          }
        }
      }
    }

    return { exitoso: violaciones.length === 0, violaciones };
  }

  /**
   * G13: Living UI Actions — detecta handlers de eventos vacíos o botones/enlaces inertes en el DOM.
   * Implementacion base compartida; los adaptadores especializados pueden sobreescribirla.
   */
  public async auditarInteractividad(
    archivosAfectados: readonly string[],
    directorioRaiz: string
  ): Promise<{ exitoso: boolean; violaciones: readonly string[] }> {
    const violaciones: string[] = [];

    // Si no se pasaron archivos afectados específicos, escanear todo el árbol del proyecto
    let archivosAEscanear: readonly string[] = archivosAfectados;
    if (!archivosAEscanear || archivosAEscanear.length === 0) {
      const snap = await LectorArbolProyecto.obtenerSnapshot(directorioRaiz);
      archivosAEscanear = snap.map((e) => e.rutaRelativa);
    }

    // Filtrar archivos web reales (excluyendo dist, build, .astro, .next, etc.)
    const archivosWeb = archivosAEscanear.filter((r) => {
      const ext = path.extname(r).toLowerCase();
      if (!AdaptadorBase.EXT_WEB.has(ext)) return false;
      const partes = r.replace(/\\/g, '/').split('/');
      return !partes.some((p) => p.startsWith('dist') || p === 'build' || p === 'out' || p === '.astro');
    });

    for (const rutaRelativa of archivosWeb) {
      const rutaAbsoluta = path.resolve(directorioRaiz, rutaRelativa);
      const contenido = await fs.readFile(rutaAbsoluta, 'utf-8').catch(() => null);
      if (!contenido) continue;

      const lineas = contenido.split('\n');
      for (let i = 0; i < lineas.length; i++) {
        const linea = lineas[i] ?? '';

        // 1. Handlers explícitamente vacíos
        if (AdaptadorBase.REGEX_HANDLER_INERTE.test(linea)) {
          violaciones.push(`${rutaRelativa}:${i + 1} -> handler inerte vacío: ${linea.trim()}`);
        }
        AdaptadorBase.REGEX_HANDLER_INERTE.lastIndex = 0;

        // 2. Elementos <button ...> sin acción ni manejador interactivo
        const btnMatches = linea.matchAll(/<button\b([^>]*)>/gi);
        for (const m of btnMatches) {
          const attrs = m[1] ?? '';
          // Si es type="submit" o type="reset", tiene función nativa de formulario
          if (/type\s*=\s*["'](?:submit|reset)["']/i.test(attrs)) continue;

          // Si tiene handler o data-action / data-* o id / class para binding JS o evento de framework
          const tieneManejadorOId =
            /onclick|on:click|@click|\(click\)|v-on:click|data-aum-|data-|id\s*=\s*["'][^"']+["']|href\s*=/i.test(
              attrs
            );

          if (!tieneManejadorOId) {
            violaciones.push(
              `${rutaRelativa}:${i + 1} -> Botón zombie/inerte sin manejador de evento, data-* action ni ID de binding: <button${attrs.trim() ? ' ' + attrs.trim() : ''}>`
            );
          }
        }
      }
    }

    return { exitoso: violaciones.length === 0, violaciones };
  }
}
