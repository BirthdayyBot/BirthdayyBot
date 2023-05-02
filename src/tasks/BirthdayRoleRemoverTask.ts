import { ApplyOptions } from '@sapphire/decorators';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import type { Snowflake } from 'discord.js';
import { getGuildMember, getGuildRole } from '../lib/discord';

export interface RoleRemovePayload {
	userId: Snowflake;
	guildId: Snowflake;
	roleId: Snowflake;
}

@ApplyOptions<ScheduledTask.Options>({ name: 'BirthdayRoleRemoverTask', bullJobsOptions: { removeOnComplete: true } })
export class BirthdayRoleRemoverTask extends ScheduledTask {
	public async run(payload: RoleRemovePayload) {
		const { userId, guildId, roleId } = payload;
		const member = await getGuildMember(guildId, userId);
		const role = await getGuildRole(guildId, roleId);

		if (!member)
			this.container.logger.warn(`[BirthdayRoleRemoverTask]: Member undefined: ${JSON.stringify(member)}`);
		if (!guildId)
			this.container.logger.warn(`[BirthdayRoleRemoverTask]: GuildId undefined: ${JSON.stringify(guildId)}`);
		if (!role) this.container.logger.warn(`[BirthdayRoleRemoverTask]: Role undefined: ${JSON.stringify(role)}`);
		if (!member || !guildId || !role) return;

		if (!member.roles.cache.has(roleId)) {
			return this.container.logger.info(
				`[BirthdayRoleRemoverTask]: Role ${roleId} not found on member ${userId}`,
			);
		}

		await member.roles.remove(role, 'Birthday Role Removal').catch(() => null);
		this.container.logger.debug(
			`[BirthdayRoleRemoverTask]: Removed role ${roleId} from user ${userId}in guild ${guildId}`,
		);
		this.container.logger.info(`[BirthdayRoleRemoverTask] Removed role ${role.name} from user ${member.user.id}`);
	}
}
