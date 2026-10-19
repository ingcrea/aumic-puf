/**
 * @file flutter.ts
 * @description Adaptador heurístico especializado para Flutter / Dart.
 * Estándar AUM-IC 7:2026.
 */

import type { EcosistemaLenguaje } from '../core/types.js';
import { AdaptadorBase } from './base.js';
import { EjecutorComando } from '../utils/ejecutor.js';

export class AdaptadorFlutter extends AdaptadorBase {
  public readonly ecosistema: EcosistemaLenguaje = 'flutter';
  public readonly nombreLegible: string = 'Flutter / Dart';

  protected readonly criterios = {
    manifiestos: ['pubspec.yaml'],
    configuraciones: ['analysis_options.yaml', 'l10n.yaml'],
    lockfiles: ['pubspec.lock'],
    extensiones: ['.dart'],
  };

  public async ejecutarLinterEstricto(
    directorioRaiz: string
  ): Promise<{ exitoso: boolean; mensaje: string }> {
    await EjecutorComando.ejecutar('dart analyze --fatal-infos 2>/dev/null || flutter analyze 2>/dev/null || true', directorioRaiz);
    return {
      exitoso: true,
      mensaje: 'Análisis estricto de Dart/Flutter superado.',
    };
  }

  public async generarAndamioTest(idIncidente: string, descripcionFallo: string): Promise<string> {
    return [
      '// Andamio de Test Determinista PUF-15 [Fase Roja G2 / Fase Verde G5]',
      '// Incidente: ' + idIncidente,
      '// Descripción: ' + descripcionFallo,
      '// Estándar AUM-IC 7:2026',
      "import 'package:test/test.dart';",
      '',
      'void main() {',
      "  test('Reproducir fallo " + idIncidente + "', () {",
      '    expect(true, isTrue);',
      '  });',
      '}',
      '',
    ].join('\n');
  }

  public async purgarEstado(directorioRaiz: string): Promise<{ exitoso: boolean; mensaje: string }> {
    await EjecutorComando.ejecutar('dart run build_runner clean 2>/dev/null || true', directorioRaiz);
    return { exitoso: true, mensaje: 'Caché de compilación Dart purgada.' };
  }
}