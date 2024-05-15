import { WebsiteUrl } from '#lib/components/button';
import { BirthdayyCommand } from '#lib/structures';
import { Emojis } from '#utils/constants';
import { ApplicationCommandRegistry } from '@sapphire/framework';
import { applyDescriptionLocalizedBuilder, resolveKey } from '@sapphire/plugin-i18next';
import type { APIEmbed } from 'discord.js';

export class VoteCommand extends BirthdayyCommand {
	public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
		registry.registerChatInputCommand((builder) => {
			return applyDescriptionLocalizedBuilder(builder, 'commands/vote:voteDescription')
				.setName('vote')
				.setDMPermission(true);
		});
	}

	public override async chatInputRun(interaction: BirthdayyCommand.Interaction) {
		const embed = (await resolveKey(interaction, 'commands/vote:embed', {
			returnObjects: true,
			arrowRight: Emojis.ArrowRight,
			heart: Emojis.Heart,
			topgg: WebsiteUrl('topgg/vote'),
			discordlist: WebsiteUrl('discordlist/vote'),
			'discord-botlist': WebsiteUrl('discord-botlist/vote'),
			premium: WebsiteUrl('premium')
		})) as APIEmbed;

		return interaction.reply({ embeds: [embed] });
	}
}
