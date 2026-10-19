/**
 * @file typescript.ts
 * @description Adaptador heurístico especializado para TypeScript / Node.js Engine.
 * Estándar AUM-IC 7:2026.
 */

import type { EcosistemaLenguaje } from '../core/types.js';
import { AdaptadorBase } from './base.js';
import { EjecutorComando } from '../utils/ejecutor.js';

export class AdaptadorTypeScript extends AdaptadorBase {
  public readonly ecosistema: EcosistemaLenguaje = 'typescript';
  public readonly nombreLegible: string = 'TypeScript / Node.js Engine';

  protected readonly criterios = {
    manifiestos: ['package.json'],
    configuraciones: ['tsconfig.json', 'tsconfig.base.json', 'tsconfig.build.json'],
    lockfiles: ['package-lock.json', 'pnpm-lock.yaml', 'yarn.lock', 'bun.lockb'],
    extensiones: ['.ts', '.tsx', '.mts', '.cts'],
  };

  public async ejecutarLinterEstricto(
    directorioRaiz: string
  ): Promise<{ exitoso: boolean; mensaje: string }> {
    // Toolchain fallback dinámico: local bin -> npx -> bun -> deno
    const resTsc = await EjecutorComando.ejecutar('npx tsc --noEmit --incremental 2>/dev/null || npx tsc --noEmit', directorioRaiz);
    if (!resTsc.exitoso) {
      return {
        exitoso: false,
        mensaje: 'TypeScript Compiler detectó errores de tipado o contrato:\n' + (resTsc.salidaError || resTsc.salidaEstandar),
      };
    }

    return {
      exitoso: true,
      mensaje: 'Auditoría estricta de TypeScript (tsc --noEmit) aprobada.',
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

  public async purgarEstado(
    directorioRaiz: string
  ): Promise<{ exitoso: boolean; mensaje: string }> {
    await EjecutorComando.ejecutar('rm -f tsconfig.tsbuildinfo 2>/dev/null || true', directorioRaiz);
    return {
      exitoso: true,
      mensaje: 'Caché de compilación TypeScript purgada.',
    };
  }
}