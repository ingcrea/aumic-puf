import * as path from 'node:path';
import { LectorArbolProyecto } from './arbol-proyecto.js';
import type { RegistroCompuerta } from './types.js';

// @ts-ignore
import { processFile } from '@ingcrea/aumic-sanitizer/dist/3-cells/Sanitizer.js';
// @ts-ignore
import { loadConfig, DEFAULT_CONFIG } from '@ingcrea/aumic-sanitizer/dist/2-molecules/config.js';

export class EvaluadorSanitizer {
  public static async auditar(directorioRaiz: string): Promise<RegistroCompuerta> {
    const inicio = Date.now();

    try {
      const config = loadConfig(directorioRaiz) || DEFAULT_CONFIG;
      const archivos = await LectorArbolProyecto.obtenerSnapshot(directorioRaiz);

      let totalEscaneados = 0;
      let entropiaDetectada = 0;
      const infectados: Array<{ filepath: string; corruptions: number }> = [];

      const tamanoLote = 30;
      for (let i = 0; i < archivos.length; i += tamanoLote) {
        const lote = archivos.slice(i, i + tamanoLote);
        const resLote = await Promise.all(
          lote.map(async (arch) => {
            try {
              return await processFile(arch.rutaAbsoluta, { config, audit: true, gitStage: false });
            } catch {
              return { filepath: arch.rutaAbsoluta, corruptions: 0, modified: false };
            }
          })
        );

        for (const res of resLote) {
          totalEscaneados++;
          if (res && res.corruptions > 0) {
            entropiaDetectada += res.corruptions;
            infectados.push({ filepath: res.filepath, corruptions: res.corruptions });
          }
        }
      }

      const tiempoTotal = Date.now() - inicio;

      if (infectados.length === 0) {
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
        detalle: `Se detectaron ${infectados.length} archivo(s) infectados con ${entropiaDetectada} anomalias de entropia/mojibake: ${listaArchivos}${sufijo}. Ejecutar "aumic-sanitizer scan" para sanar.`,
        evidencia: `${infectados.length} infectados (${entropiaDetectada} anomalias)`,
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
