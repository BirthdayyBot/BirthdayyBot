import { getSupportedUserLanguageT } from '#lib/i18n/translate';
import { BirthdayyCommand } from '#lib/structures';
import { PermissionLevels } from '#lib/types/Enums';
import { interactionProblem, interactionSuccess } from '#utils/embed';
import { isNotCustom as enabled } from '#utils/env';
import { getCommandGuilds, resolveOnErrorCodesDiscord } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry } from '@sapphire/framework';
import { applyDescriptionLocalizedBuilder } from '@sapphire/plugin-i18next';
import {
	RESTJSONErrorCodes,
	SlashCommandBooleanOption,
	SlashCommandBuilder,
	SlashCommandStringOption
} from 'discord.js';

@ApplyOptions<BirthdayyCommand.Options>({ enabled, permissionLevel: PermissionLevels.BotOwner })
export class TogglePremiumCommand extends BirthdayyCommand {
	public override async registerApplicationCommands(registry: ApplicationCommandRegistry) {
		registry.registerChatInputCommand(
			(builder) =>
				this.registerCommandsOptions(
					applyDescriptionLocalizedBuilder(builder, 'commands/owners:togglePremiumDescription') //
						.setName('toggle-premium')
				),
			{ guildIds: await getCommandGuilds('admin') }
		);
	}

	public override async chatInputRun(interaction: BirthdayyCommand.Interaction) {
		const toggle = interaction.options.getBoolean('toggle', true);
		const guildId = interaction.options.getString('guild-id', true);
		// check if guild exists if not send error message
		const guild = await resolveOnErrorCodesDiscord(
			this.container.client.guilds.fetch(guildId),
			RESTJSONErrorCodes.UnknownGuild
		);
		const t = getSupportedUserLanguageT(interaction);

		if (!guild)
			return interaction.reply(interactionProblem(t('commands/owners:togglePremiumGuildNotFound', { guildId })));

		// set premium for guild to toggle
		await this.container.utilities.guild.set.Premium(guildId, toggle);
		const content = t('commands/owners:togglePremiumSuccess', {
			guildId,
			guildName: guild.name,
			status: toggle ? 'enabled' : 'disabled'
		});
		return interaction.reply(interactionSuccess(content));
	}

	private registerCommandsOptions(builder: SlashCommandBuilder) {
		return builder
			.addStringOption((option) => this.registerGuildIDCommandOption(option))
			.addBooleanOption((option) => this.registerToggleCommandOption(option));
	}

	private registerGuildIDCommandOption(option: SlashCommandStringOption) {
		return applyDescriptionLocalizedBuilder(option, 'commands/owners:togglePremiumGuildIdOptionDescription')
			.setName('guild-id')
			.setRequired(true);
	}

	private registerToggleCommandOption(option: SlashCommandBooleanOption) {
		return applyDescriptionLocalizedBuilder(option, 'commands/owners:togglePremiumGoggleOptionDescription')
			.setName('toggle')
			.setRequired(true);
	}
}
