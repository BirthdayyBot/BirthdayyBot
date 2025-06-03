import type { Identifiable } from '#root/core/domain/entities/identifiable';
import type { TimestampedEntity } from '#root/core/domain/entities/timestamped_entity';
import type { WithBirthdays } from '#root/core/domain/entities/with_birthdays';

/**
 * GuildConfig entity representing configuration for a Discord server/guild
 */
export interface GuildConfig extends TimestampedEntity, WithBirthdays, Identifiable {
	/** ID of the user who invited the bot */
	inviter: string;

	/** Channel ID where birthday announcements are posted */
	announcementChannel?: string;
	/** Custom message template for birthday announcements */
	announcementMessage?: string;

	/** Channel ID where birthday overview is displayed */
	overviewChannel?: string;
	/** Message ID of the birthday overview */
	overviewMessage?: string;

	/** Role ID assigned to users on their birthday */
	birthdayRole?: string;
	/** Role ID that gets pinged for birthday announcements */
	birthdayPingRole?: string;

	/** Channel ID for logging bot actions */
	logChannel?: string;

	/** Timezone for this guild (used for birthday calculations) */
	timezone: string;
	/** Whether this guild has premium features enabled */
	premium: boolean;
	/** Language code for localization */
	language: string;
	/** Whether bot features are disabled in this guild */
	disabled: boolean;
}

/**
 * Type for creating a new guild configuration
 * Makes timestamps and related collections optional
 */
export type CreateGuildConfigData = Omit<GuildConfig, keyof TimestampedEntity | keyof WithBirthdays> &
	Partial<TimestampedEntity> &
	Partial<WithBirthdays>;

/**
 * Type for updating guild configuration
 * Excludes identifier and timestamp fields
 */
export type GuildConfigUpdateData = Partial<Omit<GuildConfig, 'id' | keyof TimestampedEntity>>;
