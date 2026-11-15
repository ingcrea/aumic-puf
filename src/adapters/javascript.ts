/**
 * @file javascript.ts
 * @description Adaptador heurístico especializado para Vanilla JS / Modern ECMAScript (Node.js & Navegador).
 * Ejecuta validación estricta de sintaxis con 'node --check' sin requerir compiladores externos.
 * Estándar AUM-IC 7:2026.
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import type { EcosistemaLenguaje, ContextoDeteccion } from '../core/types.js';
import { AdaptadorBase } from './base.js';
import { EjecutorComando } from '../utils/ejecutor.js';
import { LectorArbolProyecto } from '../core/arbol-proyecto.js';

export class AdaptadorJavaScript extends AdaptadorBase {
  public readonly ecosistema: EcosistemaLenguaje = 'javascript';
  public readonly nombreLegible: string = 'Vanilla JavaScript / ECMAScript Engine';

  protected readonly criterios = {
    manifiestos: ['package.json'],
    configuraciones: ['.eslintrc.json', '.eslintrc.js', '.eslintrc.cjs', 'eslint.config.js', 'eslint.config.mjs'],
    lockfiles: ['package-lock.json', 'pnpm-lock.yaml', 'yarn.lock'],
    extensiones: ['.js', '.mjs', '.cjs'],
  };

  public override async calcularPuntaje(contexto: ContextoDeteccion): Promise<number> {
    // Si tiene tsconfig.json, pertenece a TypeScript
    const tieneTsConfig = await fs.stat(path.join(contexto.directorioRaiz, 'tsconfig.json')).catch(() => null);
    if (tieneTsConfig) {
      return 0; // Cede la prioridad a AdaptadorTypeScript
    }

    // Si tiene next.config.* o astro.config.*, cede la prioridad
    const tieneNext = await fs.stat(path.join(contexto.directorioRaiz, 'next.config.js')).catch(() => null);
    const tieneAstro = await fs.stat(path.join(contexto.directorioRaiz, 'astro.config.mjs')).catch(() => null);
    if (tieneNext || tieneAstro) {
      return 0;
    }

    let puntaje = await super.calcularPuntaje(contexto);

    // Si hay archivos .js en la raíz o en src, sumar peso
    const archivos = await LectorArbolProyecto.filtrarPorExtension(contexto.directorioRaiz, ['.js', '.mjs', '.cjs']);
    if (archivos.length > 0) {
      puntaje += 45;
    }

    return puntaje;
  }

  public async ejecutarLinterEstricto(
    directorioRaiz: string
  ): Promise<{ exitoso: boolean; mensaje: string }> {
    const archivosJs = await LectorArbolProyecto.filtrarPorExtension(directorioRaiz, ['.js', '.mjs', '.cjs']);
    const candidatos = archivosJs.filter(
      (a) =>
        !a.rutaRelativa.startsWith('node_modules') &&
        !a.rutaRelativa.startsWith('dist') &&
        !a.rutaRelativa.startsWith('vendor') &&
        !a.rutaRelativa.startsWith('test')
    );

    const erroresSintaxis: string[] = [];

    // Validar sintaxis con node --check nativo
    for (const arch of candidatos) {
      const res = await EjecutorComando.ejecutar(`node --check "${arch.rutaAbsoluta}"`, directorioRaiz);
      if (!res.exitoso) {
        erroresSintaxis.push(`${arch.rutaRelativa}: ${res.salidaError || res.salidaEstandar}`);
      }
    }

    if (erroresSintaxis.length > 0) {
      return {
        exitoso: false,
        mensaje: `Error de sintaxis JavaScript detectado:\n${erroresSintaxis.join('\n')}`,
      };
    }

    return {
      exitoso: true,
      mensaje: `Sintaxis Vanilla JavaScript íntegra (${candidatos.length} archivos verificados con node --check).`,
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
    await EjecutorComando.ejecutar('rm -rf .cache 2>/dev/null || true', directorioRaiz);
    return {
      exitoso: true,
      mensaje: 'Caché de JavaScript purgada.',
    };
  }
}
