import { WebsiteUrl } from '#lib/components/button';
import { CustomCommand } from '#lib/structures/commands/CustomCommand';
import { defaultUserPermissions } from '#lib/types/permissions';
import { Emojis } from '#utils';
import { applyLocalizedBuilder, resolveKey } from '@sapphire/plugin-i18next';
import type { APIEmbed } from 'discord.js';

export class VoteCommand extends CustomCommand {
	public override registerApplicationCommands(registry: CustomCommand.Registry) {
		registry.registerChatInputCommand((builder) => {
			return applyLocalizedBuilder(builder, 'commands/vote:vote').setDefaultMemberPermissions(
				defaultUserPermissions.bitfield,
			);
		});
	}

	public override async chatInputRun(interaction: CustomCommand.ChatInputCommandInteraction) {
		const embed = await resolveKey<APIEmbed>(interaction, 'commands/vote:embed', {
			returnObjects: true,
			arrowRight: Emojis.ArrowRight,
			heart: Emojis.Heart,
			topgg: WebsiteUrl('topgg/vote'),
			discordlist: WebsiteUrl('discordlist/vote'),
			'discord-botlist': WebsiteUrl('discord-botlist/vote'),
			premium: WebsiteUrl('premium'),
		});

		return interaction.reply({ embeds: [embed] });
	}
}
