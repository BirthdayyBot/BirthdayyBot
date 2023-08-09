import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';
import type { Blacklist } from '@prisma/client';
import { time, userMention } from 'discord.js';
import { BirthdayyEmojis, IMG_BLOCK } from '../../../helpers';
import { reply } from '../../../helpers/send/response';
import thinking from '../../../lib/discord/thinking';
import { generateDefaultEmbed } from '../../../lib/utils/embed';

@RegisterSubCommand('blacklist', (builder) => builder.setName('list').setDescription('List all Users on the blacklist'))
export class ListCommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputInteraction<'cached'>) {
		await thinking(interaction);
		const blacklistedUsers = await this.container.utilities.blacklist.get.BlacklistByGuildId(interaction.guildId);
		const blackListFormatted = processBlacklistedUsers(blacklistedUsers);

		return reply(interaction, {
			embeds: [
				generateDefaultEmbed({
					title: 'Blacklisted Users',
					description: blackListFormatted,
					thumbnail: {
						url: IMG_BLOCK,
					},
				}),
			],
		});

		function processBlacklistedUsers(users: Blacklist[]): string {
			if (users.length === 0) {
				return `${BirthdayyEmojis.ArrowRight}No users on the blacklist.`;
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
