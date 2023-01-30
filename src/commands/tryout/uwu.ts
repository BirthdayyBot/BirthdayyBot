import { ApplyOptions } from '@sapphire/decorators';
import type { Args } from '@sapphire/framework';
import { Subcommand } from '@sapphire/plugin-subcommands';
import generateEmbed from '../../helpers/generate/embed';
import { container } from '@sapphire/framework';
import findOption from '../../helpers/utils/findOption';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import { resolveKey } from '@sapphire/plugin-i18next';
@ApplyOptions<Subcommand.Options>({
	description: 'send uwus',
	subcommands: [
		{
			name: 'once',
			chatInputRun: 'runOnce'
		},
		{
			name: 'times',
			chatInputRun: 'runTimes'
		},
		{
			name: 'random',
			chatInputRun: 'runRandom'
		},
		{
			name: 'fetch',
			chatInputRun: 'runFetch'
		}
	]
})
export class UwuCommand extends Subcommand {
	public constructor(context: Subcommand.Context, options: Subcommand.Options) {
		super(context, {
			...options,
			description: 'send uwus'
		});
	}
	readonly uwuString = 'UwU';

	public async runOnce(interaction: Subcommand.ChatInputCommandInteraction, _args: Args) {
		const title = await resolveKey(interaction, 'commands/uwu:uwuss');
		const embed = await generateEmbed({ title: title, description: 'Uwu' });
		return await interaction.reply({ embeds: [embed] });
	}

	public async runTimes(interaction: Subcommand.ChatInputCommandInteraction, _args: Args) {
		const times = findOption(interaction, 'times', 1);
		container.logger.info('times', times);

		let uwu = '';
		for (let i = 0; i < times!; i++) {
			uwu += 'UwU ';
		}
		const embed = await generateEmbed({ title: 'UwU', description: uwu });
		return await interaction.reply({ embeds: [embed] });
	}

	public async runRandom(interaction: Subcommand.ChatInputCommandInteraction, _args: Args) {
		const user = findOption(interaction, 'user', interaction.user.id);
		const embed = await generateEmbed({ title: 'UwU', description: `UwU <@${user}>` });
		return await interaction.reply({ embeds: [embed] });
	}

	public async runFetch(interaction: Subcommand.ChatInputCommandInteraction, _args: Args) {
		interface JsonPlaceholderResponse {
			userId: number;
			id: number;
			title: string;
			completed: boolean;
		}

		// Fetch the data. No need to call `.json()` after making the request!
		const data = await fetch<JsonPlaceholderResponse>('https://jsonplaceholder.typicode.com/todos/1', FetchResultTypes.JSON);
		const embed = await generateEmbed({ title: 'UwU Fetch', description: `UwU \n\`\`\`json${JSON.stringify(data, null, '\t')}\`\`\`` });
		return await interaction.reply({ embeds: [embed] });
	}

	public override registerApplicationCommands(registry: Subcommand.Registry) {
		registry.registerChatInputCommand(
			{
				name: 'uwu',
				description: 'UwU Command',
				options: [
					{
						type: 1,
						name: 'once',
						description: 'Send one uwu'
					},
					{
						type: 1,
						name: 'times',
						description: 'Send multiple uwus',
						options: [
							{
								type: 4,
								name: 'times',
								description: 'How many UwUs to send'
							}
						]
					},
					{
						type: 1,
						name: 'random',
						description: 'Random added fields',
						options: [
							{
								type: 6,
								name: 'user',
								description: 'Send a UwU to a user',
								required: true
							}
						]
					},
					{
						type: 1,
						name: 'fetch',
						description: 'Fetch a user'
					}
				]
			},
			{
				idHints: ['1063803770636603422'],
				guildIds: ['766707453994729532']
			}
		);
	}
}
