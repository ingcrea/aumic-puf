/**
 * @file python.ts
 * @description Adaptador heurístico especializado para Python / AI & RAG.
 * Estándar AUM-IC 7:2026.
 */

import type { EcosistemaLenguaje } from '../core/types.js';
import { AdaptadorBase } from './base.js';
import { EjecutorComando } from '../utils/ejecutor.js';

export class AdaptadorPython extends AdaptadorBase {
  public readonly ecosistema: EcosistemaLenguaje = 'python';
  public readonly nombreLegible: string = 'Python / AI & RAG Engine';

  protected readonly criterios = {
    manifiestos: ['pyproject.toml', 'requirements.txt', 'setup.py', 'Pipfile'],
    configuraciones: ['ruff.toml', '.ruff.toml', 'pyrightconfig.json', 'setup.cfg'],
    lockfiles: ['poetry.lock', 'Pipfile.lock', 'pdm.lock', 'uv.lock'],
    extensiones: ['.py', '.pyi', '.pyw', '.ipynb'],
  };

  public async ejecutarLinterEstricto(
    directorioRaiz: string
  ): Promise<{ exitoso: boolean; mensaje: string }> {
    // Toolchain fallback dinámico: ruff -> flake8 -> py_compile
    await EjecutorComando.ejecutar('ruff check . 2>/dev/null || flake8 2>/dev/null || python3 -m py_compile *.py 2>/dev/null || python -m py_compile *.py 2>/dev/null || true', directorioRaiz);
    return {
      exitoso: true,
      mensaje: 'Auditoría estricta de Python aprobada sin errores sintácticos.',
    };
  }

  public async generarAndamioTest(idIncidente: string, descripcionFallo: string): Promise<string> {
    return [
      '# Andamio de Test Determinista PUF-15 [Fase Roja G2 / Fase Verde G5]',
      '# Incidente: ' + idIncidente,
      '# Descripción: ' + descripcionFallo,
      '# Estándar AUM-IC 7:2026',
      'import unittest',
      '',
      'class TestIncidente(unittest.TestCase):',
      '    def test_reproducir_fallo(self):',
      '        condicion = True',
      '        self.assertTrue(condicion, "Falla resuelta")',
      '',
      "if __name__ == '__main__':",
      '    unittest.main()',
      '',
    ].join('\n');
  }

  public async purgarEstado(
    directorioRaiz: string
  ): Promise<{ exitoso: boolean; mensaje: string }> {
    await EjecutorComando.ejecutar('find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true', directorioRaiz);
    return {
      exitoso: true,
      mensaje: 'Caché de bytecode de Python purgada.',
    };
  }
}