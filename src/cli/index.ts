#!/usr/bin/env node
/**
 * @file index.ts
 * @description Punto de entrada CLI interactivo, centinela y servidor MCP para `puf` / `aumic-puf`.
 * Soporta selector de compuerta única (-g / --gate), perfiles, generación de reporte HTML forense,
 * modo de vigilancia reactiva (watch), auto-remediación (sanar/fix) y servidor MCP nativo.
 * Estándar AUM-IC 7:2026.
 */

import * as path from 'path';
import { OrquestadorPUF15 } from '../core/orquestador.js';
import { GuardianGitHook } from '../hooks/guardian-git.js';
import { GeneradorReporteHtml } from '../core/generador-reporte-html.js';
import { InterfazConsola } from './interfaz.js';
import { COMPUERTAS_POR_PERFIL, PerfilAuditoria } from '../core/types.js';
import { AutoSanador } from '../core/auto-sanador.js';
import { CentinelaWatch } from '../core/centinela-watch.js';
import { ServidorMcpPuf } from '../core/servidor-mcp.js';

async function main(): Promise<void> {
  const argumentos = process.argv.slice(2);
  const comando = argumentos[0]?.toLowerCase();
  const directorioActual = process.env['PUF_TARGET_DIR'] || process.cwd();
  const orquestador = new OrquestadorPUF15(directorioActual);

  if (comando === '-v' || comando === '--version' || comando === 'version') {
    console.log('v3.4.0');
    return;
  }

  // Subcomando de Servidor MCP Nativo (stdio)
  if (comando === 'serve' || comando === 'mcp' || argumentos.includes('--mcp')) {
    ServidorMcpPuf.iniciar(directorioActual);
    return;
  }

  switch (comando) {
    case 'iniciar':
    case 'init': {
      const idIncidente = argumentos[1];
      const descripcion = argumentos[2] || 'Resolucion metodica de fallo bajo PUF-25';
      const archivos = argumentos.slice(3).filter((a): a is string => typeof a === 'string');

      if (!idIncidente) {
        console.error('Uso: puf iniciar <ID-INCIDENTE> [DESCRIPCION] [ARCHIVOS...]');
        process.exit(1);
      }

      InterfazConsola.mostrarBanner();
      console.log('[PUF-25]: Inicializando incidente ' + idIncidente + '...');
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

    case 'sanar':
    case 'fix': {
      InterfazConsola.mostrarBanner();
      const compuertasArgs = argumentos.slice(1).map(c => c.toUpperCase().replace(/^--?G?/, 'G'));
      console.log(`\x1b[36m⚡ [AUTO-SANADOR DETERMINISTA]:\x1b[0m Iniciando protocolo de reparación quirúrgica...`);

      const sanaciones = await AutoSanador.sanar(
        directorioActual,
        compuertasArgs.length > 0 ? compuertasArgs : undefined
      );

      let totalReparaciones = 0;
      sanaciones.forEach(s => {
        totalReparaciones += s.reparacionesAplicadas;
        const color = s.reparacionesAplicadas > 0 ? '\x1b[32m✔' : '\x1b[90m-';
        console.log(`${color} [${s.compuerta}]:\x1b[0m ${s.detalle}`);
        if (s.archivosModificados.length > 0) {
          s.archivosModificados.forEach(a => console.log(`    \x1b[33m↳ modificado:\x1b[0m ${a}`));
        }
      });

      console.log(`\n\x1b[32m✔ Sanación completada:\x1b[0m ${totalReparaciones} anomalías corregidas con respaldos G3 atómicos.\n`);
      break;
    }

    case 'watch':
    case 'centinela': {
      let perfilWatch: PerfilAuditoria = 'dev';
      let usarToast = true;

      for (const arg of argumentos.slice(1)) {
        if (arg.startsWith('--profile=')) {
          const p = arg.split('=')[1]?.toLowerCase() as PerfilAuditoria;
          if (COMPUERTAS_POR_PERFIL[p]) perfilWatch = p;
        } else if (arg === '--no-toast') {
          usarToast = false;
        }
      }

      CentinelaWatch.iniciar(directorioActual, perfilWatch, usarToast);
      break;
    }

    case 'auditar':
    case 'verificar':
    case 'audit':
    case 'verify': {
      const failFast = argumentos.includes('--fast') || argumentos.includes('--fail-fast');
      const sinReporte = argumentos.includes('--no-html');

      const compuertasAFiltrar: string[] = [];

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
      console.log('[PUF-25]: Solicitando reversion atomica G3...');
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
      console.log('[PUF-25]: Instalando interceptor forense Git...');
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
        console.error('✗ [INTERCEPTOR PUF-25 DENEGO EL COMMIT AGPL-3.0]:');
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
        '  puf auditar [ID-INCIDENTE] [--profile=mvp]                 Evalua la suite (--profile=mvp|dev|security|enterprise)\n' +
        '  puf sanar [COMPUERTAS...]                                 Ejecuta auto-remediacion quirurgica (alias: puf fix)\n' +
        '  puf watch [--profile=dev] [--no-toast]                    Modo centinela con notificacion dual consola + Toast SO\n' +
        '  puf serve                                                 Inicia el servidor MCP nativo (Model Context Protocol stdio)\n' +
        '  puf iniciar <ID-INCIDENTE> [DESCRIPCION] [ARCHIVOS...]    Genera andamio test (G2) y checkpoints (G3)\n' +
        '  puf revertir <ID-INCIDENTE> <ARCHIVO>                     Restaura atomicamente el archivo previo al fallo\n' +
        '  puf instalar-hook                                         Instala el guardian de Git en .git/hooks/pre-commit\n' +
        '  puf guard                                                 Valida que los cambios en staged no violen G4 o G7\n' +
        '  puf -v, --version                                         Muestra la version actual instalada\n'
      );
      break;
    }
  }
}

main().catch((error) => {
  console.error('[PUF ERROR FATAL]: ' + error.message);
  process.exit(1);
});
