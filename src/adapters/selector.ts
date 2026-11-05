/**
 * @file selector.ts
 * @description Registro y motor de puntuación heurística de confianza para detección agnóstica de ecosistemas.
 * Matriz Multi-Lenguaje Universal — Estándar AUM-IC 7:2026.
 */

import type { AdaptadorLenguaje, ContextoDeteccion, EcosistemaLenguaje } from '../core/types.js';
import { AdaptadorRust } from './rust.js';
import { AdaptadorNextJs } from './nextjs.js';
import { AdaptadorAstro } from './astro.js';
import { AdaptadorTypeScript } from './typescript.js';
import { AdaptadorJava } from './java.js';
import { AdaptadorCSharp } from './csharp.js';
import { AdaptadorFlutter } from './flutter.js';
import { AdaptadorCpp } from './cpp.js';
import { AdaptadorSwift } from './swift.js';
import { AdaptadorPython } from './python.js';
import { AdaptadorPHP } from './php.js';
import { AdaptadorShell } from './shell.js';

export class SelectorAdaptador {
  private static readonly adaptadores: readonly AdaptadorLenguaje[] = [
    new AdaptadorRust(),
    new AdaptadorNextJs(),
    new AdaptadorAstro(),
    new AdaptadorTypeScript(),
    new AdaptadorJava(),
    new AdaptadorCSharp(),
    new AdaptadorFlutter(),
    new AdaptadorCpp(),
    new AdaptadorSwift(),
    new AdaptadorPython(),
    new AdaptadorPHP(),
    new AdaptadorShell(),
  ];

  /**
   * Resuelve el adaptador correspondiente utilizando el Motor de Puntuación Heurística
   */
  public static async resolver(
    directorioRaiz: string,
    preferencia?: EcosistemaLenguaje,
    archivosAfectados?: readonly string[]
  ): Promise<AdaptadorLenguaje> {
    if (preferencia && preferencia !== 'desconocido') {
      const coincidencia = this.adaptadores.find((a) => a.ecosistema === preferencia);
      if (coincidencia) return coincidencia;
    }

    const contexto: ContextoDeteccion = {
      directorioRaiz,
      archivosAfectados,
    };

    // Evaluar puntuación heurística de todos los adaptadores concurrentemente
    const puntuaciones = await Promise.all(
      this.adaptadores.map(async (adaptador) => {
        const puntaje = await adaptador.calcularPuntaje(contexto);
        return { adaptador, puntaje };
      })
    );

    // Ordenar de mayor a menor puntuación
    puntuaciones.sort((a, b) => b.puntaje - a.puntaje);

    const mejor = puntuaciones[0];
    if (mejor && mejor.puntaje > 0) {
      return mejor.adaptador;
    }

    // Fallback universal: TypeScript
    return new AdaptadorTypeScript();
  }
}