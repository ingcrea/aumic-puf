/**
 * @file interfaz.ts
 * @description Interfaz interactiva de consola para PUF-15 con colores ANSI y telemetria visual.
 * Estandar AUM-IC 7:2026.
 */

import type { RegistroCompuerta, ResultadoAuditoria } from '../core/types.js';

export class InterfazConsola {
  private static readonly RESET  = '\x1b[0m';
  private static readonly BOLD   = '\x1b[1m';
  private static readonly VERDE  = '\x1b[32m';
  private static readonly ROJO   = '\x1b[31m';
  private static readonly AMARILLO = '\x1b[33m';
  private static readonly CIAN   = '\x1b[36m';
  private static readonly GRIS   = '\x1b[90m';
  private static readonly MAGENTA = '\x1b[35m';

  public static mostrarBanner(): void {
    console.log(
      '\n' +
      this.CIAN + this.BOLD + '========================================================================\n' +
      '   PROTOCOLO UNIVERSAL CONTRA FALLOS (PUF-15) — AUM-IC 7:2026\n' +
      '   Matriz Multi-Lenguaje Universal | 15 Compuertas de Calidad\n' +
      '========================================================================' + this.RESET + '\n'
    );
  }

  public static renderizarInicioAuditoria(idIncidente: string, failFast: boolean): void {
    console.log(this.CIAN + '⚡ Evaluando Matriz Concurrente PUF-15 (G1 a G15)' + this.RESET);
    console.log(this.GRIS + '   Incidente:' + this.RESET + ' ' + this.BOLD + idIncidente + this.RESET);
    const modoTexto = failFast
      ? this.AMARILLO + 'Fail-Fast (Aborta al primer fallo)' + this.RESET
      : this.VERDE + 'Auditoria Exhaustiva Concurrente (15 Gates)' + this.RESET;
    console.log(this.GRIS + '   Modo:' + this.RESET + ' ' + modoTexto);
    console.log(this.GRIS + '------------------------------------------------------------------------' + this.RESET);
  }

  public static renderizarCompuerta(compuerta: RegistroCompuerta): void {
    const esAprobada = compuerta.estado === 'aprobada';
    const esOmitida  = compuerta.estado === 'omitida';
    const icono = esAprobada
      ? this.VERDE   + '✔ [APROBADA]' + this.RESET
      : esOmitida
        ? this.MAGENTA + '~ [OMITIDA]  ' + this.RESET
        : this.ROJO    + '✖ [RECHAZADA]' + this.RESET;

    const id     = this.BOLD + compuerta.id.padEnd(4) + this.RESET;
    const tiempo = this.GRIS + '(' + compuerta.tiempoEjecucionMs + 'ms)' + this.RESET;

    console.log(' ' + icono + ' ' + id + ' ' + compuerta.nombre + ' ' + tiempo);
    if (!esAprobada && !esOmitida) {
      console.log('   ' + this.ROJO + '↳ Detalle: ' + compuerta.detalle + this.RESET);
      console.log('   ' + this.ROJO + '↳ Evidencia: ' + compuerta.evidencia + this.RESET);
    }
    if (esOmitida) {
      console.log('   ' + this.MAGENTA + '↳ ' + compuerta.detalle + this.RESET);
    }
  }

  public static renderizarResultado(resultado: ResultadoAuditoria): void {
    console.log(this.GRIS + '------------------------------------------------------------------------' + this.RESET);
    if (resultado.todasAprobadas) {
      console.log(
        '\n' + this.VERDE + this.BOLD + '✔ CERTIFICACION PUF-15 APROBADA (100% CUMPLIMIENTO)' + this.RESET + '\n' +
        this.VERDE + '  Ecosistema: ' + resultado.lenguajeDetectado.toUpperCase() + ' | Codigo blindado y apto para produccion.' + this.RESET + '\n'
      );
    } else {
      console.log(
        '\n' + this.ROJO + this.BOLD + '✖ AUDITORIA DENEGADA (COMPUERTAS FALLIDAS)' + this.RESET + '\n' +
        this.ROJO + '  Se requiere subsanar las desviaciones detectadas antes de proceder.' + this.RESET + '\n'
      );
    }
    console.log(resultado.reporteMarkdown);
  }
}
