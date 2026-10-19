#!/usr/bin/env node
/**
 * @file index.ts
 * @description Punto de entrada CLI interactivo y concurrente para `puf` / `aumic-puf`.
 * Estandar AUM-IC 7:2026.
 */

import { OrquestadorPUF15 } from '../core/orquestador.js';
import { GuardianGitHook } from '../hooks/guardian-git.js';
import { InterfazConsola } from './interfaz.js';

async function main(): Promise<void> {
  const argumentos = process.argv.slice(2);
  const comando = argumentos[0]?.toLowerCase();
  const directorioActual = process.env['PUF_TARGET_DIR'] || process.cwd();
  const orquestador = new OrquestadorPUF15(directorioActual);

  switch (comando) {
    case 'iniciar':
    case 'init': {
      const idIncidente = argumentos[1];
      const descripcion = argumentos[2] || 'Resolucion metodica de fallo bajo PUF-15';
      const archivos = argumentos.slice(3);

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
      const argumentosLimpios = argumentos.filter((a) => a !== '--fast' && a !== '--fail-fast');
      const idIncidente = argumentosLimpios[1] || 'AUDITORIA_ACTIVA';
      const archivos = argumentosLimpios.slice(2);

      InterfazConsola.mostrarBanner();
      InterfazConsola.renderizarInicioAuditoria(idIncidente, failFast);

      const resultado = await orquestador.auditar(idIncidente, archivos, [], {
        failFast,
        onProgreso: (compuerta) => {
          InterfazConsola.renderizarCompuerta(compuerta);
        },
      });

      InterfazConsola.renderizarResultado(resultado);

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
        console.error('✗ [INTERCEPTOR PUF-15 DENEGO EL COMAGPL-3.0]:');
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
        '  puf iniciar <ID-INCIDENTE> [DESCRIPCION] [ARCHIVOS...]   Genera andamio test (G2) y checkpoints (G3)\n' +
        '  puf auditar [ID-INCIDENTE] [ARCHIVOS...] [--fast]        Evalua la matriz completa (G1-G15) concurrentemente\n' +
        '  puf revertir <ID-INCIDENTE> <ARCHIVO>                    Restaura atomicamente el archivo previo al fallo\n' +
        '  puf instalar-hook                                        Instala el guardian de Git en .git/hooks/pre-commit\n' +
        '  puf guard                                                Valida que los cambios en staged no violen G4 o G7\n'
      );
      break;
    }
  }
}

main().catch((error) => {
  console.error('[PUF-15 ERROR FATAL]: ' + error.message);
  process.exit(1);
});
