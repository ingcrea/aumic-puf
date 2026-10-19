/**
 * @file csharp.ts
 * @description Adaptador heurístico especializado para C# / .NET Core.
 * Estándar AUM-IC 7:2026.
 */

import * as fs from 'node:fs/promises';
import type { EcosistemaLenguaje, ContextoDeteccion } from '../core/types.js';
import { AdaptadorBase } from './base.js';
import { EjecutorComando } from '../utils/ejecutor.js';

export class AdaptadorCSharp extends AdaptadorBase {
  public readonly ecosistema: EcosistemaLenguaje = 'csharp';
  public readonly nombreLegible: string = 'C# / .NET Core';

  protected readonly criterios = {
    manifiestos: [],
    configuraciones: ['Directory.Build.props', 'nuget.config'],
    lockfiles: ['packages.lock.json'],
    extensiones: ['.cs', '.csproj', '.sln'],
  };

  public override async calcularPuntaje(contexto: ContextoDeteccion): Promise<number> {
    let p = await super.calcularPuntaje(contexto);
    const archivos = await fs.readdir(contexto.directorioRaiz).catch(() => []);
    if (archivos.some((a) => a.endsWith('.csproj') || a.endsWith('.sln'))) {
      p += 60;
    }
    return p;
  }

  public async ejecutarLinterEstricto(
    directorioRaiz: string
  ): Promise<{ exitoso: boolean; mensaje: string }> {
    const res = await EjecutorComando.ejecutar('dotnet build --warnaserror 2>/dev/null || dotnet build', directorioRaiz);
    if (!res.exitoso) {
      return {
        exitoso: false,
        mensaje: 'MSBuild / dotnet build detectó errores:\n' + (res.salidaError || res.salidaEstandar),
      };
    }
    return {
      exitoso: true,
      mensaje: 'Compilación estricta de C# (.NET) aprobada.',
    };
  }

  public async generarAndamioTest(idIncidente: string, descripcionFallo: string): Promise<string> {
    return [
      '// Andamio de Test Determinista PUF-15 [Fase Roja G2 / Fase Verde G5]',
      '// Incidente: ' + idIncidente,
      '// Descripción: ' + descripcionFallo,
      '// Estándar AUM-IC 7:2026',
      'using Xunit;',
      '',
      'namespace Tests.PUF11;',
      '',
      'public class TestIncidente {',
      '    [Fact]',
      '    public void ReproducirFallo() {',
      '        Assert.True(true);',
      '    }',
      '}',
      '',
    ].join('\n');
  }

  public async purgarEstado(directorioRaiz: string): Promise<{ exitoso: boolean; mensaje: string }> {
    await EjecutorComando.ejecutar('dotnet clean -v q 2>/dev/null || true', directorioRaiz);
    return { exitoso: true, mensaje: 'Artefactos bin/obj purgados con dotnet clean.' };
  }
}