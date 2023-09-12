import { UwUCMD } from '#lib/commands';
import { generateDefaultEmbed } from '#utils/embed';
import { getCommandGuilds } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import type { Args } from '@sapphire/framework';
import { container } from '@sapphire/pieces';
import { resolveKey } from '@sapphire/plugin-i18next';
import { Subcommand } from '@sapphire/plugin-subcommands';

@ApplyOptions<Subcommand.Options>({
	description: 'send uwus',
	subcommands: [
		{
			name: 'once',
			chatInputRun: 'runOnce',
		},
		{
			name: 'times',
			chatInputRun: 'runTimes',
		},
		{
			name: 'random',
			chatInputRun: 'runRandom',
		},
		{
			name: 'fetch',
			chatInputRun: 'runFetch',
		},
	],
})
export class UwuCommand extends Subcommand {
	// private readonly _uwuString = 'UwU';

	public override async registerApplicationCommands(registry: Subcommand.Registry) {
		registry.registerChatInputCommand(UwUCMD(), {
			guildIds: await getCommandGuilds('testing'),
		});
	}

	public async runOnce(interaction: Subcommand.ChatInputCommandInteraction, _args: Args) {
		const title = await resolveKey(interaction, 'commands/uwu:uwuss');
		const embed = generateDefaultEmbed({ title, description: 'Uwu' });
		return interaction.reply({ embeds: [embed] });
	}

	public async runTimes(interaction: Subcommand.ChatInputCommandInteraction, _args: Args) {
		const times = interaction.options.getInteger('times') ?? 1;
		container.logger.info('times', times);

		let uwu = '';
		for (let i = 0; i < times; i++) {
			uwu += 'UwU ';
		}
		const embed = generateDefaultEmbed({ title: 'UwU', description: uwu });
		return interaction.reply({ embeds: [embed] });
	}

	public async runRandom(interaction: Subcommand.ChatInputCommandInteraction, _args: Args) {
		const user = interaction.options.getUser('user') ?? interaction.user;
		const embed = generateDefaultEmbed({ title: 'UwU', description: `UwU <@${user.id}>` });
		return interaction.reply({ embeds: [embed] });
	}

	public async runFetch(interaction: Subcommand.ChatInputCommandInteraction, _args: Args) {
		interface JsonPlaceholderResponse {
			userId: number;
			id: number;
			title: string;
			completed: boolean;
		}

		// Fetch the data. No need to call `.json()` after making the request!
		const data = await fetch<JsonPlaceholderResponse>(
			'https://jsonplaceholder.typicode.com/todos/1',
			FetchResultTypes.JSON,
		);
		const embed = generateDefaultEmbed({
			title: 'UwU Fetch',
			description: `UwU \n\`\`\`json${JSON.stringify(data, null, '\t')}\`\`\``,
		});
		return interaction.reply({ embeds: [embed] });
	}
}
