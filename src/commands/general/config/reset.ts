import { configChoices, configNameExtended, type ConfigName } from '#lib/database';
import thinking from '#lib/discord/thinking';
import { PrismaErrorCodeEnum, interactionProblem, interactionSuccess, reply } from '#utils';
import { resolveOnErrorCodesPrisma, setDefaultConfig } from '#utils/functions';
import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';
import { isNullOrUndefinedOrEmpty } from '@sapphire/utilities';

@RegisterSubCommand('config', (builder) =>
	builder
		.setName('reset')
		.setDescription('Reset settings from your server config')
		.addStringOption((option) =>
			option
				.setName('config')
				.setDescription('Config that you want to remove')
				.addChoices(...configChoices)
				.setRequired(true),
		),
)
export class ResetCommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputInteraction<'cached'>) {
		await thinking(interaction);
		const config = interaction.options.getString('config', true) as ConfigName;
		const configName = configNameExtended[config];

		const result = await resolveOnErrorCodesPrisma(
			setDefaultConfig(config, interaction.guildId),
			PrismaErrorCodeEnum.NotFound,
		);

		if (isNullOrUndefinedOrEmpty(result)) {
			return reply(
				interaction,
				interactionProblem(`An error occurred while trying to reset the ${configName} config.`),
			);
		}

		return reply(interaction, interactionSuccess(`Successfully reset the ${configName} config.`));
	}
}
