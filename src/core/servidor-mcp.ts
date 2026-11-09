/**
 * @file servidor-mcp.ts
 * @description Servidor MCP nativo (Model Context Protocol) por stdio para PUF.
 * Permite que asistentes de IA (Antigravity, Claude, Cursor) invoquen auditorías y correcciones sin latencia.
 * Estándar AUM-IC 7:2026.
 */

import { OrquestadorPUF15 } from './orquestador.js';
import { AutoSanador } from './auto-sanador.js';
import { COMPUERTAS_REGISTRADAS, COMPUERTAS_POR_PERFIL, PerfilAuditoria } from './types.js';

interface SolicitudJsonRpc {
  jsonrpc: '2.0';
  id?: string | number;
  method: string;
  params?: any;
}

export class ServidorMcpPuf {
  public static iniciar(directorioRaiz: string): void {
    const orquestador = new OrquestadorPUF15(directorioRaiz);

    process.stdin.setEncoding('utf8');

    let bufferEntrada = '';

    process.stdin.on('data', async (chunk) => {
      bufferEntrada += chunk.toString();
      const lineas = bufferEntrada.split('\n');
      bufferEntrada = lineas.pop() || '';

      for (const linea of lineas) {
        const limpia = linea.trim();
        if (!limpia) continue;
        try {
          const mensaje: SolicitudJsonRpc = JSON.parse(limpia);
          await this.manejarMensaje(mensaje, orquestador, directorioRaiz);
        } catch (e: any) {
          this.responderError(null, -32700, 'Parse error: ' + e.message);
        }
      }
    });
  }

  private static async manejarMensaje(
    req: SolicitudJsonRpc,
    orquestador: OrquestadorPUF15,
    directorioRaiz: string
  ): Promise<void> {
    const { id, method, params } = req;

    switch (method) {
      case 'initialize': {
        this.responderExito(id, {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {}
          },
          serverInfo: {
            name: 'aumic-puf-mcp',
            version: '3.4.0'
          }
        });
        break;
      }

      case 'tools/list': {
        this.responderExito(id, {
          tools: [
            {
              name: 'puf_auditar',
              description: 'Ejecuta la auditoría del Protocolo Universal contra Fallos (PUF-25) sobre el repositorio.',
              inputSchema: {
                type: 'object',
                properties: {
                  perfil: {
                    type: 'string',
                    enum: ['enterprise', 'mvp', 'dev', 'security'],
                    description: 'Perfil de auditoría dinámico.'
                  },
                  compuertas: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Lista específica de compuertas (ej. ["G0", "G4", "G22"]).'
                  },
                  failFast: {
                    type: 'boolean',
                    description: 'Si aborta al primer fallo detectado.'
                  }
                }
              }
            },
            {
              name: 'puf_sanar',
              description: 'Ejecuta la auto-remediación determinista (puf fix/sanar) para resolver violaciones de G0, G8, G17, G20 y G22.',
              inputSchema: {
                type: 'object',
                properties: {
                  compuertas: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Compuertas a sanar (omite para sanar todas las disponibles).'
                  }
                }
              }
            },
            {
              name: 'puf_listar_compuertas',
              description: 'Devuelve el listado completo de las 25 compuertas de calidad de PUF-25 y los perfiles disponibles.',
              inputSchema: { type: 'object', properties: {} }
            }
          ]
        });
        break;
      }

      case 'tools/call': {
        const nombreHerramienta = params?.name;
        const args = params?.arguments || {};

        if (nombreHerramienta === 'puf_listar_compuertas') {
          this.responderExito(id, {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  total: COMPUERTAS_REGISTRADAS.length,
                  compuertas: COMPUERTAS_REGISTRADAS,
                  perfiles: COMPUERTAS_POR_PERFIL
                }, null, 2)
              }
            ]
          });
          return;
        }

        if (nombreHerramienta === 'puf_sanar') {
          const compuertas = args.compuertas;
          const resultadoSanacion = await AutoSanador.sanar(directorioRaiz, compuertas);
          this.responderExito(id, {
            content: [
              {
                type: 'text',
                text: JSON.stringify(resultadoSanacion, null, 2)
              }
            ]
          });
          return;
        }

        if (nombreHerramienta === 'puf_auditar') {
          const perfil = (args.perfil || 'dev') as PerfilAuditoria;
          const failFast = Boolean(args.failFast);
          const compuertasAFiltrar = args.compuertas && args.compuertas.length > 0
            ? args.compuertas
            : COMPUERTAS_POR_PERFIL[perfil];

          const res = await orquestador.auditar('MCP_AUDIT', [], [], {
            failFast,
            compuertasAFiltrar
          });

          this.responderExito(id, {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  idIncidente: res.idIncidente,
                  todasAprobadas: res.todasAprobadas,
                  lenguajeDetectado: res.lenguajeDetectado,
                  compuertas: res.compuertas.map(c => ({
                    id: c.id,
                    nombre: c.nombre,
                    estado: c.estado,
                    detalle: c.detalle,
                    tiempoMs: c.tiempoEjecucionMs
                  }))
                }, null, 2)
              }
            ]
          });
          return;
        }

        this.responderError(id, -32601, `Herramienta desconocida: ${nombreHerramienta}`);
        break;
      }

      default: {
        this.responderError(id, -32601, `Método no soportado: ${method}`);
        break;
      }
    }
  }

  private static responderExito(id: string | number | undefined, result: any): void {
    if (id === undefined) return;
    const respuesta = {
      jsonrpc: '2.0',
      id,
      result
    };
    process.stdout.write(JSON.stringify(respuesta) + '\n');
  }

  private static responderError(id: string | number | null | undefined, code: number, message: string): void {
    const respuesta = {
      jsonrpc: '2.0',
      id: id ?? null,
      error: { code, message }
    };
    process.stdout.write(JSON.stringify(respuesta) + '\n');
  }
}
