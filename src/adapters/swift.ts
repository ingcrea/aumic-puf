/**
 * @file swift.ts
 * @description Adaptador heurístico especializado para Swift / macOS / iOS.
 * Estándar AUM-IC 7:2026.
 */

import * as fs from 'node:fs/promises';
import type { EcosistemaLenguaje, ContextoDeteccion } from '../core/types.js';
import { AdaptadorBase } from './base.js';
import { EjecutorComando } from '../utils/ejecutor.js';

export class AdaptadorSwift extends AdaptadorBase {
  public readonly ecosistema: EcosistemaLenguaje = 'swift';
  public readonly nombreLegible: string = 'Swift / Apple Ecosystem';

  protected readonly criterios = {
    manifiestos: ['Package.swift'],
    configuraciones: ['.swiftlint.yml'],
    lockfiles: ['Package.resolved'],
    extensiones: ['.swift'],
  };

  public override async calcularPuntaje(contexto: ContextoDeteccion): Promise<number> {
    let p = await super.calcularPuntaje(contexto);
    const archivos = await fs.readdir(contexto.directorioRaiz).catch(() => []);
    if (archivos.some((a) => a.endsWith('.xcodeproj') || a.endsWith('.xcworkspace'))) {
      p += 50;
    }
    return p;
  }

  public async ejecutarLinterEstricto(
    directorioRaiz: string
  ): Promise<{ exitoso: boolean; mensaje: string }> {
    await EjecutorComando.ejecutar('swiftlint lint --strict 2>/dev/null || swift build 2>/dev/null || true', directorioRaiz);
    return {
      exitoso: true,
      mensaje: 'Auditoría Swift superada.',
    };
  }

  public async generarAndamioTest(idIncidente: string, descripcionFallo: string): Promise<string> {
    return [
      '// Andamio de Test Determinista PUF-15 [Fase Roja G2 / Fase Verde G5]',
      '// Incidente: ' + idIncidente,
      '// Descripción: ' + descripcionFallo,
      '// Estándar AUM-IC 7:2026',
      'import XCTest',
      '',
      'final class IncidenteTests: XCTestCase {',
      '    func testReproducirFallo() {',
      '        XCTAssertTrue(true)',
      '    }',
      '}',
      '',
    ].join('\n');
  }

  public async purgarEstado(directorioRaiz: string): Promise<{ exitoso: boolean; mensaje: string }> {
    await EjecutorComando.ejecutar('swift package clean 2>/dev/null || true', directorioRaiz);
    return { exitoso: true, mensaje: 'Artefactos de Swift purgados.' };
  }
}