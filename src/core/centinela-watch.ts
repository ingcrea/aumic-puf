/**
 * @file centinela-watch.ts
 * @description Vigilancia en caliente (Watch Mode) con notificación dual (Consola ANSI + Toast nativo del SO).
 * Blindaje ergonómico G11 (Zero-Focus Stealing / Subprocesos sin ventana).
 * Estándar AUM-IC 7:2026.
 */

import * as fs from 'node:fs';
import { spawn } from 'node:child_process';
import { OrquestadorPUF15 } from './orquestador.js';
import { InterfazConsola } from '../cli/interfaz.js';
import { COMPUERTAS_POR_PERFIL, PerfilAuditoria } from './types.js';

export class CentinelaWatch {
  private static temporizadorDebounce: NodeJS.Timeout | null = null;
  private static enEjecucion = false;

  /**
   * Dispara una notificación Toast en el sistema operativo sin robar foco (G11 compliance).
   */
  public static dispararToast(titulo: string, mensaje: string, exitoso: boolean): void {
    const esWindows = process.platform === 'win32';
    const esLinux = process.platform === 'linux';

    if (esWindows) {
      // Notificación Toast en Windows vía PowerShell sin ventana (CREATE_NO_WINDOW: 0x08000000)
      const psScript = `
        [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] > $null
        $template = [Windows.UI.Notifications.ToastNotificationManager]::GetTemplateContent([Windows.UI.Notifications.ToastTemplateType]::ToastText02)
        $textNodes = $template.GetElementsByTagName("text")
        $textNodes.Item(0).AppendChild($template.CreateTextNode("${titulo.replace(/"/g, '`"')}")) > $null
        $textNodes.Item(1).AppendChild($template.CreateTextNode("${mensaje.replace(/"/g, '`"')}")) > $null
        $notifier = [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier("AUM-IC PUF")
        $notification = [Windows.UI.Notifications.ToastNotification]::new($template)
        $notifier.Show($notification)
      `.trim();

      try {
        const sub = spawn('powershell.exe', ['-NoProfile', '-NonInteractive', '-WindowStyle', 'Hidden', '-Command', psScript], {
          windowsHide: true,
          stdio: 'ignore',
          detached: true
        });
        sub.unref();
      } catch {}
    } else if (esLinux) {
      try {
        const urgencia = exitoso ? 'normal' : 'critical';
        const sub = spawn('notify-send', ['-u', urgencia, '-a', 'AUM-IC PUF', titulo, mensaje], {
          stdio: 'ignore',
          detached: true
        });
        sub.unref();
      } catch {}
    }
  }

  /**
   * Inicia el bucle de centinela observando el directorio raíz.
   */
  public static iniciar(
    directorioRaiz: string,
    perfil: PerfilAuditoria = 'dev',
    usarToast: boolean = true
  ): void {
    InterfazConsola.mostrarBanner();
    console.log(`\x1b[36m⚡ [CENTINELA PUF EN VIVO]:\x1b[0m Vigilando cambios en ${directorioRaiz}`);
    console.log(`\x1b[90m   Perfil activo: ${perfil.toUpperCase()} | Notificaciones Toast: ${usarToast ? 'Activadas' : 'Desactivadas'}\x1b[0m\n`);

    const orquestador = new OrquestadorPUF15(directorioRaiz);
    const compuertasAFiltrar = COMPUERTAS_POR_PERFIL[perfil];

    const ejecutarCiclo = async (archivoCambiado?: string): Promise<void> => {
      if (this.enEjecucion) return;
      this.enEjecucion = true;

      const tInicio = Date.now();
      console.log(`\n\x1b[33m⚡ Cambio detectado: ${archivoCambiado || 'archivo'}\x1b[0m -> Auditando ${perfil}...`);

      try {
        const resultado = await orquestador.auditar(
          'WATCH_' + Date.now().toString().slice(-4),
          archivoCambiado ? [archivoCambiado] : [],
          [],
          {
            failFast: true,
            compuertasAFiltrar,
            onProgreso: (c) => {
              const color = c.estado === 'aprobada' ? '\x1b[32m' : c.estado === 'rechazada' ? '\x1b[31m' : '\x1b[33m';
              console.log(`  ${color}[${c.estado.toUpperCase()}]\x1b[0m ${c.id}: ${c.nombre} (${c.tiempoEjecucionMs}ms)`);
            }
          }
        );

        const duracion = Date.now() - tInicio;
        if (resultado.todasAprobadas) {
          console.log(`\x1b[32m✔ [CERTIFICACIÓN LIMPIA]:\x1b[0m Todas las compuertas aprobadas (${duracion}ms)`);
          if (usarToast) {
            this.dispararToast('AUM-IC PUF — Verificación Exitosa', `Código conforme bajo perfil ${perfil} (${duracion}ms)`, true);
          }
        } else {
          const fallida = resultado.compuertas.find(c => c.estado === 'rechazada');
          const errorMsg = fallida ? `${fallida.id}: ${fallida.detalle}` : 'Violación de compuertas detectada';
          console.log(`\x1b[31m✗ [FALLO DE AUDITORÍA]:\x1b[0m ${errorMsg}`);
          if (usarToast) {
            this.dispararToast('AUM-IC PUF — Fallo Detectado', errorMsg, false);
          }
        }
      } catch (err: any) {
        console.error(`\x1b[31mError durante el ciclo watch:\x1b[0m ${err.message}`);
      } finally {
        this.enEjecucion = false;
      }
    };

    // Vigilancia recursiva nativa con debounce
    try {
      fs.watch(directorioRaiz, { recursive: true }, (_eventType, filename) => {
        if (!filename) return;
        const fn = filename.toString();
        // Ignorar artefactos efímeros
        if (
          fn.includes('node_modules') ||
          fn.includes('.git') ||
          fn.includes('dist') ||
          fn.includes('checkpoints') ||
          fn.includes('.aumic') ||
          fn.includes('puf-report.html') ||
          fn.endsWith('.log') ||
          fn.endsWith('.sqlite')
        ) {
          return;
        }

        if (this.temporizadorDebounce) clearTimeout(this.temporizadorDebounce);
        this.temporizadorDebounce = setTimeout(() => {
          ejecutarCiclo(fn);
        }, 150);
      });
    } catch (e: any) {
      console.error(`No se pudo iniciar fs.watch recursivo: ${e.message}`);
    }
  }
}
