import { inviteBirthdayyButton } from '#lib/components/button';
import { CustomCommand } from '#lib/structures/commands/CustomCommand';
import { BOT_AVATAR, BOT_NAME, Emojis } from '#utils';
import { applyLocalizedBuilder, resolveKey } from '@sapphire/plugin-i18next';
import { ActionRowBuilder, ButtonBuilder, type APIEmbed } from 'discord.js';

export class GuideCommand extends CustomCommand {
	public override registerApplicationCommands(registry: CustomCommand.Registry) {
		registry.registerChatInputCommand((builder) =>
			applyLocalizedBuilder(builder, 'commands/invite:invite').setDMPermission(true),
		);
	}

	public override async chatInputRun(interaction: CustomCommand.ChatInputCommandInteraction) {
		const embed = (await resolveKey(interaction, 'commands/invite:embed', {
			returnObjects: true,
			book: Emojis.Book,
			arrowRight: Emojis.ArrowRight,
			name: BOT_NAME,
			avatar: BOT_AVATAR,
		})) as APIEmbed;
		const embeds = [embed];
		const components = [
			new ActionRowBuilder<ButtonBuilder>().addComponents(await inviteBirthdayyButton(interaction)),
		];

		return interaction.reply({ embeds, components });
	}
}
