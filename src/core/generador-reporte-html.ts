/**
 * @file generador-reporte-html.ts
 * @description Generador visual del Reporte Forense HTML Soberano para el Protocolo PUF.
 * Diseño visual idéntico y de alta fidelidad basado en el estándar AUM-IC Inspector Forense.
 * Incluye SVG Gauge animado, tarjetas KPI con iconografía y bordes, tabla forense detallada.
 * Estándar AUM-IC 7:2026.
 */

import { promises as fs } from 'fs';
import * as path from 'path';
import type { ResultadoAuditoria } from './types.js';

export class GeneradorReporteHtml {
  public static async generar(resultado: ResultadoAuditoria, rutaDestino: string): Promise<string> {
    const timestamp = new Date().toLocaleString('es-MX', {
      timeZone: 'America/Mexico_City',
      dateStyle: 'full',
      timeStyle: 'medium',
    });

    const compuertas = resultado.compuertas || [];
    const aprobadas = compuertas.filter((c) => c.estado === 'aprobada').length;
    const rechazadas = compuertas.filter((c) => c.estado === 'rechazada').length;
    const omitidas = compuertas.filter((c) => c.estado === 'omitida').length;
    const total = compuertas.length;

    // Score calculado sobre total
    const score = total > 0 ? Math.round(((aprobadas + omitidas * 0.5) / total) * 100) : 100;
    const scoreEntero = Math.min(100, Math.max(0, score));

    let scoreColor = '#10B981';
    let scoreGrade = 'Grado A+';
    let scoreStatus = 'Soberano / Excelente';
    let scoreDesc = 'Sin hallazgos críticos detectados en la auditoría PUF.';
    let scoreStroke = '#10B981';

    if (rechazadas > 0) {
      if (scoreEntero < 50) {
        scoreColor = '#EF4444';
        scoreGrade = 'Grado F';
        scoreStatus = 'Crítico / Riesgo Operativo';
        scoreDesc = 'Se detectaron fallos críticos que impiden la certificación.';
        scoreStroke = '#EF4444';
      } else if (scoreEntero < 80) {
        scoreColor = '#F59E0B';
        scoreGrade = 'Grado C';
        scoreStatus = 'Atención Requerida';
        scoreDesc = 'Existen compuertas rechazadas que requieren remediación inmediata.';
        scoreStroke = '#F59E0B';
      } else {
        scoreColor = '#F59E0B';
        scoreGrade = 'Grado B';
        scoreStatus = 'Desviaciones Menores';
        scoreDesc = 'Incidencias activas detectadas en la matriz forense.';
        scoreStroke = '#F59E0B';
      }
    }

    // Circumference con r=54 -> 2 * PI * 54 = 339.29200658769764
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (scoreEntero / 100) * circumference;

    const escapeHtml = (str: string) => {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    };

    const compuertasRows = compuertas.map((c) => {
      let badgeClass = 'badge-success';
      let badgeText = 'APROBADA';
      let icon = '✔';

      if (c.estado === 'rechazada') {
        badgeClass = 'badge-status';
        badgeText = 'RECHAZADA';
        icon = '✖';
      } else if (c.estado === 'omitida') {
        badgeClass = 'badge-warn';
        badgeText = 'OMITIDA';
        icon = '~';
      }

      return `
        <tr>
          <td><strong style="color: #F8FAFC; font-family: var(--font-mono); font-size: 0.85rem;">${escapeHtml(c.id)}</strong></td>
          <td><span style="font-weight: 600; color: #F1F5F9;">${escapeHtml(c.nombre)}</span></td>
          <td><span class="badge ${badgeClass}">${icon} ${badgeText}</span></td>
          <td style="color: #94A3B8; font-size: 0.82rem; line-height: 1.4;">${escapeHtml(c.detalle)}</td>
          <td><span class="code-pill" title="${escapeHtml(c.evidencia)}">${escapeHtml(c.evidencia)}</span></td>
          <td style="text-align: right; color: var(--text-dim); font-size: 0.8rem; font-family: var(--font-mono); white-space: nowrap;">${c.tiempoEjecucionMs} ms</td>
        </tr>
      `;
    }).join('');

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AUM-IC Forensics | Reporte Ejecutivo de Inspección PUF</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #060911;
      --card-bg: rgba(13, 20, 36, 0.72);
      --card-border: rgba(255, 255, 255, 0.08);
      --card-hover: rgba(25, 36, 62, 0.75);
      --gold: #D4AF37;
      --gold-light: #F6E05E;
      --gold-glow: rgba(212, 175, 55, 0.25);
      --text: #F1F5F9;
      --text-muted: #94A3B8;
      --text-dim: #64748B;
      --danger: #EF4444;
      --danger-bg: rgba(239, 68, 68, 0.12);
      --warning: #F59E0B;
      --warning-bg: rgba(245, 158, 11, 0.12);
      --success: #10B981;
      --success-bg: rgba(16, 185, 129, 0.12);
      --info: #38BDF8;
      --info-bg: rgba(56, 189, 248, 0.12);
      --font-sans: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      --font-mono: 'JetBrains Mono', monospace;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--bg);
      background-image: 
        radial-gradient(at 0% 0%, rgba(212, 175, 55, 0.08) 0px, transparent 50%),
        radial-gradient(at 100% 0%, rgba(56, 189, 248, 0.08) 0px, transparent 50%),
        radial-gradient(at 50% 100%, rgba(16, 185, 129, 0.05) 0px, transparent 50%);
      background-attachment: fixed;
      color: var(--text);
      font-family: var(--font-sans);
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
      padding: 32px 20px 60px;
    }

    .container {
      max-width: 1240px;
      margin: 0 auto;
    }

    .header {
      background: var(--card-bg);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid var(--card-border);
      border-radius: 20px;
      padding: 32px 36px;
      margin-bottom: 28px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 24px;
      box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.5);
      position: relative;
      overflow: hidden;
    }

    .header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, var(--gold), transparent);
    }

    .brand-meta {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }

    .pill-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-family: var(--font-mono);
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 4px 10px;
      border-radius: 9999px;
      background: rgba(212, 175, 55, 0.1);
      border: 1px solid rgba(212, 175, 55, 0.3);
      color: var(--gold-light);
    }

    .pill-badge .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--gold);
      box-shadow: 0 0 8px var(--gold);
    }

    .header-title {
      font-size: 2.1rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      color: #FFFFFF;
      margin-bottom: 6px;
    }

    .header-title .accent {
      background: linear-gradient(135deg, #FFFFFF 30%, var(--gold-light) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .target-url {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--text-muted);
      font-size: 0.9rem;
      margin-bottom: 8px;
    }

    .target-url span {
      font-weight: 600;
      color: var(--text-dim);
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 0.05em;
    }

    .target-url a {
      color: var(--info);
      text-decoration: none;
      font-family: var(--font-mono);
      word-break: break-all;
    }

    .timestamp-box {
      font-size: 0.8rem;
      color: var(--text-dim);
      font-family: var(--font-mono);
    }

    .health-summary {
      display: flex;
      align-items: center;
      gap: 20px;
      background: rgba(6, 11, 22, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 16px;
      padding: 16px 24px;
    }

    .gauge-wrapper {
      position: relative;
      width: 120px;
      height: 120px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .gauge-svg {
      width: 120px;
      height: 120px;
      transform: rotate(-90deg);
    }

    .gauge-bg {
      fill: none;
      stroke: rgba(255, 255, 255, 0.06);
      stroke-width: 10;
    }

    .gauge-meter {
      fill: none;
      stroke: ${scoreStroke};
      stroke-width: 10;
      stroke-linecap: round;
      stroke-dasharray: ${circumference};
      stroke-dashoffset: ${strokeDashoffset};
      transition: stroke-dashoffset 1s ease-in-out;
      filter: drop-shadow(0 0 6px ${scoreStroke});
    }

    .gauge-content {
      position: absolute;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
    }

    .gauge-score {
      font-size: 1.7rem;
      font-weight: 800;
      font-family: var(--font-mono);
      color: #FFFFFF;
      line-height: 1;
    }

    .gauge-grade {
      font-size: 0.7rem;
      font-weight: 700;
      color: ${scoreColor};
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-top: 4px;
    }

    .health-details {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .health-label {
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--text-dim);
      font-weight: 600;
    }

    .health-status {
      font-size: 1.15rem;
      font-weight: 700;
      color: #FFFFFF;
    }

    .health-desc {
      font-size: 0.8rem;
      color: var(--text-muted);
      max-width: 200px;
      line-height: 1.3;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }

    .stat-card {
      background: var(--card-bg);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 20px 22px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      transition: transform 0.2s, border-color 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      border-color: rgba(255, 255, 255, 0.15);
    }

    .stat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .stat-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--text-muted);
      font-weight: 600;
    }

    .stat-icon {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
    }

    .stat-icon.blue {
      background: var(--info-bg);
      color: var(--info);
      border: 1px solid rgba(56, 189, 248, 0.2);
    }

    .stat-icon.green {
      background: var(--success-bg);
      color: var(--success);
      border: 1px solid rgba(16, 185, 129, 0.2);
    }

    .stat-icon.red {
      background: var(--danger-bg);
      color: var(--danger);
      border: 1px solid rgba(239, 68, 68, 0.2);
    }

    .stat-icon.yellow {
      background: var(--warning-bg);
      color: var(--warning);
      border: 1px solid rgba(245, 158, 11, 0.2);
    }

    .stat-value {
      font-size: 2.2rem;
      font-weight: 800;
      font-family: var(--font-mono);
      line-height: 1;
      color: #FFFFFF;
    }

    .stat-sub {
      font-size: 0.75rem;
      color: var(--text-dim);
    }

    .section {
      background: var(--card-bg);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 26px 28px;
      margin-bottom: 24px;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 18px;
      padding-bottom: 14px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }

    .section-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .section-count {
      font-size: 0.75rem;
      font-weight: 700;
      font-family: var(--font-mono);
      padding: 4px 10px;
      border-radius: 9999px;
    }

    .section-count.danger {
      background: var(--danger-bg);
      color: var(--danger);
      border: 1px solid rgba(239, 68, 68, 0.3);
    }

    .section-count.warning {
      background: var(--warning-bg);
      color: var(--warning);
      border: 1px solid rgba(245, 158, 11, 0.3);
    }

    .section-count.success {
      background: var(--success-bg);
      color: var(--success);
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    .table-container {
      overflow-x: auto;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.06);
      background: rgba(8, 13, 24, 0.5);
    }

    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.88rem;
    }

    th {
      background: rgba(15, 23, 42, 0.85);
      color: var(--text-muted);
      font-weight: 600;
      text-transform: uppercase;
      font-size: 0.72rem;
      letter-spacing: 0.06em;
      padding: 14px 18px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    td {
      padding: 14px 18px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      color: var(--text);
      vertical-align: middle;
    }

    tr:last-child td {
      border-bottom: none;
    }

    tr:hover td {
      background: rgba(255, 255, 255, 0.02);
    }

    .code-pill {
      font-family: var(--font-mono);
      font-size: 0.78rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
      padding: 3px 8px;
      border-radius: 6px;
      color: #E2E8F0;
      max-width: 320px;
      display: inline-block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      vertical-align: middle;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 0.72rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
      font-family: var(--font-mono);
      text-transform: uppercase;
    }

    .badge-success {
      background: var(--success-bg);
      color: var(--success);
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    .badge-status {
      background: var(--danger-bg);
      color: var(--danger);
      border: 1px solid rgba(239, 68, 68, 0.3);
    }

    .badge-warn {
      background: var(--warning-bg);
      color: var(--warning);
      border: 1px solid rgba(245, 158, 11, 0.3);
    }

    .footer {
      text-align: center;
      margin-top: 48px;
      padding-top: 24px;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      color: var(--text-dim);
      font-size: 0.8rem;
    }

    .footer a {
      color: var(--gold);
      text-decoration: none;
      font-weight: 600;
    }

    .footer a:hover {
      text-decoration: underline;
    }

    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        align-items: flex-start;
      }
      .health-summary {
        width: 100%;
        justify-content: center;
      }
      .stat-value {
        font-size: 1.7rem;
      }
    }
  </style>
</head>
<body>
  <div class="container">

    <header class="header">
      <div>
        <div class="brand-meta">
          <span class="pill-badge"><span class="dot"></span>AUM-IC PUF Forense V3</span>
          <span class="pill-badge" style="border-color: rgba(56, 189, 248, 0.3); color: #7DD3FC; background: rgba(56, 189, 248, 0.1);">${escapeHtml(resultado.lenguajeDetectado.toUpperCase())}</span>
        </div>
        <h1 class="header-title">Reporte de <span class="accent">Calidad e Integridad</span></h1>
        <div class="target-url">
          <span>Incidente:</span>
          <a href="#">${escapeHtml(resultado.idIncidente)}</a>
        </div>
        <div class="timestamp-box">Generado el ${escapeHtml(timestamp)}</div>
      </div>

      <div class="health-summary">
        <div class="gauge-wrapper">
          <svg class="gauge-svg" viewBox="0 0 128 128">
            <circle class="gauge-bg" cx="64" cy="64" r="54" />
            <circle class="gauge-meter" cx="64" cy="64" r="54" />
          </svg>
          <div class="gauge-content">
            <span class="gauge-score">${scoreEntero}%</span>
            <span class="gauge-grade">${scoreGrade}</span>
          </div>
        </div>
        <div class="health-details">
          <span class="health-label">Índice PUF</span>
          <span class="health-status">${scoreStatus}</span>
          <span class="health-desc">${scoreDesc}</span>
        </div>
      </div>
    </header>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-label">Compuertas Totales</span>
          <div class="stat-icon blue">📋</div>
        </div>
        <div class="stat-value">${total}</div>
        <div class="stat-sub">Alcance evaluado de la matriz</div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-label">Aprobadas</span>
          <div class="stat-icon green">✔</div>
        </div>
        <div class="stat-value" style="color: var(--success);">${aprobadas}</div>
        <div class="stat-sub">Cumplimiento estricto AUM-IC</div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-label">Rechazadas</span>
          <div class="stat-icon red">✖</div>
        </div>
        <div class="stat-value" style="color: ${rechazadas > 0 ? 'var(--danger)' : 'var(--text-dim)'};">${rechazadas}</div>
        <div class="stat-sub">Incidencias y fallos activos</div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-label">Omitidas</span>
          <div class="stat-icon yellow">~</div>
        </div>
        <div class="stat-value" style="color: var(--warning);">${omitidas}</div>
        <div class="stat-sub">No aplicables al ecosistema</div>
      </div>
    </div>

    <section class="section">
      <div class="section-header">
        <div class="section-title">
          <span>🛡️</span> Matriz Forense de Calidad PUF
        </div>
        <span class="section-count ${rechazadas > 0 ? 'danger' : 'success'}">
          ${rechazadas > 0 ? rechazadas + ' fallos' : '100% aprobada'}
        </span>
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th style="width: 70px;">ID</th>
              <th style="width: 280px;">Compuerta</th>
              <th style="width: 130px;">Estado</th>
              <th>Detalle Forense</th>
              <th style="width: 240px;">Evidencia</th>
              <th style="width: 100px; text-align: right;">Tiempo</th>
            </tr>
          </thead>
          <tbody>
            ${compuertasRows}
          </tbody>
        </table>
      </div>
    </section>

    <footer class="footer">
      <p>Reporte generado por <strong>AUM-IC PUF Inspector</strong> — Cumplimiento Estándar AUM-IC 7:2026</p>
      <p style="margin-top: 4px;">Desarrollado con rigor soberano por <a href="https://ingcrea.com" target="_blank">Ingeniería Creativa</a>.</p>
    </footer>

  </div>
</body>
</html>`;

    const rutaFinal = path.resolve(rutaDestino);
    await fs.writeFile(rutaFinal, html.replace(/\r\n/g, '\n'), 'utf-8');
    return rutaFinal;
  }
}
