import { container } from '@sapphire/framework';

/**
    Add a role to a user in a Discord guild.
    @param user_id - The ID of the user to add the role to.
    @param role_id - The ID of the role to add to the user.
    @param guild_id - The ID of the guild the user and role are in.
    */
export async function addRoleToUser(user_id: string, role_id: string, guild_id: string) {
	try {
		const guild = await container.client.guilds.fetch(guild_id);
		if (!guild) throw new Error('Guild not found');

		const member = await guild.members.fetch(user_id);
		if (!member) throw new Error('Member not found');

		const role = await guild.roles.fetch(role_id);
		if (!role) throw new Error('Role not found');

		// Add the role to the member
		await member.roles.add(role);
		// TODO: #10 Create a LogHandler that works with the DEBUG env variable
		container.logger.info(`Successfully added role ${role.name} to user ${member.user.id}`);
	} catch (error: any) {
		if (error.message.includes('Missing Permissions')) {
			container.logger.error(`Failed to add role cause I am missing Permissions! Guild: ${guild_id} User: ${user_id} Role: ${role_id}`);
			return;
		}
		container.logger.error(`Failed to add role: ${error}`);
	}
}
