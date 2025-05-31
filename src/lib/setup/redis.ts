import { envParseInteger, envParseNumber, envParseString } from '@skyra/env-utilities';
import { Redis } from 'ioredis';

const { REDIS_USERNAME, REDIS_PASSWORD } = process.env;

export const redis = new Redis({
	port: envParseNumber('REDIS_PORT', 6379),
	password: REDIS_PASSWORD,
	host: envParseString('REDIS_HOST', 'localhost'),
	db: envParseInteger('REDIS_DB'),
	username: REDIS_USERNAME
});
