import thinking from '#lib/discord/thinking';
import { defaultClientPermissions, defaultUserPermissions } from '#lib/types';
import { Emojis, IMG_BLOCK, generateDefaultEmbed, reply } from '#utils';
import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';
import type { Blacklist } from '@prisma/client';
import { RequiresClientPermissions, RequiresUserPermissions } from '@sapphire/decorators';
import { time, userMention } from 'discord.js';
import { listBlacklistSubCommand } from './blacklist.js';

@RegisterSubCommand('blacklist', (builder) => listBlacklistSubCommand(builder))
export class ListCommand extends Command {
	@RequiresUserPermissions(defaultUserPermissions)
	@RequiresClientPermissions(defaultClientPermissions)
	public override async chatInputRun(interaction: Command.ChatInputInteraction<'cached'>) {
		await thinking(interaction);
		const blacklistedUsers = await this.container.utilities.blacklist.get.BlacklistByGuildId(interaction.guildId);
		const description = processBlacklistedUsers(blacklistedUsers);

		return reply({
			embeds: [
				generateDefaultEmbed({
					description,
					thumbnail: { url: IMG_BLOCK },
					title: 'Blacklisted Users',
				}),
			],
		});

		function processBlacklistedUsers(users: Blacklist[]): string {
			if (users.length === 0) {
				return `${Emojis.ArrowRight}No users on the blacklist.`;
			}
			const formattedUsers = users.map((user) => {
				const { userId, addedAt } = user;
				const formattedDate = time(Math.floor(addedAt.getTime() / 1000), 'D');
				return `${userMention(userId)} - ${formattedDate}`;
			});

			const userList = formattedUsers.join('\n');
			return `${userList}`;
		}
	}
}
