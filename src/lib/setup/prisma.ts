import { PrismaClient } from '@prisma/client';
import { container } from '@sapphire/framework';

const datasourceUrl = process.env.DB_URL ?? process.env.DATABASE_URL;

container.prisma = new PrismaClient({
	datasources: datasourceUrl
		? {
				db: {
					url: datasourceUrl
				}
			}
		: undefined,
	log: process.env.PRISMA_DEBUG_LOGS === 'true' ? ['query', 'info', 'warn', 'error'] : undefined
});

declare module '@sapphire/pieces' {
	interface Container {
		prisma: PrismaClient;
	}
}
