import type { GuildConfig, GuildConfigCreateInput, GuildConfigUpdateInput } from '../GuildConfig.js';

export interface GuildConfigRepository {
	findById(id: string): Promise<GuildConfig | null>;
	findMany(ids: string[]): Promise<GuildConfig[]>;
	create(data: GuildConfigCreateInput): Promise<GuildConfig>;
	update(id: string, data: GuildConfigUpdateInput): Promise<GuildConfig>;
	delete(id: string): Promise<boolean>;
	setDisabled(id: string, disabled: boolean): Promise<GuildConfig>;
}
