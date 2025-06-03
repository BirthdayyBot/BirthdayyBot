import type { GuildConfig } from '#domain/entities/guild/guild-config';
import type { GuildConfigRepository } from '#domain/repositories/guild-config_repository';
import type { CacheManager } from '#domain/ports/cache_manager';
import type { Repository } from '#domain/repositories/base_repository';

export class GuildConfigService {
	public constructor(
		private readonly guildConfigRepository: GuildConfigRepository,
		private readonly cacheManager: CacheManager<string, GuildConfig>
	) {}

	public async findOrCreate(guildId: string, defaultData: Repository.CreateData<GuildConfig>): Promise<GuildConfig> {
		const cacheKey = this.getCacheKey(guildId);
		let config = await this.cacheManager.get(cacheKey);
		if (!config) {
			config = await this.guildConfigRepository.findOrCreate(guildId, defaultData);
			await this.cacheManager.set(cacheKey, config);
		}
		return config;
	}

	public async update(guildId: string, data: Repository.UpdateData<GuildConfig>): Promise<GuildConfig | null> {
		const updated = await this.guildConfigRepository.update(guildId, data);
		const cacheKey = this.getCacheKey(guildId);
		if (updated) {
			await this.cacheManager.invalidate(cacheKey);
			await this.cacheManager.set(cacheKey, updated);
		}
		return updated;
	}

	public async delete(guildId: string): Promise<void> {
		await this.guildConfigRepository.deleteById(guildId);
		const cacheKey = this.getCacheKey(guildId);
		await this.cacheManager.delete(cacheKey);
	}

	public async find(guildId: string): Promise<GuildConfig | null> {
		const cacheKey = this.getCacheKey(guildId);
		let config = await this.cacheManager.get(cacheKey);
		if (!config) {
			config = await this.guildConfigRepository.findById(guildId);
			if (!config) return null;
			await this.cacheManager.set(cacheKey, config);
		}
		return config;
	}

	private getCacheKey(guildId: string): string {
		return `guild:${guildId}`;
	}
}
