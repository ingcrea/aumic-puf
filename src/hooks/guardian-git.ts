/**
 * @file guardian-git.ts
 * @description Guardian Forense Git Hook para pre-commit / pre-push.
 * Intercepta y bloquea commits que violen la integridad de PUF-15.
 * Estandar AUM-IC 7:2026.
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { LinterCssInline } from '../core/linter-inline-css.js';
import { EjecutorComando } from '../utils/ejecutor.js';

export class GuardianGitHook {
  /**
   * Instala los interceptores pre-commit en .git/hooks
   */
  public static async instalar(directorioRaiz: string): Promise<{ exitoso: boolean; mensaje: string }> {
    const carpetaHooks = path.join(directorioRaiz, '.git', 'hooks');
    const existeGit = await fs.stat(carpetaHooks).catch(() => null);

    if (!existeGit) {
      return {
        exitoso: false,
        mensaje: 'No se detecto un repositorio Git valido en el directorio especificado.',
      };
    }

    const scriptHook = [
      '#!/usr/bin/env bash',
      '# Interceptor Forense PUF-15 (AUM-IC 7:2026)',
      '# Bloquea commits con estilos inline, falta de registro ADR, rutas rotas o handlers inertes',
      'set -e',
      '',
      'echo "[PUF-15 GUARD]: Ejecutando verificacion de compuertas pre-commit..."',
      'npx aumic-puf guard || puf guard',
      '',
    ].join('\n');

    const rutaPreCommit = path.join(carpetaHooks, 'pre-commit');
    await fs.writeFile(rutaPreCommit, scriptHook, { mode: 0o755 });

    return {
      exitoso: true,
      mensaje: 'Interceptor pre-commit de PUF-15 instalado con permisos de ejecucion (0755).',
    };
  }

  /**
   * Verifica los archivos en el staged area de git antes de permitir la confirmacion
   */
  public static async verificarStaged(
    directorioRaiz: string
  ): Promise<{ exitoso: boolean; errores: readonly string[] }> {
    const errores: string[] = [];

    const resGit = await EjecutorComando.ejecutar(
      'git diff --cached --name-only --diff-filter=ACM',
      directorioRaiz
    );

    if (!resGit.exitoso || !resGit.salidaEstandar) {
      return { exitoso: true, errores: [] };
    }

    const archivosStaged = resGit.salidaEstandar
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    // G4: CSS inline
    const violacionesCss = await LinterCssInline.auditar(archivosStaged, directorioRaiz);
    if (violacionesCss.length > 0) {
      errores.push(
        `[COMPUERTA G4 VIOLADA]: Se encontraron ${violacionesCss.length} atributos 'style="..."' inline en archivos staged:\n` +
          violacionesCss
            .map((v) => `  - ${v.rutaArchivo}:${v.numeroLinea} -> ${v.contenidoLinea}`)
            .join('\n')
      );
    }

    // G7: BITACORA.md actualizado si hay cambios de logica
    const tieneArchivosLogica = archivosStaged.some(
      (a) => a.endsWith('.php') || a.endsWith('.py') || a.endsWith('.ts') || a.endsWith('.rs') || a.endsWith('.astro')
    );
    const bitacoraModificada = archivosStaged.some((a) => a.includes('BITACORA.md'));

    if (tieneArchivosLogica && !bitacoraModificada) {
      errores.push(
        `[COMPUERTA G7 VIOLADA]: Modificaste archivos de logica pero no incluiste la actualizacion de 'BITACORA.md' en este commit.`
      );
    }

    return {
      exitoso: errores.length === 0,
      errores,
    };
  }
}
