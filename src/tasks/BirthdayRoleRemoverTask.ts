import { ApplyOptions } from '@sapphire/decorators';
import { container } from '@sapphire/framework';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import type { Snowflake } from 'discord.js';
import { DiscordAPIError } from 'discord.js';
import { RESTJSONErrorCodes } from 'discord-api-types/v9';
import { fromDiscordAPIError } from '../lib/utils/ErrorLogger';

export interface RoleRemovePayload {
	memberId: Snowflake;
	guildId: Snowflake;
	roleId: Snowflake;
}

@ApplyOptions<ScheduledTask.Options>({ name: 'BirthdayRoleRemoverTask', bullJobsOptions: { removeOnComplete: true } })
export class BirthdayRoleRemoverTask extends ScheduledTask {
	public async run({ memberId: userId, guildId, roleId }: RoleRemovePayload) {
		let guild;
		try {
			guild = await container.client.guilds.fetch(guildId);
		} catch (error) {
			if (error instanceof DiscordAPIError && error.code === RESTJSONErrorCodes.UnknownGuild) {
				container.logger.warn(`[BirthdayRoleRemoverTask] Guild not found: ${guildId}`);
				return;
			}
			const discordError = fromDiscordAPIError(error as DiscordAPIError, { guildId });
			container.errorLogger.handle(discordError, {
				logSeverity: 'warn',
				guildId,
			});
			return;
		}

		let member;
		try {
			member = await guild.members.fetch(userId);
		} catch (error) {
			if (error instanceof DiscordAPIError && error.code === RESTJSONErrorCodes.UnknownMember) {
				container.logger.warn(`[BirthdayRoleRemoverTask] Member not found: ${userId} in guild ${guildId}`);
				return;
			}
			const discordError = fromDiscordAPIError(error as DiscordAPIError, { guildId, userId });
			container.errorLogger.handle(discordError, {
				logSeverity: 'warn',
				guildId,
				userId,
			});
			return;
		}

		let role;
		try {
			role = await guild.roles.fetch(roleId);
		} catch (error) {
			if (error instanceof DiscordAPIError && error.code === RESTJSONErrorCodes.UnknownRole) {
				container.logger.warn(`[BirthdayRoleRemoverTask] Role not found: ${roleId} in guild ${guildId}`);
				return;
			}
			const discordError = fromDiscordAPIError(error as DiscordAPIError, { guildId, roleId });
			container.errorLogger.handle(discordError, {
				logSeverity: 'warn',
				guildId,
			});
			return;
		}

		if (!member?.roles?.cache.has(roleId)) {
			return this.container.logger.info(
				`[BirthdayRoleRemoverTask]: Role ${roleId} not found on member ${userId}`,
			);
		}

		if (!role) {
			container.logger.warn(`[BirthdayRoleRemoverTask] Role is null after fetch for roleId: ${roleId}`);
			return;
		}

		await member.roles.remove(role, 'Birthday Role Removal').catch(() => null);
		this.container.logger.debug(
			`[BirthdayRoleRemoverTask]: Removed role ${roleId} from user ${userId}in guild ${guildId}`,
		);
		this.container.logger.info(`[BirthdayRoleRemoverTask] Removed role ${role.name} from user ${member.user.id}`);
	}
}
