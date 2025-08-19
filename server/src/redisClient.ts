import { createClient } from 'redis'

const url = process.env.REDIS_URL || 'redis://localhost:6379'

export const redis = createClient({ url })

redis.on('error', (err) => {
  console.error('[Redis] Client Error:', err)
})

let connecting: Promise<void> | null = null

export async function ensureRedis() {
  if (redis.isOpen) return
  if (!connecting) connecting = redis.connect().then(() => undefined)
  return connecting
}
