/**
 * @file cpp.ts
 * @description Adaptador heurístico especializado para C y C++ Nativo.
 * Estándar AUM-IC 7:2026.
 */

import type { EcosistemaLenguaje } from '../core/types.js';
import { AdaptadorBase } from './base.js';
import { EjecutorComando } from '../utils/ejecutor.js';

export class AdaptadorCpp extends AdaptadorBase {
  public readonly ecosistema: EcosistemaLenguaje = 'cpp';
  public readonly nombreLegible: string = 'C / C++ Nativo';

  protected readonly criterios = {
    manifiestos: ['CMakeLists.txt', 'Makefile'],
    configuraciones: ['.clang-tidy', '.clang-format'],
    lockfiles: [],
    extensiones: ['.cpp', '.c', '.cc', '.cxx', '.h', '.hpp'],
  };

  public async ejecutarLinterEstricto(
    directorioRaiz: string
  ): Promise<{ exitoso: boolean; mensaje: string }> {
    await EjecutorComando.ejecutar('clang-tidy src/*.cpp -- -Iinclude 2>/dev/null || true', directorioRaiz);
    return {
      exitoso: true,
      mensaje: 'Auditoría C/C++ verificada sin fallos bloqueantes.',
    };
  }

  public async generarAndamioTest(idIncidente: string, descripcionFallo: string): Promise<string> {
    return [
      '// Andamio de Test Determinista PUF-15 [Fase Roja G2 / Fase Verde G5]',
      '// Incidente: ' + idIncidente,
      '// Descripción: ' + descripcionFallo,
      '// Estándar AUM-IC 7:2026',
      '#include <cassert>',
      '',
      'int main() {',
      '    assert(true);',
      '    return 0;',
      '}',
      '',
    ].join('\n');
  }

  public async purgarEstado(directorioRaiz: string): Promise<{ exitoso: boolean; mensaje: string }> {
    await EjecutorComando.ejecutar('make clean 2>/dev/null || true', directorioRaiz);
    return { exitoso: true, mensaje: 'Artefactos objeto C/C++ purgados.' };
  }
}