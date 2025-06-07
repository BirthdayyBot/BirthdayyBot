import { BaseService } from './base_service.js';
import type { GuildConfig } from '#domain/entities/guild/guild-config';
import type { GuildConfigRepository } from '#domain/repositories/guild-config_repository';
import type { CacheManager } from '#domain/ports/cache_manager';

export class GuildConfigService extends BaseService<GuildConfig, GuildConfigRepository, CacheManager<GuildConfig>> {
	public constructor(guildConfigRepository: GuildConfigRepository, cacheManager: CacheManager<GuildConfig>) {
		super('guild', guildConfigRepository, cacheManager);
	}
}
