import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';

@Injectable()
export class RedisService {
  @Inject('REDIS_CLIENT')
  private readonly redisClient: RedisClientType;

  /**
   * 读取 key 值
   * @param key
   */
  async get(key: string) {
    return await this.redisClient.get(key);
  }

  /**
   *  设置 key 值
   * @param key
   * @param value
   * @param ttl
   */
  async set(key: string, value: string | number, ttl?: number) {
    let result: string | number | boolean;
    result = await this.redisClient.set(key, value);

    if (ttl) {
      result = await this.redisClient.expire(key, ttl);
    }

    return result;
  }

  /**
   * 删除 key
   */
  async del(key: string | string[]) {
    return await this.redisClient.del(key);
  }
}
