import { DatabaseSync } from 'node:sqlite';
import * as path from 'node:path';
import type { ResultadoAuditoria } from './types.js';

/**
 * RepositorioSqliteAudit
 * Motor de persistencia y trazabilidad forense ultrarrápido con SQLite nativo.
 * Evita la sobrecarga de leer y parsear JSON gigantescos. Permite consultas SQL
 * indexadas por ID de incidente, compuerta o estado en microsegundos.
 */
export class RepositorioSqliteAudit {
  private db: DatabaseSync;

  constructor(directorioRaiz: string) {
    const carpetaAumic = path.join(directorioRaiz, '.aumic');
    // Asegurar directorio .aumic sincrónicamente o vía path
    try {
      require('node:fs').mkdirSync(carpetaAumic, { recursive: true });
    } catch {}

    const rutaDb = path.join(carpetaAumic, 'puf_audit.sqlite');
    this.db = new DatabaseSync(rutaDb);
    this.inicializarEsquema();
  }

  private inicializarEsquema(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS auditorias (
        id TEXT PRIMARY KEY,
        fecha_registro TEXT NOT NULL,
        ecosistema TEXT NOT NULL,
        todas_aprobadas INTEGER NOT NULL,
        tiempo_total_ms INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS compuertas_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        id_auditoria TEXT NOT NULL,
        compuerta_id TEXT NOT NULL,
        nombre TEXT NOT NULL,
        estado TEXT NOT NULL,
        detalle TEXT,
        evidencia TEXT,
        tiempo_ejecucion_ms INTEGER,
        FOREIGN KEY (id_auditoria) REFERENCES auditorias(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_compuertas_auditoria ON compuertas_log(id_auditoria);
      CREATE INDEX IF NOT EXISTS idx_compuertas_estado ON compuertas_log(compuerta_id, estado);
    `);
  }

  public guardarAuditoria(resultado: ResultadoAuditoria, tiempoTotalMs: number): void {
    const stmtAudit = this.db.prepare(`
      INSERT OR REPLACE INTO auditorias (id, fecha_registro, ecosistema, todas_aprobadas, tiempo_total_ms)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmtAudit.run(
      resultado.idIncidente,
      resultado.fechaRegistro,
      resultado.lenguajeDetectado,
      resultado.todasAprobadas ? 1 : 0,
      tiempoTotalMs
    );

    const stmtLog = this.db.prepare(`
      INSERT INTO compuertas_log (id_auditoria, compuerta_id, nombre, estado, detalle, evidencia, tiempo_ejecucion_ms)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    for (const c of resultado.compuertas) {
      stmtLog.run(
        resultado.idIncidente,
        c.id,
        c.nombre,
        c.estado,
        c.detalle,
        c.evidencia,
        c.tiempoEjecucionMs
      );
    }
  }

  public obtenerAuditoria(idIncidente: string): any {
    const stmt = this.db.prepare(`
      SELECT * FROM auditorias WHERE id = ?
    `);
    const auditoria = stmt.get(idIncidente);
    if (!auditoria) return null;

    const stmtLogs = this.db.prepare(`
      SELECT compuerta_id as id, nombre, estado, detalle, evidencia, tiempo_ejecucion_ms as tiempoEjecucionMs
      FROM compuertas_log WHERE id_auditoria = ? ORDER BY id ASC
    `);
    const compuertas = stmtLogs.all(idIncidente);

    return {
      ...auditoria,
      todasAprobadas: Boolean((auditoria as any).todas_aprobadas),
      compuertas,
    };
  }

  public consultarFallosRecientes(limite = 10): any[] {
    const stmt = this.db.prepare(`
      SELECT c.compuerta_id, c.nombre, c.detalle, c.evidencia, a.fecha_registro, a.id as id_incidente
      FROM compuertas_log c
      JOIN auditorias a ON a.id = c.id_auditoria
      WHERE c.estado = 'rechazada'
      ORDER BY c.id DESC
      LIMIT ?
    `);
    return stmt.all(limite);
  }
}
