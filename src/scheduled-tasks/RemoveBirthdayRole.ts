import { seconds } from '#utils/common';
import { ApplyOptions } from '@sapphire/decorators';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import { sleep } from '@sapphire/utilities';
import { PermissionFlagsBits, PermissionsBitField } from 'discord.js';

@ApplyOptions<ScheduledTask.Options>({ name: 'RemoveBirthdayRoleTask', customJobOptions: { removeOnComplete: true } })
export class RemoveBirthdayRoleTask extends ScheduledTask {
	private readonly requiredPermissions = new PermissionsBitField(PermissionFlagsBits.ManageRoles);

	public async run(data: { guildID: string; userID: string; roleID: string }): Promise<null> {
		// Get and check the guild:
		const guild = this.container.client.guilds.cache.get(data.guildID);
		if (!guild) return null;

		// If the guild is not available, re-schedule the task
		if (!guild.available) {
			await sleep(seconds(30));
			await this.container.tasks.create({ name: 'RemoveBirthdayRoleTask', payload: data }, seconds(30));
			return null;
		}

		// Get and check the member:
		const member = await guild.members.fetch(data.userID).catch(() => null);
		if (!member) return null;

		// Get and check the role:
		const role = guild.roles.cache.get(data.roleID);
		if (!role) return null;

		const me = await guild.members.fetchMe();
		if (me.permissions.has(this.requiredPermissions) && me.roles.highest.position > role.position) {
			try {
				await member.roles.remove(role);
			} catch (error) {
				if ((error as Error).name === 'AbortError') {
					// Retry again in 5 seconds if something bad happened
					await this.container.tasks.create({ name: 'RemoveBirthdayRoleTask', payload: data }, seconds(5));
					return null;
				}

				this.container.logger.fatal(error);
			}
		}

		return null;
	}
}
