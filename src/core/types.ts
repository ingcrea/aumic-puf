/**
 * @file types.ts
 * @description Definiciones de tipos estrictos en español para el Protocolo Universal contra Fallos (PUF-15).
 * Estándar AUM-IC 7:2026.
 */

export type IdentificadorCompuerta =
  | 'G0'
  | 'G1'
  | 'G2'
  | 'G3'
  | 'G4'
  | 'G5'
  | 'G6'
  | 'G7'
  | 'G8'
  | 'G9'
  | 'G10'
  | 'G11'
  | 'G12'
  | 'G13'
  | 'G14'
  | 'G15'
  | 'G16'
  | 'G17'
  | 'G18'
  | 'G19'
  | 'G20'
  | 'G21'
  | 'G22'
  | 'G23'
  | 'G24';

export const COMPUERTAS_REGISTRADAS = [
  'G0',
  'G1',
  'G2',
  'G3',
  'G4',
  'G5',
  'G6',
  'G7',
  'G8',
  'G9',
  'G10',
  'G11',
  'G12',
  'G13',
  'G14',
  'G15',
  'G16',
  'G17',
  'G18',
  'G19',
  'G20',
  'G21',
  'G22',
  'G23',
  'G24',
] as const;

export const TOTAL_COMPUERTAS_PUF = COMPUERTAS_REGISTRADAS.length;

export type EstadoCompuerta = 'pendiente' | 'aprobada' | 'rechazada' | 'omitida';

export type EcosistemaLenguaje =
  | 'php'
  | 'python'
  | 'astro'
  | 'rust'
  | 'typescript'
  | 'nextjs'
  | 'java'
  | 'csharp'
  | 'cpp'
  | 'flutter'
  | 'swift'
  | 'shell'
  | 'desconocido';

export interface CasoDeBorde {
  readonly descripcion: string;
  readonly valorEntrada: string;
  readonly resultadoEsperado: string;
}

export interface RegistroCompuerta {
  readonly id: IdentificadorCompuerta;
  readonly nombre: string;
  readonly estado: EstadoCompuerta;
  readonly detalle: string;
  readonly evidencia: string;
  readonly tiempoEjecucionMs: number;
}

export interface MetadatosPuntoControl {
  readonly idIncidente: string;
  readonly rutaArchivoOriginal: string;
  readonly rutaRespaldo: string;
  readonly hashSha256Original: string;
  readonly marcaTiempoIso: string;
  readonly tamanoBytes: number;
}

export interface OpcionesInicializacion {
  readonly idIncidente: string;
  readonly descripcionFallo: string;
  readonly archivosAfectados: readonly string[];
  readonly lenguaje?: EcosistemaLenguaje;
}

export interface ResultadoAuditoria {
  readonly idIncidente: string;
  readonly fechaRegistro: string;
  readonly lenguajeDetectado: EcosistemaLenguaje;
  readonly todasAprobadas: boolean;
  readonly compuertas: readonly RegistroCompuerta[];
  readonly reporteMarkdown: string;
}

export interface ContextoDeteccion {
  readonly directorioRaiz: string;
  readonly archivosAfectados?: readonly string[];
}

export interface AdaptadorLenguaje {
  readonly ecosistema: EcosistemaLenguaje;
  readonly nombreLegible: string;
  calcularPuntaje(contexto: ContextoDeteccion): Promise<number>;
  detectar(directorioRaiz: string): Promise<boolean>;
  ejecutarLinterEstricto(directorioRaiz: string): Promise<{ exitoso: boolean; mensaje: string }>;
  generarAndamioTest(idIncidente: string, descripcionFallo: string): Promise<string>;
  purgarEstado(directorioRaiz: string): Promise<{ exitoso: boolean; mensaje: string }>;
  /** G12: Detecta rutas rotas en HTML/JSX/Astro de los archivos afectados */
  auditarRutasVivas(archivosAfectados: readonly string[], directorioRaiz: string): Promise<{ exitoso: boolean; violaciones: readonly string[] }>;
  /** G13: Detecta acciones de UI inertes (botones/handlers sin conectar) */
  auditarInteractividad(archivosAfectados: readonly string[], directorioRaiz: string): Promise<{ exitoso: boolean; violaciones: readonly string[] }>;
}


export type PerfilAuditoria = 'enterprise' | 'mvp' | 'dev' | 'security';

export const COMPUERTAS_POR_PERFIL: Record<PerfilAuditoria, readonly IdentificadorCompuerta[]> = {
  enterprise: COMPUERTAS_REGISTRADAS,
  mvp: ['G0', 'G4', 'G6', 'G8', 'G22'],
  dev: ['G0', 'G4', 'G6', 'G8', 'G22'],
  security: ['G0', 'G8', 'G9', 'G17', 'G19', 'G20', 'G24']
};
