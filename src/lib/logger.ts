/**
 * Système de logging centralisé pour l'application
 * Remplace console.log/error/warn par un système plus robuste
 * Peut être facilement intégré avec Sentry, LogRocket, etc.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  userId?: string;
  userEmail?: string;
  component?: string;
  action?: string;
  [key: string]: any;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: LogContext;
  error?: Error;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 100; // Garder les 100 derniers logs en mémoire
  private isDevelopment = import.meta.env.MODE === 'development';
  private isEnabled = true;

  /**
   * Contexte global pour tous les logs (ex: informations utilisateur)
   */
  private globalContext: LogContext = {};

  /**
   * Définir le contexte global (appelé généralement après le login)
   */
  setGlobalContext(context: LogContext) {
    this.globalContext = { ...this.globalContext, ...context };
  }

  /**
   * Réinitialiser le contexte global (appelé généralement après le logout)
   */
  clearGlobalContext() {
    this.globalContext = {};
  }

  /**
   * Activer/désactiver le logging
   */
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  /**
   * Log de niveau DEBUG (seulement en développement)
   */
  debug(message: string, context?: LogContext) {
    if (!this.isDevelopment) return;
    this.log('debug', message, context);
  }

  /**
   * Log de niveau INFO
   */
  info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }

  /**
   * Log de niveau WARN
   */
  warn(message: string, context?: LogContext, error?: Error) {
    this.log('warn', message, context, error);
  }

  /**
   * Log de niveau ERROR
   */
  error(message: string, context?: LogContext, error?: Error) {
    this.log('error', message, context, error);

    // En production, envoyer à un service externe (Sentry, LogRocket, etc.)
    if (!this.isDevelopment) {
      this.sendToExternalService('error', message, context, error);
    }
  }

  /**
   * Méthode interne pour créer un log
   */
  private log(level: LogLevel, message: string, context?: LogContext, error?: Error) {
    if (!this.isEnabled) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context: { ...this.globalContext, ...context },
      error,
    };

    // Ajouter au buffer interne
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift(); // Supprimer le plus ancien
    }

    // Afficher dans la console avec formatage
    this.consoleOutput(entry);
  }

  /**
   * Affichage formaté dans la console
   */
  private consoleOutput(entry: LogEntry) {
    const emoji = {
      debug: '🔍',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
    };

    const timestamp = entry.timestamp.toISOString();
    const prefix = `${emoji[entry.level]} [${entry.level.toUpperCase()}] ${timestamp}`;

    // Grouper les informations pour une meilleure lisibilité
    if (entry.context && Object.keys(entry.context).length > 0) {
      console.group(`${prefix} - ${entry.message}`);
      console.log('Context:', entry.context);
      if (entry.error) {
        console.error('Error:', entry.error);
      }
      console.groupEnd();
    } else {
      const logFn = entry.level === 'error' ? console.error :
                    entry.level === 'warn' ? console.warn :
                    console.log;

      logFn(`${prefix} - ${entry.message}`);
      if (entry.error) {
        console.error(entry.error);
      }
    }
  }

  /**
   * Envoyer les erreurs à un service externe (Sentry, LogRocket, etc.)
   */
  private sendToExternalService(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ) {
    // TODO: Intégrer avec Sentry ou LogRocket
    // Exemple avec Sentry:
    // if (window.Sentry) {
    //   Sentry.captureException(error || new Error(message), {
    //     level: level as Sentry.SeverityLevel,
    //     contexts: { custom: context },
    //   });
    // }

    // Pour l'instant, on peut envoyer à une API de logging personnalisée
    // fetch('/api/logs', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ level, message, context, error: error?.stack }),
    // }).catch(console.error);
  }

  /**
   * Récupérer tous les logs (utile pour le debug ou support)
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Exporter les logs au format JSON (pour support)
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Effacer tous les logs du buffer
   */
  clearLogs() {
    this.logs = [];
  }

  /**
   * Mesurer le temps d'exécution d'une fonction
   */
  async time<T>(label: string, fn: () => Promise<T> | T, context?: LogContext): Promise<T> {
    const start = performance.now();
    this.debug(`⏱️ START: ${label}`, context);

    try {
      const result = await fn();
      const duration = performance.now() - start;
      this.debug(`⏱️ END: ${label} (${duration.toFixed(2)}ms)`, { ...context, duration });
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.error(
        `⏱️ ERROR: ${label} (${duration.toFixed(2)}ms)`,
        { ...context, duration },
        error as Error
      );
      throw error;
    }
  }
}

// Instance singleton du logger
export const logger = new Logger();

// Export par défaut
export default logger;

/**
 * Hook React pour utiliser le logger avec le contexte du composant
 */
export function useLogger(componentName: string) {
  return {
    debug: (message: string, context?: LogContext) =>
      logger.debug(message, { component: componentName, ...context }),

    info: (message: string, context?: LogContext) =>
      logger.info(message, { component: componentName, ...context }),

    warn: (message: string, context?: LogContext, error?: Error) =>
      logger.warn(message, { component: componentName, ...context }, error),

    error: (message: string, context?: LogContext, error?: Error) =>
      logger.error(message, { component: componentName, ...context }, error),

    time: <T>(label: string, fn: () => Promise<T> | T, context?: LogContext) =>
      logger.time(label, fn, { component: componentName, ...context }),
  };
}
