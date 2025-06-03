import type { CreateGuildConfigData, GuildConfig, GuildConfigUpdateData } from '#domain/entities/guild-config';
import type { SingleIdRepository } from '#domain/repositories/base_repository';

/**
 * Repository interface for managing guild configurations
 */
export interface GuildConfigRepository extends SingleIdRepository<GuildConfig> {
	/**
	 * Finds all guilds with premium status
	 * @returns Array of premium guild configurations
	 */
	findPremiumGuilds(): Promise<GuildConfig[]>;

	/**
	 * Finds all guild configurations by specific timezone
	 * @param timezone - The timezone string
	 * @returns Array of guild configurations
	 */
	findByTimezone(timezone: string): Promise<GuildConfig[]>;

	/**
	 * Finds all guild configurations by specific language
	 * @param language - The language code
	 * @returns Array of guild configurations
	 */
	findByLanguage(language: string): Promise<GuildConfig[]>;

	/**
	 * Finds all guild configurations by inviter user ID
	 * @param inviterId - The Discord user ID of the inviter
	 * @returns Array of guild configurations
	 */
	findByInviter(inviterId: string): Promise<GuildConfig[]>;

	/**
	 * Enables a previously disabled guild configuration
	 * @param guildId - The Discord guild ID
	 * @returns The updated guild configuration or null if not found
	 */
	enable(guildId: string): Promise<GuildConfig | null>;

	/**
	 * Disables a guild configuration without deleting it
	 * @param guildId - The Discord guild ID
	 * @returns The updated guild configuration or null if not found
	 */
	disable(guildId: string): Promise<GuildConfig | null>;

	/**
	 * Updates premium status for a guild
	 * @param guildId - The Discord guild ID
	 * @param isPremium - The premium status to set
	 * @returns The updated guild configuration
	 */
	updatePremiumStatus(guildId: string, isPremium: boolean): Promise<GuildConfig>;

	/**
	 * Creates a new guild configuration
	 * @param data - The guild configuration data
	 * @returns The created guild configuration
	 */
	create(data: CreateGuildConfigData): Promise<GuildConfig>;

	/**
	 * Updates a guild configuration
	 * @param guildId - The Discord guild ID
	 * @param data - The data to update
	 * @returns The updated guild configuration
	 */
	update(guildId: string, data: GuildConfigUpdateData): Promise<GuildConfig>;

	/**
	 * Counts guilds by premium status
	 * @param premiumOnly - Whether to count only premium guilds
	 * @returns The count of guilds
	 */
	countByPremiumStatus(premiumOnly: boolean): Promise<number>;
}
