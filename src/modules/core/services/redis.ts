import { envParseInteger, envParseNumber, envParseString } from '@skyra/env-utilities';
import type { RedisOptions } from 'ioredis';

export const redisConfigOptions: RedisOptions = {
	host: envParseString('REDIS_HOST', 'localhost'),
	port: envParseNumber('REDIS_PORT', 6379),
	username: envParseString('REDIS_USERNAME', ''),
	password: envParseString('REDIS_PASSWORD', ''),
	db: envParseInteger('REDIS_DB', 0)
};
