/**
 * @file certificado.ts
 * @description Generador estricto en español del Certificado de Aprobacion de Compuertas de Calidad (PUF-15).
 * Estandar AUM-IC 7:2026.
 */

import type { RegistroCompuerta, ResultadoAuditoria } from './types.js';

export class GeneradorCertificado {
  /**
   * Genera el bloque markdown oficial del Certificado de Calidad PUF-15
   */
  public static generar(resultado: ResultadoAuditoria): string {
    const estadoGlobal = resultado.todasAprobadas
      ? 'APROBADO (100% CUMPLIMIENTO)'
      : 'RECHAZADO (COMPUERTAS FALLIDAS)';

    const filasCompuertas = resultado.compuertas
      .map((c) => {
        const icono = c.estado === 'aprobada' ? '[x]' : c.estado === 'omitida' ? '[~]' : '[ ]';
        const estadoTexto = c.estado.toUpperCase();
        return `- ${icono} **${c.id}: ${c.nombre}** — *${estadoTexto}*\n  - **Detalle:** ${c.detalle}\n  - **Evidencia:** \`${c.evidencia}\` (${c.tiempoEjecucionMs}ms)`;
      })
      .join('\n');

    return [
      `# Certificado de Calidad PUF-15 — AUM-IC 7:2026`,
      `**Estado Global:** \`${estadoGlobal}\``,
      `**ID de Incidente:** \`${resultado.idIncidente}\``,
      `**Ecosistema Detectado:** \`${resultado.lenguajeDetectado.toUpperCase()}\``,
      `**Fecha de Registro:** \`${resultado.fechaRegistro}\``,
      '',
      `## Matriz de 15 Compuertas de Calidad Evaluadas`,
      filasCompuertas,
      '',
      `---`,
      `*Certificado emitido bajo el Paradigma de Excelencia Tecnica y Cero Deuda de Ingenieria Creativa.*`,
    ].join('\n');
  }

  /**
   * Formatea un registro de compuerta individual para salida de consola en alta densidad
   */
  public static formatearConsola(registro: RegistroCompuerta): string {
    const simbolo = registro.estado === 'aprobada' ? '✓' : registro.estado === 'omitida' ? '~' : '✗';
    return `[${registro.id}] ${simbolo} ${registro.nombre}: ${registro.detalle} (${registro.tiempoEjecucionMs}ms)`;
  }
}
