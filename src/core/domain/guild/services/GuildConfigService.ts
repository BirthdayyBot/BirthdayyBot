import type { GuildConfig, GuildConfigCreateInput, GuildConfigUpdateInput } from '../GuildConfig.js';
import type { GuildConfigRepository } from '../ports/GuildConfigRepository.js';

export class GuildConfigService {
	public constructor(private readonly repository: GuildConfigRepository) {}

	public async getGuildConfig(id: string): Promise<GuildConfig | null> {
		return this.repository.findById(id);
	}

	public async createGuildConfig(data: GuildConfigCreateInput): Promise<GuildConfig> {
		return this.repository.create(data);
	}

	public async updateGuildConfig(id: string, data: GuildConfigUpdateInput): Promise<GuildConfig> {
		return this.repository.update(id, data);
	}

	public async deleteGuildConfig(id: string): Promise<boolean> {
		return this.repository.delete(id);
	}

	public async setGuildDisabled(id: string, disabled: boolean): Promise<GuildConfig> {
		return this.repository.setDisabled(id, disabled);
	}
}
