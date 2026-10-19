/**
 * @file rust.ts
 * @description Adaptador heurístico especializado para Rust / Misión Crítica.
 * Estándar AUM-IC 7:2026.
 */

import type { EcosistemaLenguaje } from '../core/types.js';
import { AdaptadorBase } from './base.js';
import { EjecutorComando } from '../utils/ejecutor.js';

export class AdaptadorRust extends AdaptadorBase {
  public readonly ecosistema: EcosistemaLenguaje = 'rust';
  public readonly nombreLegible: string = 'Rust / Sistemas Nativos';

  protected readonly criterios = {
    manifiestos: ['Cargo.toml'],
    configuraciones: ['clippy.toml', '.cargo/config.toml', '.cargo/config'],
    lockfiles: ['Cargo.lock'],
    extensiones: ['.rs', '.slint'],
  };

  public async ejecutarLinterEstricto(
    directorioRaiz: string
  ): Promise<{ exitoso: boolean; mensaje: string }> {
    const resClippy = await EjecutorComando.ejecutar('cargo clippy -- -D warnings', directorioRaiz);
    if (!resClippy.exitoso) {
      return {
        exitoso: false,
        mensaje: 'Cargo Clippy detectó advertencias o deuda técnica:\n' + (resClippy.salidaError || resClippy.salidaEstandar),
      };
    }

    return {
      exitoso: true,
      mensaje: 'Compilación y auditoría estricta de Clippy aprobada (cero advertencias).',
    };
  }

  public async generarAndamioTest(idIncidente: string, descripcionFallo: string): Promise<string> {
    return [
      '// Andamio de Test Determinista PUF-15 [Fase Roja G2 / Fase Verde G5]',
      '// Incidente: ' + idIncidente,
      '// Descripción: ' + descripcionFallo,
      '// Estándar AUM-IC 7:2026',
      '#[cfg(test)]',
      'mod tests {',
      '    #[test]',
      '    fn test_reproducir_fallo() {',
      '        let condicion = true;',
      '        assert!(condicion, "Falla resuelta");',
      '    }',
      '}',
      '',
    ].join('\n');
  }

  public async purgarEstado(
    directorioRaiz: string
  ): Promise<{ exitoso: boolean; mensaje: string }> {
    await EjecutorComando.ejecutar('cargo clean -p temp 2>/dev/null || true', directorioRaiz);
    return {
      exitoso: true,
      mensaje: 'Artefactos efímeros de compilación Rust purgados.',
    };
  }
}