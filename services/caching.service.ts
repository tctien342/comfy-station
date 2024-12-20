import { EClientStatus } from '@/entities/enum'
import { TMonitorEvent } from '@saintno/comfyui-sdk'
import { Logger } from '@saintno/needed-tools'
import { LRUCache } from 'lru-cache'
import { createClient, RedisClientType } from 'redis' // Assuming you have the Redis package installed

const REDIS_CONF = process.env.REDIS

export type TCachingKeyMap = {
  CLIENT_STATUS: CustomEvent<EClientStatus>
  SYSTEM_MONITOR: CustomEvent<TMonitorEvent>
  LAST_TASK_CLIENT: CustomEvent<number>
  PREVIEW: CustomEvent<{ blob64: string }>
  HISTORY_LIST: CustomEvent<number>
  HISTORY_ITEM: CustomEvent<number>
  HISTORY_ITEM_PREVIEW: CustomEvent<Blob>
  WORKFLOW: CustomEvent<number>
  USER_BALANCE: CustomEvent<number>
  USER_NOTIFICATION: CustomEvent<number>
  USER_EXECUTING_TASK: CustomEvent<number>
}

class CachingService extends EventTarget {
  private logger: Logger
  private cache: RedisClientType<any> | LRUCache<string, string>

  static getInstance() {
    if (!(global as any).__CachingService__) {
      ;(global as any).__CachingService__ = new CachingService()
    }
    return (global as any).__CachingService__ as CachingService
  }

  private async destroy() {
    if (this.cache instanceof LRUCache) {
      this.cache.clear()
    } else {
      await this.cache.quit()
    }
  }

  private listenSystemKilled() {
    // process.on('SIGINT', () => {
    //   this.logger.i('listenSystemKilled', 'SIGINT signal received.')
    //   this.destroy().then(() => {
    //     process.exit(0)
    //   })
    // })
    // process.on('SIGTERM', () => {
    //   this.logger.i('listenSystemKilled', 'SIGTERM signal received.')
    //   this.destroy().then(() => {
    //     process.exit(0)
    //   })
    // })
  }

  private constructor() {
    super()
    this.logger = new Logger('CachingService')
    if (REDIS_CONF) {
      // Use Redis as the caching mechanism
      this.cache = createClient()
      this.logger.i('init', 'Use Redis as the caching mechanism')
      this.cache.connect().then(() => {
        this.logger.i('init', 'Redis connection established')
      })
    } else {
      // Use in-memory cache
      this.cache = new LRUCache({
        ttl: 1000 * 60 * 60, // 1 Hour cache
        ttlAutopurge: true
      })
      this.logger.i('init', 'Use memory as the caching mechanism')
    }
    this.listenSystemKilled()
  }

  async set(category: keyof TCachingKeyMap, id: string | number, value: any) {
    const key = `${category}:${id}`
    if (this.cache instanceof LRUCache) {
      this.dispatchEvent(new CustomEvent(key, { detail: value }))
      this.dispatchEvent(
        new CustomEvent(category, {
          detail: {
            id,
            value
          }
        })
      )
    } else {
      await this.cache.publish(key, JSON.stringify(value))
      await this.cache.publish(category, JSON.stringify({ id, value }))
    }
    await this.cache.set(key, JSON.stringify(value))
  }

  async get<K extends keyof TCachingKeyMap>(
    category: K,
    id: string | number
  ): Promise<TCachingKeyMap[K]['detail'] | null> {
    const key = `${category}:${id}`
    const value = await this.cache.get(key)
    if (!value) return null
    return JSON.parse(value)
  }

  /**
   * Registers an event listener for a specific category and id.
   *
   * @template K - The type of the category key.
   * @param {K} category - The category key.
   * @param {string | number} id - The id of the event.
   * @param {(event: TCachingKeyMap[K]) => void} callback - The callback function to be executed when the event is triggered.
   * @param {AddEventListenerOptions | boolean} [options] - The options for the event listener.
   * @returns {() => void} - A function that can be called to remove the event listener.
   */
  public on<K extends keyof TCachingKeyMap>(
    category: K,
    id: string | number,
    callback: (event: TCachingKeyMap[K]) => void,
    options?: AddEventListenerOptions | boolean
  ): () => void {
    const key = `${category}:${id}`
    this.addEventListener(key, callback as any, options)
    // If the cache is not an instance of LRUCache, we need to subscribe to the cache
    if (!(this.cache instanceof LRUCache)) {
      const cacher = this.cache
      const fn = (value: string) => {
        this.dispatchEvent(new CustomEvent(key, { detail: JSON.parse(value) }))
      }
      cacher.subscribe(key, fn)
      return () => {
        this.off(category, id, callback)
        cacher.unsubscribe(key, fn)
      }
    }
    return () => {
      this.off(category, id, callback)
    }
  }

  public onCategory<K extends keyof TCachingKeyMap>(
    category: K,
    callback: (
      event: CustomEvent<{
        id: string | number
        value: TCachingKeyMap[K]['detail']
      }>
    ) => void,
    options?: AddEventListenerOptions | boolean
  ): () => void {
    this.addEventListener(category, callback as any, options)
    if (!(this.cache instanceof LRUCache)) {
      const cacher = this.cache
      const fn = (value: string) => {
        this.dispatchEvent(new CustomEvent(category, { detail: JSON.parse(value) }))
      }
      cacher.subscribe(category, fn)
      return () => {
        this.offCategory(category, callback)
        cacher.unsubscribe(category, fn)
      }
    }
    return () => {
      this.offCategory(category, callback)
    }
  }

  public offCategory<K extends keyof TCachingKeyMap>(
    category: K,
    callback: (
      event: CustomEvent<{
        id: string | number
        value: TCachingKeyMap[K]['detail']
      }>
    ) => void
  ) {
    this.removeEventListener(category, callback as any)
  }

  /**
   * Removes an event listener for a specific category and ID.
   *
   * @template K - The type of the category key.
   * @param {K} category - The category key.
   * @param {string | number} id - The ID of the event listener.
   * @param {(event: TCachingKeyMap[K]) => void} callback - The callback function to be removed.
   */
  public off<K extends keyof TCachingKeyMap>(
    category: K,
    id: string | number,
    callback: (event: TCachingKeyMap[K]) => void
  ) {
    const key = `${category}:${id}`
    this.removeEventListener(key, callback as any)
  }
}

export default CachingService
