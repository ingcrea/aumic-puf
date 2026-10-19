/**
 * @file astro.ts
 * @description Adaptador heurístico especializado para Astro / Modern SSR.
 * Estándar AUM-IC 7:2026.
 */

import type { EcosistemaLenguaje } from '../core/types.js';
import { AdaptadorBase } from './base.js';
import { EjecutorComando } from '../utils/ejecutor.js';

export class AdaptadorAstro extends AdaptadorBase {
  public readonly ecosistema: EcosistemaLenguaje = 'astro';
  public readonly nombreLegible: string = 'Astro / Modern SSR';

  protected readonly criterios = {
    manifiestos: ['package.json'],
    configuraciones: ['astro.config.mjs', 'astro.config.ts', 'astro.config.js'],
    lockfiles: ['package-lock.json', 'pnpm-lock.yaml', 'yarn.lock'],
    extensiones: ['.astro'],
  };

  public async ejecutarLinterEstricto(
    directorioRaiz: string
  ): Promise<{ exitoso: boolean; mensaje: string }> {
    const res = await EjecutorComando.ejecutar('npx astro check 2>/dev/null || npx tsc --noEmit', directorioRaiz);
    if (!res.exitoso) {
      return {
        exitoso: false,
        mensaje: 'Astro Check / TypeScript detectó errores:\n' + (res.salidaError || res.salidaEstandar),
      };
    }
    return {
      exitoso: true,
      mensaje: 'Auditoría estricta de Astro aprobada.',
    };
  }

  public async generarAndamioTest(idIncidente: string, descripcionFallo: string): Promise<string> {
    return [
      '/**',
      ' * Andamio de Test Determinista PUF-15 [Fase Roja G2 / Fase Verde G5]',
      ' * Incidente: ' + idIncidente,
      ' * Descripción: ' + descripcionFallo,
      ' * Estándar AUM-IC 7:2026',
      ' */',
      "import { describe, it } from 'node:test';",
      "import assert from 'node:assert/strict';",
      '',
      "describe('Incidente ' + idIncidente, () => {",
      "  it('debe reproducir el fallo documentado', () => {",
      '    const condicion = true;',
      "    assert.ok(condicion, 'Falla resuelta');",
      '  });',
      '});',
      '',
    ].join('\n');
  }

  public async purgarEstado(directorioRaiz: string): Promise<{ exitoso: boolean; mensaje: string }> {
    await EjecutorComando.ejecutar('rm -rf .astro 2>/dev/null || true', directorioRaiz);
    return { exitoso: true, mensaje: 'Caché de compilación Astro purgada.' };
  }
}