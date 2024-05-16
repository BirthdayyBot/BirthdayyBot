import { getSupportedUserLanguageT } from '#lib/i18n/translate';
import { BirthdayyCommand } from '#lib/structures';
import { ApplicationCommandRegistry } from '@sapphire/framework';
import { applyDescriptionLocalizedBuilder } from '@sapphire/plugin-i18next';

export class PingCommand extends BirthdayyCommand {
	public override async registerApplicationCommands(registry: ApplicationCommandRegistry) {
		registry.registerChatInputCommand((builder) =>
			applyDescriptionLocalizedBuilder(builder, 'commands/general:pingDescription').setName(this.name)
		);
	}

	public override async chatInputRun(interaction: BirthdayyCommand.Interaction) {
		const t = getSupportedUserLanguageT(interaction);
		const msg = await interaction.reply({ content: t('commands/general:pingLoading'), fetchReply: true });
		const content = t('commands/general:pingContent', {
			latency: msg.createdTimestamp - interaction.createdTimestamp,
			heartbeat: interaction.client.ws.ping
		});

		return interaction.editReply({ content });
	}
}
