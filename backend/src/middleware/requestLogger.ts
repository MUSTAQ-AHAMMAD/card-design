import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

/**
 * Request logging middleware
 * Logs API requests and creates activity logs for authenticated requests
 */
export const requestLogger = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();

  // Capture the original send function
  const originalSend = res.send;

  // Override the send function to log after response
  res.send = function (data: any) {
    res.send = originalSend; // Restore original send
    const responseTime = Date.now() - startTime;

    // Log to console
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} - ${responseTime}ms - IP: ${req.ip}`
    );

    // Async logging to database (don't block response)
    logToDatabase(req, res.statusCode, responseTime).catch((error) => {
      console.error('Failed to log request to database:', error);
    });

    return originalSend.call(this, data);
  };

  next();
};

/**
 * Log request to database
 */
async function logToDatabase(req: Request, statusCode: number, responseTime: number) {
  // Only log authenticated API requests (not health checks, static files, etc.)
  if (!req.path.startsWith('/api/') || req.path === '/api/health') {
    return;
  }

  try {
    const action = getActionFromMethod(req.method);
    const entityType = extractEntityType(req.path);

    // Only create activity log for authenticated users
    if (req.user?.userId) {
      await prisma.activityLog.create({
        data: {
          userId: req.user.userId,
          action,
          entityType,
          description: `${req.method} ${req.path} - ${statusCode}`,
          metadata: JSON.stringify({
            method: req.method,
            path: req.path,
            statusCode,
            responseTime,
            query: req.query,
            // Don't log sensitive data like passwords
            body: sanitizeRequestBody(req.body)
          }),
          ipAddress: req.ip,
          userAgent: req.get('user-agent')
        }
      });
    }
  } catch (error) {
    // Silently fail - don't break the request flow
    console.error('Failed to log to database:', error);
  }
}

/**
 * Map HTTP methods to action types
 */
function getActionFromMethod(method: string): string {
  const methodMap: Record<string, string> = {
    GET: 'VIEW',
    POST: 'CREATE',
    PUT: 'UPDATE',
    PATCH: 'UPDATE',
    DELETE: 'DELETE'
  };

  return methodMap[method.toUpperCase()] || 'VIEW';
}

/**
 * Extract entity type from request path
 */
function extractEntityType(path: string): string {
  // Remove /api/ prefix and get the first segment
  const segments = path.replace(/^\/api\//, '').split('/');
  const entityMap: Record<string, string> = {
    users: 'user',
    templates: 'template',
    'gift-cards': 'gift-card',
    brands: 'brand',
    employees: 'employee',
    email: 'email',
    analytics: 'analytics',
    ai: 'ai-service',
    auth: 'auth'
  };

  return entityMap[segments[0]] || segments[0] || 'unknown';
}

/**
 * Remove sensitive data from request body
 */
function sanitizeRequestBody(body: any): any {
  if (!body || typeof body !== 'object') {
    return body;
  }

  const sensitiveFields = ['password', 'token', 'refreshToken', 'accessToken', 'resetToken'];
  const sanitized = { ...body };

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }

  return sanitized;
}
