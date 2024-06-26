import { BirthdayyCommand } from '#lib/structures';
import { PermissionLevels } from '#lib/types/Enums';
import { interactionProblem } from '#utils/embed';
import { isNotCustom as enabled } from '#utils/env';
import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry } from '@sapphire/framework';
import { Colors, EmbedBuilder } from 'discord.js';

@ApplyOptions<BirthdayyCommand.Options>({ enabled, permissionLevel: PermissionLevels.BotOwner })
export class TogglePremiumCommand extends BirthdayyCommand {
	public override async registerApplicationCommands(registry: ApplicationCommandRegistry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName('toggle-premium')
				.setDescription('Toggle premium for a guild')
				.addStringOption((option) =>
					option
						.setName('guild-id')
						.setDescription('The id of the guild to toggle premium for')
						.setRequired(true)
				)
				.addBooleanOption((option) =>
					option.setName('toggle').setDescription('Whether to enable or disable premium').setRequired(true)
				)
		);
	}

	public override async chatInputRun(interaction: BirthdayyCommand.Interaction) {
		const id = interaction.options.getString('guild-id', true);
		const toggle = interaction.options.getBoolean('toggle', true);

		const guild = await this.container.client.guilds.fetch(id).catch(() => null);
		if (guild === null) return interaction.reply(interactionProblem('Failed to fetch the guild'));

		await this.container.prisma.guild.update({ where: { id }, data: { premium: toggle } });

		const embed = new EmbedBuilder()
			.setDescription(`${toggle ? 'Enabled' : 'Disabled'} premium for guild ${guild} (${guild.id})`)
			.setAuthor({ name: guild.name, iconURL: guild.iconURL() ?? undefined })
			.setColor(toggle ? Colors.Green : Colors.Red);

		return interaction.reply({ embeds: [embed] });
	}
}
