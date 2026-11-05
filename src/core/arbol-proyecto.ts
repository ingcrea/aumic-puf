import * as fs from 'node:fs/promises';
import * as path from 'node:path';

export interface EntradaArchivo {
  readonly rutaRelativa: string;
  readonly rutaAbsoluta: string;
  readonly extension: string;
  readonly tamanoBytes: number;
}

/**
 * LectorArbolProyecto (VFS Snapshot en memoria)
 * Escanea el árbol de directorios una sola vez y expone el listado indexado
 * para evitar lecturas de disco redundantes en las compuertas G4, G18, G19, G20.
 */
export class LectorArbolProyecto {
  private static instanciaCache: Map<string, { timestamp: number; archivos: readonly EntradaArchivo[] }> = new Map();
  private static readonly TTL_MS = 15000; // 15 segundos de validez

  public static async obtenerSnapshot(directorioRaiz: string): Promise<readonly EntradaArchivo[]> {
    const ahora = Date.now();
    const enCache = this.instanciaCache.get(directorioRaiz);
    if (enCache && (ahora - enCache.timestamp) < this.TTL_MS) {
      return enCache.archivos;
    }

    const archivos: EntradaArchivo[] = [];
    const carpetasIgnoradas = new Set([
      'node_modules',
      '.git',
      'dist',
      '.next',
      '.astro',
      'vendor',
      '.venv',
      'venv',
      '__pycache__',
      'target',
      'build',
      'bin',
      'obj',
      '.idea',
      '.vscode',
      'uploads',
      'cache',
      'checkpoints',
      'coverage',
      '.turbo',
      '.aumic'
    ]);

    const escanearDirectorio = async (dirActual: string): Promise<void> => {
      let entradas;
      try {
        entradas = await fs.readdir(dirActual, { withFileTypes: true });
      } catch {
        return;
      }

      const promesasCarpetas: Promise<void>[] = [];

      for (const e of entradas) {
        const rutaCompleta = path.join(dirActual, e.name);
        if (e.isDirectory()) {
          if (!carpetasIgnoradas.has(e.name)) {
            promesasCarpetas.push(escanearDirectorio(rutaCompleta));
          }
        } else if (e.isFile()) {
          const ext = path.extname(e.name).toLowerCase();
          const rutaRel = path.relative(directorioRaiz, rutaCompleta).replace(/\\/g, '/');
          archivos.push({
            rutaRelativa: rutaRel,
            rutaAbsoluta: rutaCompleta,
            extension: ext,
            tamanoBytes: 0,
          });
        }
      }

      if (promesasCarpetas.length > 0) {
        await Promise.all(promesasCarpetas);
      }
    };

    await escanearDirectorio(directorioRaiz);
    this.instanciaCache.set(directorioRaiz, { timestamp: ahora, archivos });
    return archivos;
  }

  public static async filtrarPorExtension(
    directorioRaiz: string,
    extensiones: readonly string[]
  ): Promise<readonly EntradaArchivo[]> {
    const todos = await this.obtenerSnapshot(directorioRaiz);
    const setExt = new Set(extensiones.map((e) => (e.startsWith('.') ? e.toLowerCase() : '.' + e.toLowerCase())));
    return todos.filter((a) => setExt.has(a.extension));
  }
}
