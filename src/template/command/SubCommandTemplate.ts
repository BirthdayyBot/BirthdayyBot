import { ApplyOptions } from '@sapphire/decorators';
import type { Args } from '@sapphire/framework';
import { Subcommand } from '@sapphire/plugin-subcommands';
import generateEmbed from '../../helpers/generate/embed';
import { container } from '@sapphire/framework';
@ApplyOptions<Subcommand.Options>({
	description: 'send uwus',
	subcommands: [
		{
			name: 'once',
			chatInputRun: 'runOnce'
		}
	]
})
export class TemplateCommand extends Subcommand {
	public constructor(context: Subcommand.Context, options: Subcommand.Options) {
		super(context, {
			...options,
			description: 'A Template Command'
		});
	}

	public async runOnce(interaction: Subcommand.ChatInputCommandInteraction, _args: Args) {
		container.logger.info('Run Once Command');
		const embed = await generateEmbed({ title: 'Template', description: 'A Template Command' });
		return await interaction.reply({ embeds: [embed] });
	}

	public override registerApplicationCommands(registry: Subcommand.Registry) {
		registry.registerChatInputCommand({
			name: 'template',
			description: 'Template Command',
			options: [
				{
					type: 1,
					name: 'once',
					description: 'its a template'
				}
			]
		});
	}
}
