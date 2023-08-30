import { configNameExtended, type ConfigName } from '#lib/database';
import { PrismaErrorCodeEnum, interactionProblem, interactionSuccess } from '#utils';
import { resolveOnErrorCodesPrisma, setDefaultConfig } from '#utils/functions';
import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';
import { isNullOrUndefinedOrEmpty } from '@sapphire/utilities';
import { resetConfigSubCommand } from './config.js';

@RegisterSubCommand('config', (builder) => resetConfigSubCommand(builder))
export class ResetCommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputInteraction<'cached'>) {
		const config = interaction.options.getString('config', true) as ConfigName;
		const configName = configNameExtended[config];

		const result = await resolveOnErrorCodesPrisma(
			setDefaultConfig(config, interaction.guildId),
			PrismaErrorCodeEnum.NotFound,
		);

		if (isNullOrUndefinedOrEmpty(result)) {
			return interactionProblem(interaction, 'commands/config:reset.error', {
				config: configName,
			});
		}

		return interactionSuccess(interaction, 'commands/config:reset.success', {
			config: configName,
		});
	}
}
