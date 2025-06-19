import type { PrismaClient } from '@prisma/client';
import { BaseRepository } from './base_repository.js';

export abstract class PrismaRepository<T, K> extends BaseRepository<T, K> {
	public constructor(public readonly db: PrismaClient) {
		super();
	}
}
