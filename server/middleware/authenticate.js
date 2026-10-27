import jwt from 'jsonwebtoken'

export function createAuthenticate(secret = process.env.JWT_SECRET) {
  if (!secret) {
    throw new Error('JWT_SECRET is required to authenticate API requests.')
  }

  return function authenticate(request, response, next) {
    const authorization = request.get('authorization')
    const [scheme, token] = authorization?.split(' ') ?? []

    if (scheme !== 'Bearer' || !token) {
      return response.status(401).json({ error: 'Authentication is required.' })
    }

    try {
      const payload = jwt.verify(token, secret)
      if (typeof payload !== 'object' || typeof payload.sub !== 'string') {
        return response.status(401).json({ error: 'Authentication token is invalid.' })
      }

      request.farmerId = payload.sub
      return next()
    } catch {
      return response.status(401).json({ error: 'Authentication token is invalid or expired.' })
    }
  }
}
