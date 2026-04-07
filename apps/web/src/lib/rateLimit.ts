/**
 * Rate Limiting Middleware
 * - Producción: Upstash Redis (escalable para múltiples workers)
 * - Desarrollo: In-Memory (local testing)
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type RateLimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: Date;
};

/**
 * Simple in-memory rate limiter (solo para desarrollo)
 * NO usar en producción con múltiples workers/instancias
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

// Instancia global
const inMemoryLimiter = new InMemoryRateLimiter();

// Instancia de Upstash Redis (si está configurado)
let upstashLimiter: Ratelimit | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    upstashLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, "60s"),
    });
  } catch (error) {
    console.warn("Upstash Redis no disponible, usando in-memory limiter");
  }
}

/**
 * Rate limiter principal
 * Usa Upstash Redis si está disponible, sino in-memory
 */
export async function rateLimit(
  key: string,
  options: {
    maxRequests?: number;
    windowSeconds?: number;
  } = {}
): Promise<RateLimitResult> {
  // Si Upstash está disponible, usarlo
  if (upstashLimiter) {
    try {
      const response = await upstashLimiter.limit(key);
      return {
        success: response.success,
        limit: response.limit ?? 30,
        remaining: response.remaining ?? 0,
        resetAt: new Date(Date.now() + 60000),
      };
    } catch (error) {
      console.warn("Error en Upstash limiter, fallback a in-memory", error);
    }
  }

  // Fallback a in-memory
  const maxRequests = options.maxRequests ?? 30;
  const windowSeconds = options.windowSeconds ?? 60;
  return inMemoryLimiter.limit(key, maxRequests, windowSeconds * 1000);
}

/**
 * Middleware para NextJS Route Handlers
 * Uso: const { allowed, response } = await checkRateLimit(request, { identifier: "user-id", limit: 10, window: 3600 });
 */
export async function checkRateLimit(
  request: Request,
  options: {
    identifier?: string;
    limit?: number;
    window?: number;
  } = {}
): Promise<{ allowed: boolean; response?: Response }> {
  const identifier =
    options.identifier ??
    request.headers.get("x-forwarded-for") ??
    "unknown";

  const key = `rate-limit:${identifier}`;
  const result = await rateLimit(key, {
    maxRequests: options.limit ?? 30,
    windowSeconds: options.window ?? 60,
  });

  const headers = {
    "RateLimit-Limit": result.limit.toString(),
    "RateLimit-Remaining": Math.max(0, result.remaining).toString(),
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
