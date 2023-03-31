import { ApplyOptions } from '@sapphire/decorators';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import type { GuildMember, Role } from 'discord.js';

interface RoleRemovePayload {
	member: GuildMember;
	guildId: string;
	role: Role;
}

@ApplyOptions<ScheduledTask.Options>({ name: 'BirthdayRoleRemoverTask', bullJobsOptions: { removeOnComplete: true } })
export class BirthdayRoleRemoverTask extends ScheduledTask {
	public async run(payload: RoleRemovePayload) {
		const { member, guildId, role } = payload;

		if (!member || !guildId || !role) return this.container.logger.debug(`[BirthdayRoleRemoverTask]: ${JSON.stringify(payload)}`);
		this.container.logger.debug(`[BirthdayRoleRemoverTask]: ${guildId} Role: ${JSON.stringify(role)} Member: ${member.id}`);

		if (!member.roles.cache.has(role.id)) {
			return this.container.logger.info(`[BirthdayRoleRemoverTask]: Role ${role.name} not found on member ${member.user.id}`);
		}

		await member.roles.remove(role, 'Birthday Role Removal').catch(() => null);
		this.container.logger.info(`[BirthdayRoleRemoverTask] Removed role ${role.name} from user ${member.user.id}`);
	}
}
