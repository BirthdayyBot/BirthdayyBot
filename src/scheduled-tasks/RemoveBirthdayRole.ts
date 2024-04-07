import { seconds } from '#lib/utils/common/times';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import { sleep } from '@sapphire/utilities';
import { PermissionFlagsBits, PermissionsBitField } from 'discord.js';

export class UserTask extends ScheduledTask {
	private readonly requiredPermissions = new PermissionsBitField(PermissionFlagsBits.ManageRoles);

	public async run(data: RemoveBirthdayRoleData): Promise<unknown> {
		// Get and check the guild:
		const guild = this.container.client.guilds.cache.get(data.guildID);
		if (!guild) return null;

		// If the guild is not available, re-schedule the task by creating
		// another with the same data but happening 30 seconds later.
		if (!guild.available) {
			await sleep(seconds(30));
			return this.run(data);
		}

		// Get and check the member:
		const member = await guild.members.fetch(data.userID);
		if (!member) return null;

		// Get and check the role:
		const role = guild.roles.cache.get(data.roleID);
		if (!role) return null;

		const me = await guild.members.fetchMe();
		if (me.permissions.has(this.requiredPermissions) && me.roles.highest.position > role.position) {
			try {
				await member.roles.remove(role).catch(() => null);
			} catch (error: unknown) {
				if ((error as Error).name === 'AbortError') {
					// Retry again in 5 seconds if something bad happened
					await sleep(seconds(5));
					return this.run(data);
				}

				this.container.logger.fatal(error);
			}
		}

		return null;
	}
}

interface RemoveBirthdayRoleData {
	guildID: string;
	roleID: string;
	userID: string;
}

declare module '@sapphire/plugin-scheduled-tasks' {
	interface ScheduledTasks {
		RemoveBirthdayRole: RemoveBirthdayRoleData;
	}
}
//
