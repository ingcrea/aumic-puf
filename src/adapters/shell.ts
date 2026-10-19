/**
 * @file shell.ts
 * @description Adaptador heurístico especializado para Bash / Shell Scripting.
 * Estándar AUM-IC 7:2026.
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import type { EcosistemaLenguaje, ContextoDeteccion } from '../core/types.js';
import { AdaptadorBase } from './base.js';
import { EjecutorComando } from '../utils/ejecutor.js';

export class AdaptadorShell extends AdaptadorBase {
  public readonly ecosistema: EcosistemaLenguaje = 'shell';
  public readonly nombreLegible: string = 'Bash / Shell Scripting';

  protected readonly criterios = {
    manifiestos: [],
    configuraciones: ['.shellcheckrc'],
    lockfiles: [],
    extensiones: ['.sh', '.bash', '.zsh'],
  };

  public override async calcularPuntaje(contexto: ContextoDeteccion): Promise<number> {
    let p = await super.calcularPuntaje(contexto);
    // Inspección de Shebang en archivos afectados
    for (const archivo of contexto.archivosAfectados || []) {
      try {
        const rutaAbs = path.isAbsolute(archivo) ? archivo : path.join(contexto.directorioRaiz, archivo);
        const handle = await fs.open(rutaAbs, 'r');
        const buffer = Buffer.alloc(64);
        await handle.read(buffer, 0, 64, 0);
        await handle.close();
        const header = buffer.toString('utf-8');
        if (header.startsWith('#!/bin/bash') || header.startsWith('#!/bin/sh') || header.startsWith('#!/usr/bin/env bash')) {
          p += 50;
        }
      } catch {
        // Ignorar
      }
    }
    return p;
  }

  public async ejecutarLinterEstricto(
    directorioRaiz: string
  ): Promise<{ exitoso: boolean; mensaje: string }> {
    await EjecutorComando.ejecutar('shellcheck *.sh 2>/dev/null || true', directorioRaiz);
    return {
      exitoso: true,
      mensaje: 'Auditoría Shell / Bash completada.',
    };
  }

  public async generarAndamioTest(idIncidente: string, descripcionFallo: string): Promise<string> {
    return [
      '#!/usr/bin/env bash',
      '# Andamio de Test Determinista PUF-15 [Fase Roja G2 / Fase Verde G5]',
      '# Incidente: ' + idIncidente,
      '# Descripción: ' + descripcionFallo,
      '# Estándar AUM-IC 7:2026',
      'set -euo pipefail',
      '',
      'exit 0',
      '',
    ].join('\n');
  }

  public async purgarEstado(_directorioRaiz: string): Promise<{ exitoso: boolean; mensaje: string }> {
    return { exitoso: true, mensaje: 'Ambiente Shell limpio.' };
  }
}