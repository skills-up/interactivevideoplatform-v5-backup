import crypto from "crypto"

/**
 * Generate a CSRF token
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

/**
 * Verify a CSRF token
 */
export function verifyCsrfToken(token: string, storedToken: string): boolean {
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(storedToken))
}

/**
 * Get Content Security Policy
 */
export function getContentSecurityPolicy(): string {
  return "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https://*; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*; media-src 'self' https://*; object-src 'none'; frame-src 'self' https://www.youtube.com;"
}

const rateLimitStore = new Map()

/**
 * Check rate limit
 */
export function checkRateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const key = `ratelimit:${ip}`

  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, {
      count: 1,
      startTime: now,
    })
    return true
  }

  const record = rateLimitStore.get(key)
  if (now - record.startTime > windowMs) {
    rateLimitStore.set(key, {
      count: 1,
      startTime: now,
    })
    return true
  }

  if (record.count < limit) {
    record.count++
    rateLimitStore.set(key, record)
    return true
  }

  return false
}

