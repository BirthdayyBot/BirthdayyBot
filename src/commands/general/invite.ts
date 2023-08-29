import { inviteBirthdayyButton } from '#lib/components/button';
import { replyToInteraction } from '#lib/discord/interaction';
import { defaultClientPermissions, defaultUserPermissions } from '#lib/types/permissions';
import { BOT_AVATAR, BOT_NAME, Emojis } from '#utils';
import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { applyLocalizedBuilder, resolveKey } from '@sapphire/plugin-i18next';
import { ActionRowBuilder, ButtonBuilder, EmbedBuilder } from 'discord.js';

@ApplyOptions<Command.Options>({
	requiredUserPermissions: defaultUserPermissions,
	requiredClientPermissions: defaultClientPermissions,
})
export class GuideCommand extends Command {
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			applyLocalizedBuilder(builder, 'commands/invite:invite')
				.setDefaultMemberPermissions(defaultUserPermissions.bitfield)
				.setDMPermission(true),
		);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		const [title, description] = await Promise.all([
			await resolveKey(interaction, 'commands/invite:embedTitle', {
				emoji: Emojis.Book,
				name: BOT_NAME,
			}),
			await resolveKey(interaction, 'commands/invite:embedDescription', {
				emoji: Emojis.ArrowRight,
				name: BOT_NAME,
			}),
		]);

		const embed = new EmbedBuilder().setTitle(title).setDescription(description).setThumbnail(BOT_AVATAR);

		const components = new ActionRowBuilder<ButtonBuilder>().addComponents(
			await inviteBirthdayyButton(interaction),
		);

		return replyToInteraction(interaction, {
			embeds: [embed],
			components: [components],
		});
	}
}
