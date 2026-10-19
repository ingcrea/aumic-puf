/**
 * @file ejecutor.ts
 * @description Motor de ejecución segura de comandos de terminal POSIX con límites estrictos.
 * Estándar AUM-IC 7:2026.
 */

import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execPromesa = promisify(exec);

export interface ResultadoComando {
  readonly exitoso: boolean;
  readonly codigoSalida: number;
  readonly salidaEstandar: string;
  readonly salidaError: string;
  readonly duracionMs: number;
}

export class EjecutorComando {
  /**
   * Ejecuta un comando en shell con captura de salida y temporizador
   */
  public static async ejecutar(
    comando: string,
    directorioTrabajo: string,
    tiempoLimiteMs: number = 30000
  ): Promise<ResultadoComando> {
    const inicio = Date.now();
    try {
      const { stdout, stderr } = await execPromesa(comando, {
        cwd: directorioTrabajo,
        timeout: tiempoLimiteMs,
        maxBuffer: 10 * 1024 * 1024,
      });

      return {
        exitoso: true,
        codigoSalida: 0,
        salidaEstandar: stdout.trim(),
        salidaError: stderr.trim(),
        duracionMs: Date.now() - inicio,
      };
    } catch (error: any) {
      return {
        exitoso: false,
        codigoSalida: typeof error?.code === 'number' ? error.code : 1,
        salidaEstandar: (error?.stdout || '').toString().trim(),
        salidaError: (error?.stderr || error?.message || '').toString().trim(),
        duracionMs: Date.now() - inicio,
      };
    }
  }
}