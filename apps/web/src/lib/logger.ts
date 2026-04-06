/**
 * Logger centralizado para manejo seguro de errores
 * En producción, NO expone detalles internos
 * En desarrollo, sí muestra detalles completos
 */

type LogLevel = "error" | "warn" | "info" | "debug";

interface LogContext {
  context: string;
  timestamp: Date;
  environment: "production" | "development";
}

class Logger {
  private isDevelopment = process.env.NODE_ENV !== "production";

  /**
   * Log de errores seguros
   * En producción: solo mensaje genérico
   * En desarrollo: stack trace completo
   */
  error(context: string, error: unknown, additionalInfo?: Record<string, unknown>) {
    const ctx: LogContext = {
      context,
      timestamp: new Date(),
      environment: this.isDevelopment ? "development" : "production",
    };

    let errorMessage = "Unknown error";
    let errorStack = "";

    if (error instanceof Error) {
      errorMessage = error.message;
      errorStack = error.stack || "";
    } else if (typeof error === "string") {
      errorMessage = error;
    } else {
      errorMessage = JSON.stringify(error);
    }

    // En desarrollo, log todo
    if (this.isDevelopment) {
      console.error(
        `[${context}] ${new Date().toISOString()}`,
        {
          message: errorMessage,
          stack: errorStack,
          additional: additionalInfo,
        }
      );
    } else {
      // En producción, guardar en servicio externo si está disponible
      // Aquí es donde irían Sentry, LogRocket, etc.
      // Por ahora solo guardamos en stderr
      console.error(`[${context}] ${errorMessage}`);
    }

    // Retornar mensaje seguro para respuestas
    return {
      publicMessage: "Error interno del servidor",
      internalMessage: errorMessage,
      isDevelopment: this.isDevelopment,
    };
  }

  /**
   * Log de warnings
   */
  warn(context: string, message: string, additionalInfo?: Record<string, unknown>) {
    console.warn(
      `[${context}] ${new Date().toISOString()}`,
      {
        message,
        additional: additionalInfo,
      }
    );
  }

  /**
   * Log de información general
   */
  info(context: string, message: string, additionalInfo?: Record<string, unknown>) {
    if (this.isDevelopment) {
      console.log(
        `[${context}] ${new Date().toISOString()}`,
        {
          message,
          additional: additionalInfo,
        }
      );
    }
  }

  /**
   * Log de debug (solo en desarrollo)
   */
  debug(context: string, message: string, data?: unknown) {
    if (this.isDevelopment) {
      console.debug(
        `[${context}] ${new Date().toISOString()}`,
        {
          message,
          data,
        }
      );
    }
  }

  /**
   * Helper: Retornar error JSON seguro para API
   */
  getErrorResponse(context: string, error: unknown, statusCode = 500) {
    const logResult = this.error(context, error);
    
    return Response.json(
      {
        error: logResult.publicMessage,
        ...(this.isDevelopment && { details: logResult.internalMessage }),
      },
      { status: statusCode }
    );
  }
}

// Exportar instancia singleton
export const logger = new Logger();
