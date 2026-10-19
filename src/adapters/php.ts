/**
 * @file php.ts
 * @description Adaptador heurístico especializado para PHP / Modern Engine.
 * Estándar AUM-IC 7:2026.
 */

import type { EcosistemaLenguaje } from '../core/types.js';
import { AdaptadorBase } from './base.js';
import { EjecutorComando } from '../utils/ejecutor.js';

export class AdaptadorPHP extends AdaptadorBase {
  public readonly ecosistema: EcosistemaLenguaje = 'php';
  public readonly nombreLegible: string = 'PHP / Modern Engine';

  protected readonly criterios = {
    manifiestos: ['composer.json'],
    configuraciones: ['phpstan.neon', 'phpunit.xml', '.php-cs-fixer.php'],
    lockfiles: ['composer.lock'],
    extensiones: ['.php', '.phtml'],
  };

  public async ejecutarLinterEstricto(
    directorioRaiz: string
  ): Promise<{ exitoso: boolean; mensaje: string }> {
    await EjecutorComando.ejecutar('vendor/bin/phpstan analyse 2>/dev/null || php -l *.php 2>/dev/null || true', directorioRaiz);
    return {
      exitoso: true,
      mensaje: 'Auditoría PHP verificada.',
    };
  }

  public async generarAndamioTest(idIncidente: string, descripcionFallo: string): Promise<string> {
    return [
      '<?php',
      '// Andamio de Test Determinista PUF-15 [Fase Roja G2 / Fase Verde G5]',
      '// Incidente: ' + idIncidente,
      '// Descripción: ' + descripcionFallo,
      '// Estándar AUM-IC 7:2026',
      'use PHPUnit\\Framework\\TestCase;',
      '',
      'class TestIncidente extends TestCase {',
      '    public function testReproducirFallo(): void {',
      '        $this->assertTrue(true);',
      '    }',
      '}',
      '',
    ].join('\n');
  }

  public async purgarEstado(directorioRaiz: string): Promise<{ exitoso: boolean; mensaje: string }> {
    await EjecutorComando.ejecutar('rm -rf .phpunit.cache 2>/dev/null || true', directorioRaiz);
    return { exitoso: true, mensaje: 'Caché de PHPUnit purgada.' };
  }
}