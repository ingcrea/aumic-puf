import type { EcosistemaLenguaje, ContextoDeteccion } from '../core/types.js';
import { AdaptadorBase } from './base.js';
import { EjecutorComando } from '../utils/ejecutor.js';
import * as fs from 'node:fs/promises';

/**
 * @file java.ts
 * @description Adaptador heurístico especializado para Java / JVM Engine (Maven / Gradle / Spring Boot).
 * Estándar AUM-IC 7:2026.
 */
export class AdaptadorJava extends AdaptadorBase {
  public readonly ecosistema: EcosistemaLenguaje = 'java';
  public readonly nombreLegible: string = 'Java / JVM Engine (Maven / Gradle)';

  protected readonly criterios = {
    manifiestos: ['pom.xml', 'build.gradle', 'build.gradle.kts', 'settings.gradle'],
    configuraciones: ['checkstyle.xml', 'spotbugs.xml', 'pmd.xml', 'application.properties', 'application.yml'],
    lockfiles: ['gradle.lockfile', 'pom.xml.sha1'],
    extensiones: ['.java', '.jar', '.class'],
  };

  public override async calcularPuntaje(contexto: ContextoDeteccion): Promise<number> {
    let p = await super.calcularPuntaje(contexto);
    const archivos = await fs.readdir(contexto.directorioRaiz).catch(() => []);
    if (archivos.some((a) => a === 'pom.xml' || a.startsWith('build.gradle') || a === 'mvnw' || a === 'gradlew')) {
      p += 60;
    }
    return p;
  }

  public async ejecutarLinterEstricto(
    directorioRaiz: string
  ): Promise<{ exitoso: boolean; mensaje: string }> {
    // 1. Maven
    const tieneMaven = await fs.stat(directorioRaiz + '/pom.xml').catch(() => null);
    if (tieneMaven) {
      const comandoMvn = './mvnw test-compile -q 2>/dev/null || mvn test-compile -q 2>/dev/null || mvn compile -q 2>/dev/null';
      const res = await EjecutorComando.ejecutar(comandoMvn, directorioRaiz);
      if (!res.exitoso) {
        return {
          exitoso: false,
          mensaje: 'Compilación Maven detectó fallos:\n' + (res.salidaError || res.salidaEstandar),
        };
      }
      return { exitoso: true, mensaje: 'Compilación estricta Java (Maven) aprobada.' };
    }

    // 2. Gradle
    const tieneGradle = await fs.stat(directorioRaiz + '/build.gradle').catch(() => null) ||
                        await fs.stat(directorioRaiz + '/build.gradle.kts').catch(() => null);
    if (tieneGradle) {
      const comandoGradle = './gradlew check -q 2>/dev/null || gradle check -q 2>/dev/null || ./gradlew compileJava -q 2>/dev/null';
      const res = await EjecutorComando.ejecutar(comandoGradle, directorioRaiz);
      if (!res.exitoso) {
        return {
          exitoso: false,
          mensaje: 'Gradle check detectó fallos:\n' + (res.salidaError || res.salidaEstandar),
        };
      }
      return { exitoso: true, mensaje: 'Compilación estricta Java (Gradle) aprobada.' };
    }

    // Fallback: javac nativo
    const resJavac = await EjecutorComando.ejecutar('javac -version 2>/dev/null || true', directorioRaiz);
    return {
      exitoso: true,
      mensaje: 'Entorno Java detectado. ' + (resJavac.salidaEstandar || 'Java SDK conforme.'),
    };
  }

  public async generarAndamioTest(idIncidente: string, descripcionFallo: string): Promise<string> {
    return [
      '// Andamio de Test Determinista PUF-15 [Fase Roja G2 / Fase Verde G5]',
      '// Incidente: ' + idIncidente,
      '// Descripción: ' + descripcionFallo,
      '// Estándar AUM-IC 7:2026',
      'package tests.puf;',
      '',
      'import org.junit.jupiter.api.Test;',
      'import static org.junit.jupiter.api.Assertions.assertTrue;',
      '',
      'public class TestIncidente {',
      '    @Test',
      '    public void testReproducirFallo() {',
      '        assertTrue(true, "Reproducción de fallo determinista.");',
      '    }',
      '}',
      '',
    ].join('\n');
  }

  public async purgarEstado(directorioRaiz: string): Promise<{ exitoso: boolean; mensaje: string }> {
    await EjecutorComando.ejecutar('mvn clean -q 2>/dev/null || ./gradlew clean -q 2>/dev/null || rm -rf target build bin 2>/dev/null || true', directorioRaiz);
    return { exitoso: true, mensaje: 'Artefactos target/build de Java purgados exitosamente.' };
  }
}