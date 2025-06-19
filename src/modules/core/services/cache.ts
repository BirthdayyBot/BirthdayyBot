import { BentoCache, bentostore } from 'bentocache';
import { memoryDriver } from 'bentocache/drivers/memory';
import { redisDriver } from 'bentocache/drivers/redis';

export const bento = new BentoCache({
	default: 'memory',
	stores: {
		// A first cache store named "myCache" using
		// only L1 in-memory cache
		memory: bentostore().useL1Layer(memoryDriver({ maxSize: '10mb' })),

		// A second cache store named "multitier" using
		// a in-memory cache as L1 and a Redis cache as L2
		multitier: bentostore()
			.useL1Layer(memoryDriver({ maxSize: '10mb' }))
			.useL2Layer(
				redisDriver({
					connection: {
						host: process.env.REDIS_HOST || 'localhost',
						port: Number(process.env.REDIS_PORT || '6379')
					}
				})
			)
	}
});
