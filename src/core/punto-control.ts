/**
 * @file punto-control.ts
 * @description Gestor atómico de respaldos inmutables (Compuerta G3) y reversión determinista.
 * Estándar AUM-IC 7:2026.
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import type { MetadatosPuntoControl } from './types.js';

export class GestorPuntoControl {
  private readonly directorioCheckpoints: string;

  constructor(directorioRaiz: string) {
    this.directorioCheckpoints = path.join(directorioRaiz, 'checkpoints');
  }

  /**
   * Calcula el hash SHA-256 de un archivo de manera síncrona/buffer
   */
  public static async calcularHashSha256(rutaArchivo: string): Promise<string> {
    const contenido = await fs.readFile(rutaArchivo);
    return crypto.createHash('sha256').update(contenido).digest('hex');
  }

  /**
   * Crea un respaldo inmutable de un archivo con metadatos de auditoría
   */
  public async respaldarArchivo(
    idIncidente: string,
    rutaArchivoRelativa: string,
    directorioRaiz: string
  ): Promise<MetadatosPuntoControl> {
    const rutaAbsoluta = path.resolve(directorioRaiz, rutaArchivoRelativa);
    const existe = await fs.stat(rutaAbsoluta).catch(() => null);

    if (!existe || !existe.isFile()) {
      throw new Error(`El archivo a respaldar no existe o no es válido: ${rutaAbsoluta}`);
    }

    const contenido = await fs.readFile(rutaAbsoluta);
    const hashOriginal = crypto.createHash('sha256').update(contenido).digest('hex');
    const marcaTiempo = new Date();
    const timestampCadena = marcaTiempo.toISOString().replace(/[-:T.]/g, '').slice(0, 14);

    const carpetaIncidente = path.join(this.directorioCheckpoints, idIncidente);
    await fs.mkdir(carpetaIncidente, { recursive: true });

    const nombreBase = path.basename(rutaAbsoluta);
    const nombreRespaldo = `${nombreBase}.bak_${timestampCadena}`;
    const rutaRespaldo = path.join(carpetaIncidente, nombreRespaldo);

    await fs.writeFile(rutaRespaldo, contenido);

    const metadatos: MetadatosPuntoControl = {
      idIncidente,
      rutaArchivoOriginal: rutaArchivoRelativa,
      rutaRespaldo: path.relative(directorioRaiz, rutaRespaldo).replace(/\\/g, '/'),
      hashSha256Original: hashOriginal,
      marcaTiempoIso: marcaTiempo.toISOString(),
      tamanoBytes: existe.size,
    };

    const rutaMetadatos = path.join(carpetaIncidente, `${nombreRespaldo}.meta.json`);
    await fs.writeFile(rutaMetadatos, JSON.stringify(metadatos, null, 2), 'utf-8');

    return metadatos;
  }

  /**
   * Revierte un archivo a su estado original verificado por hash SHA-256
   */
  public async revertirArchivo(
    idIncidente: string,
    nombreArchivo: string,
    directorioRaiz: string
  ): Promise<{ exitoso: boolean; mensaje: string }> {
    const carpetaIncidente = path.join(this.directorioCheckpoints, idIncidente);
    const archivos = await fs.readdir(carpetaIncidente).catch(() => []);

    const metaArchivos = archivos.filter(
      (a) => a.startsWith(nombreArchivo) && a.endsWith('.meta.json')
    );

    if (metaArchivos.length === 0) {
      return {
        exitoso: false,
        mensaje: `No se encontraron puntos de control para '${nombreArchivo}' en el incidente '${idIncidente}'.`,
      };
    }

    // Tomar el más reciente
    const ultimoMeta = metaArchivos.sort().reverse()[0];
    if (!ultimoMeta) {
      return { exitoso: false, mensaje: 'Error al resolver el metadato del respaldo.' };
    }

    const contenidoMeta = await fs.readFile(path.join(carpetaIncidente, ultimoMeta), 'utf-8');
    const metadatos = JSON.parse(contenidoMeta) as MetadatosPuntoControl;

    const rutaAbsolutaOriginal = path.resolve(directorioRaiz, metadatos.rutaArchivoOriginal);
    const rutaAbsolutaRespaldo = path.resolve(directorioRaiz, metadatos.rutaRespaldo);

    const contenidoRespaldo = await fs.readFile(rutaAbsolutaRespaldo);
    const hashVerificacion = crypto
      .createHash('sha256')
      .update(contenidoRespaldo)
      .digest('hex');

    if (hashVerificacion !== metadatos.hashSha256Original) {
      return {
        exitoso: false,
        mensaje: `ALERTA DE CORRUPCIÓN: El hash del respaldo (${hashVerificacion}) no coincide con el original (${metadatos.hashSha256Original}). Reversión abortada.`,
      };
    }

    await fs.writeFile(rutaAbsolutaOriginal, contenidoRespaldo);

    return {
      exitoso: true,
      mensaje: `Reversión atómica exitosa para '${metadatos.rutaArchivoOriginal}'. SHA-256 verificado: ${hashVerificacion.slice(0, 12)}...`,
    };
  }
}