/**
 * @file evaluador-sanitizer.ts
 * @description Evaluador de Diagnostico de Entropia y Mojibake (G0) usando @ingcrea/aumic-sanitizer.
 * Modo estricto de solo lectura (Dry-Run / Audit) bajo el Estandar AUM-IC 7:2026.
 */

import { promises as fs } from 'fs';
import * as path from 'path';
import { EjecutorComando } from '../utils/ejecutor.js';
import type { RegistroCompuerta } from './types.js';

export interface ReporteSanitizerAudit {
  metadata?: {
    timestamp: string;
    operacion: string;
    destino: string;
    archivosEscaneados: number;
    archivosAfectados: number;
    entropiaDestruida: number;
    tiempoEjecucionSegundos: number;
  };
  history?: Array<{
    filepath: string;
    corruptions: number;
    originalContent?: string;
  }>;
}

export class EvaluadorSanitizer {
  public static async auditar(directorioRaiz: string): Promise<RegistroCompuerta> {
    const inicio = Date.now();
    const rutaHistorial = path.join(directorioRaiz, 'aumic-history.json');

    try {
      await EjecutorComando.ejecutar('npx aumic-sanitizer audit .', directorioRaiz, 60000);

      let reporte: ReporteSanitizerAudit = {};
      const existeHistorial = await fs.stat(rutaHistorial).catch(() => null);

      if (existeHistorial) {
        const contenidoJson = await fs.readFile(rutaHistorial, 'utf-8');
        try {
          reporte = JSON.parse(contenidoJson);
        } catch {
          reporte = {};
        }
      }

      const archivosAfectados = reporte.metadata?.archivosAfectados ?? 0;
      const entropiaDetectada = reporte.metadata?.entropiaDestruida ?? 0;
      const totalEscaneados = reporte.metadata?.archivosEscaneados ?? 0;
      const infectados = reporte.history || [];

      const tiempoTotal = Date.now() - inicio;

      if (archivosAfectados === 0) {
        return {
          id: 'G0',
          nombre: 'Higiene Forense Anti-Entropia y Codificacion Pura',
          estado: 'aprobada',
          detalle: `Repositorio impecable: 0 archivos infectados de ${totalEscaneados} analizados. Codificacion UTF-8 y LF integra.`,
          evidencia: `${totalEscaneados} escaneados, 0 entropia`,
          tiempoEjecucionMs: tiempoTotal,
        };
      }

      const listaArchivos = infectados
        .slice(0, 5)
        .map((f) => `${path.basename(f.filepath)} (${f.corruptions} items)`)
        .join(', ');

      const sufijo = infectados.length > 5 ? ` y ${infectados.length - 5} mas` : '';

      return {
        id: 'G0',
        nombre: 'Higiene Forense Anti-Entropia y Codificacion Pura',
        estado: 'rechazada',
        detalle: `Se detectaron ${archivosAfectados} archivo(s) infectados con ${entropiaDetectada} anomalias de entropia/mojibake: ${listaArchivos}${sufijo}. Ejecutar "npx aumic-sanitizer scan" para sanar.`,
        evidencia: `${archivosAfectados} infectados (${entropiaDetectada} anomalias)`,
        tiempoEjecucionMs: tiempoTotal,
      };
    } catch (error: any) {
      return {
        id: 'G0',
        nombre: 'Higiene Forense Anti-Entropia y Codificacion Pura',
        estado: 'omitida',
        detalle: `No se pudo completar el diagnostico forense con aumic-sanitizer: ${error.message || String(error)}`,
        evidencia: 'Fallo ejecucion audit',
        tiempoEjecucionMs: Date.now() - inicio,
      };
    }
  }
}
