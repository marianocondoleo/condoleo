/**
 * Rate Limiting Middleware
 * Soporta diferentes estrategias de rate limiting
 */

type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: Date;
};

/**
 * Simple in-memory rate limiter (para desarrollo)
 * NO usar en producción con múltiples workers
 */
class InMemoryRateLimiter {
  private records: Map<string, { count: number; resetAt: Date }> = new Map();

  limit(key: string, maxRequests: number, windowMs: number): RateLimitResult {
    const now = Date.now();
    const record = this.records.get(key);

    if (!record || now > record.resetAt.getTime()) {
      // Nueva ventana
      const resetAt = new Date(now + windowMs);
      this.records.set(key, { count: 1, resetAt });

      return {
        success: true,
        limit: maxRequests,
        remaining: maxRequests - 1,
        resetAt,
      };
    }

    // Ventana existente
    if (record.count >= maxRequests) {
      return {
        success: false,
        limit: maxRequests,
        remaining: 0,
        resetAt: record.resetAt,
      };
    }

    record.count++;
    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - record.count,
      resetAt: record.resetAt,
    };
  }
}

// Instancia global de in-memory limiter
const inMemoryLimiter = new InMemoryRateLimiter();

/**
 * Rate limiter principal - usa in-memory por defecto
 * En producción, considera usar Upstash Redis
 */
export async function rateLimit(
  key: string,
  options: {
    maxRequests?: number;
    windowSeconds?: number;
  } = {}
): Promise<RateLimitResult> {
  const maxRequests = options.maxRequests ?? 30;
  const windowSeconds = options.windowSeconds ?? 60;

  return inMemoryLimiter.limit(key, maxRequests, windowSeconds * 1000);
}

/**
 * Middleware para NextJS Route Handlers
 * Uso: await checkRateLimit(request);
 */
export async function checkRateLimit(
  request: Request,
  options: {
    maxRequests?: number;
    windowSeconds?: number;
    keyExtractor?: (req: Request) => string;
  } = {}
): Promise<{ allowed: boolean; response?: Response }> {
  const keyExtractor =
    options.keyExtractor ??
    ((req: Request) => req.headers.get("x-forwarded-for") || "unknown");

  const key = `rate-limit:${keyExtractor(request)}`;
  const result = await rateLimit(key, {
    maxRequests: options.maxRequests,
    windowSeconds: options.windowSeconds,
  });

  const headers = {
    "RateLimit-Limit": result.limit.toString(),
    "RateLimit-Remaining": result.remaining.toString(),
    "RateLimit-Reset": result.resetAt.toISOString(),
  };

  if (!result.success) {
    return {
      allowed: false,
      response: new Response(
        JSON.stringify({
          error: "Demasiadas solicitudes. Intenta más tarde.",
        }),
        {
          status: 429,
          headers,
        }
      ),
    };
  }

  return { allowed: true };
}

/**
 * Helper para crear un rate limiter específico por endpoint
 */
export function createEndpointRateLimiter(
  maxRequests: number,
  windowSeconds: number
) {
  return async (request: Request) => {
    return checkRateLimit(request, {
      maxRequests,
      windowSeconds,
      keyExtractor: (req) => {
        // Limitar por IP para requests públicas
        return req.headers.get("x-forwarded-for") || "unknown";
      },
    });
  };
}
