import type { GuildConfig } from '#domain/entities/guild/guild-config';
import type { BaseRepository } from '#domain/repositories/base_repository';

/**
 * Repository interface for managing guild configurations
 */
export interface GuildConfigRepository extends BaseRepository<GuildConfig> {}
