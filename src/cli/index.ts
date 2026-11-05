#!/usr/bin/env node
/**
 * @file index.ts
 * @description Punto de entrada CLI interactivo y concurrente para `puf` / `aumic-puf`.
 * Soporta selector de compuerta única (-g / --gate), generación de reporte HTML forense
 * e integración diagnóstica con aumic-sanitizer (G0).
 * Estándar AUM-IC 7:2026.
 */

import * as path from 'path';
import { OrquestadorPUF15 } from '../core/orquestador.js';
import { GuardianGitHook } from '../hooks/guardian-git.js';
import { GeneradorReporteHtml } from '../core/generador-reporte-html.js';
import { InterfazConsola } from './interfaz.js';
import { COMPUERTAS_POR_PERFIL, PerfilAuditoria } from '../core/types.js';

async function main(): Promise<void> {
  const argumentos = process.argv.slice(2);
  const comando = argumentos[0]?.toLowerCase();
  const directorioActual = process.env['PUF_TARGET_DIR'] || process.cwd();
  const orquestador = new OrquestadorPUF15(directorioActual);

  if (comando === '-v' || comando === '--version' || comando === 'version') {
    console.log('v3.0.0');
    return;
  }

  switch (comando) {
    case 'iniciar':
    case 'init': {
      const idIncidente = argumentos[1];
      const descripcion = argumentos[2] || 'Resolucion metodica de fallo bajo PUF-15';
      const archivos = argumentos.slice(3).filter((a): a is string => typeof a === 'string');

      if (!idIncidente) {
        console.error('Uso: puf iniciar <ID-INCIDENTE> [DESCRIPCION] [ARCHIVOS...]');
        process.exit(1);
      }

      InterfazConsola.mostrarBanner();
      console.log('[PUF-15]: Inicializando incidente ' + idIncidente + '...');
      const res = await orquestador.inicializarIncidente({
        idIncidente,
        descripcionFallo: descripcion,
        archivosAfectados: archivos,
      });

      console.log('✓ Andamio de test G2 generado: ' + res.rutaTest);
      console.log('✓ Checkpoints inmutables G3 creados: ' + res.respaldosCreados.length);
      res.respaldosCreados.forEach((r) => console.log('  - ' + r));
      break;
    }

    case 'auditar':
    case 'verificar':
    case 'audit':
    case 'verify': {
      const failFast = argumentos.includes('--fast') || argumentos.includes('--fail-fast');
      const sinReporte = argumentos.includes('--no-html');

      // Extracción de compuertas específicas con -g o --gate
      const compuertasAFiltrar: string[] = [];

      // Extraccion de perfil con --profile=<mvp|dev|security|enterprise>
      let perfilSeleccionado: PerfilAuditoria = 'enterprise';
      for (let i = 0; i < argumentos.length; i++) {
        const arg = argumentos[i];
        if (!arg) continue;
        const siguiente = argumentos[i + 1];
        if (arg === '--profile' && siguiente) {
          const val = siguiente.toLowerCase() as PerfilAuditoria;
          if (COMPUERTAS_POR_PERFIL[val]) perfilSeleccionado = val;
        } else if (arg.startsWith('--profile=')) {
          const partes = arg.split('=');
          const val = (partes[1] || '').toLowerCase() as PerfilAuditoria;
          if (COMPUERTAS_POR_PERFIL[val]) perfilSeleccionado = val;
        }
      }

      if (perfilSeleccionado !== 'enterprise') {
        compuertasAFiltrar.push(...COMPUERTAS_POR_PERFIL[perfilSeleccionado]);
      }
      const flagsCompuerta = ['-g', '--gate', '--compuerta'];
      
      for (let i = 0; i < argumentos.length; i++) {
        const arg = argumentos[i];
        if (!arg) continue;
        const siguiente = argumentos[i + 1];

        if (flagsCompuerta.includes(arg) && siguiente) {
          siguiente.split(',').forEach((c) => {
            const normalizada = c.trim().toUpperCase();
            if (normalizada) {
              compuertasAFiltrar.push(normalizada.startsWith('G') ? normalizada : `G${normalizada}`);
            }
          });
        } else if (arg.startsWith('--gate=') || arg.startsWith('-g=') || arg.startsWith('--compuerta=')) {
          const partes = arg.split('=');
          const valor = partes[1] || '';
          valor.split(',').forEach((c) => {
            const normalizada = c.trim().toUpperCase();
            if (normalizada) {
              compuertasAFiltrar.push(normalizada.startsWith('G') ? normalizada : `G${normalizada}`);
            }
          });
        }
      }

      // Parsea ruta de reporte HTML si se especifica con --html o --reporte
      let rutaReportePersonalizada: string | undefined;
      for (let i = 0; i < argumentos.length; i++) {
        const arg = argumentos[i];
        if (!arg) continue;
        const siguiente = argumentos[i + 1];

        if ((arg === '--html' || arg === '--reporte') && siguiente) {
          rutaReportePersonalizada = siguiente;
        } else if (arg.startsWith('--html=') || arg.startsWith('--reporte=')) {
          rutaReportePersonalizada = arg.split('=')[1];
        }
      }

      // Filtra banderas para obtener idIncidente y archivos
      const argumentosLimpios = argumentos.filter((a, idx) => {
        if (!a) return false;
        const previo = idx > 0 ? argumentos[idx - 1] : undefined;

        if (flagsCompuerta.includes(a)) return false;
        if (previo && flagsCompuerta.includes(previo)) return false;
        if (a.startsWith('--gate=') || a.startsWith('-g=') || a.startsWith('--compuerta=')) return false;
        if (a === '--html' || a === '--reporte') return false;
        if (previo && (previo === '--html' || previo === '--reporte')) return false;
        if (a.startsWith('--html=') || a.startsWith('--reporte=')) return false;
        if (a === '--fast' || a === '--fail-fast' || a === '--no-html') return false;
        return true;
      });

      const idIncidente = argumentosLimpios[1] || 'AUDITORIA_ACTIVA';
      const archivos = argumentosLimpios.slice(2).filter((a): a is string => typeof a === 'string');

      InterfazConsola.mostrarBanner();
      InterfazConsola.renderizarInicioAuditoria(
        idIncidente,
        failFast,
        compuertasAFiltrar.length > 0 ? compuertasAFiltrar.length : undefined
      );

      if (compuertasAFiltrar.length > 0) {
        console.log(`\x1b[36m⚡ Alcance Focalizado:\x1b[0m Evaluando únicamente ${compuertasAFiltrar.join(', ')}\n`);
      }

      const resultado = await orquestador.auditar(idIncidente, archivos, [], {
        failFast,
        compuertasAFiltrar: compuertasAFiltrar.length > 0 ? compuertasAFiltrar : undefined,
        onProgreso: (compuerta) => {
          InterfazConsola.renderizarCompuerta(compuerta);
        },
      });

      InterfazConsola.renderizarResultado(resultado);

      // Generación automática del reporte HTML forense salvo que se use --no-html
      if (!sinReporte) {
        try {
          const rutaHtml = rutaReportePersonalizada || path.join(directorioActual, 'puf-report.html');
          const rutaGenerada = await GeneradorReporteHtml.generar(resultado, rutaHtml);
          console.log(`\x1b[32m✔ [REPORTE FORENSE HTML GENERADO]:\x1b[0m ${rutaGenerada}\n`);
        } catch (error: any) {
          console.warn(`\x1b[33m⚠ [AVISO REPORTE HTML]:\x1b[0m No se pudo escribir el reporte HTML: ${error.message}\n`);
        }
      }

      if (!resultado.todasAprobadas) {
        process.exit(1);
      }
      break;
    }

    case 'revertir':
    case 'rollback': {
      const idIncidente = argumentos[1];
      const nombreArchivo = argumentos[2];

      if (!idIncidente || !nombreArchivo) {
        console.error('Uso: puf revertir <ID-INCIDENTE> <NOMBRE-ARCHIVO>');
        process.exit(1);
      }

      InterfazConsola.mostrarBanner();
      console.log('[PUF-15]: Solicitando reversion atomica G3...');
      const resRollback = await orquestador.revertir(idIncidente, nombreArchivo);
      if (!resRollback.exitoso) {
        console.error('✗ ' + resRollback.mensaje);
        process.exit(1);
      }
      console.log('✓ ' + resRollback.mensaje);
      break;
    }

    case 'hook':
    case 'instalar-hook': {
      InterfazConsola.mostrarBanner();
      console.log('[PUF-15]: Instalando interceptor forense Git...');
      const resHook = await GuardianGitHook.instalar(directorioActual);
      if (!resHook.exitoso) {
        console.error('✗ ' + resHook.mensaje);
        process.exit(1);
      }
      console.log('✓ ' + resHook.mensaje);
      break;
    }

    case 'guard': {
      const resGuard = await GuardianGitHook.verificarStaged(directorioActual);
      if (!resGuard.exitoso) {
        console.error('✗ [INTERCEPTOR PUF-15 DENEGO EL COMMIT AGPL-3.0]:');
        resGuard.errores.forEach((e) => console.error(e));
        process.exit(1);
      }
      console.log('✓ Verificacion pre-commit superada exitosamente.');
      break;
    }

    default: {
      InterfazConsola.mostrarBanner();
      console.log(
        'Uso:\n' +
        '  puf iniciar <ID-INCIDENTE> [DESCRIPCION] [ARCHIVOS...]      Genera andamio test (G2) y checkpoints (G3)\n' +
        '  puf auditar [ID-INCIDENTE] [ARCHIVOS...] [--profile=mvp]   Evalua la suite (--profile=mvp|dev|security|enterprise)\n' +
        '  puf revertir <ID-INCIDENTE> <ARCHIVO>                       Restaura atomicamente el archivo previo al fallo\n' +
        '  puf instalar-hook                                           Instala el guardian de Git en .git/hooks/pre-commit\n' +
        '  puf guard                                                   Valida que los cambios en staged no violen G4 o G7\n' +
        '  puf -v, --version                                           Muestra la version actual instalada\n'
      );
      break;
    }
  }
}

main().catch((error) => {
  console.error('[PUF-15 ERROR FATAL]: ' + error.message);
  process.exit(1);
});