import { BirthdayyCommand } from '#lib/structures';
import { Emojis } from '#utils/constants';
import { ApplicationCommandRegistry } from '@sapphire/framework';
import { applyLocalizedBuilder, resolveKey } from '@sapphire/plugin-i18next';
import type { APIEmbed } from 'discord.js';

export class VoteCommand extends BirthdayyCommand {
	public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
		registry.registerChatInputCommand((builder) => {
			return applyLocalizedBuilder(builder, 'commands/vote:vote');
		});
	}

	public override async chatInputRun(interaction: BirthdayyCommand.Interaction) {
		const embed = (await resolveKey(interaction, 'commands/vote:embed', {
			returnObjects: true,
			arrowRight: Emojis.ArrowRight,
			heart: Emojis.Heart,
			topgg: 'https://top.gg/bot/270010330782892032/vote',
			discordlist: 'https://discordlist.com/bot/270010330782892032/vote',
			'discord-botlist': 'https://discord-botlist.eu/bot/270010330782892032/vote',
			premium: 'https://premium.birthdayy.xyz'
		})) as APIEmbed;

		return interaction.reply({ embeds: [embed] });
	}
}
