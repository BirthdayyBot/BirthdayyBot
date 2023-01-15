import { ApplyOptions } from '@sapphire/decorators';
import type { Args } from '@sapphire/framework';
import { Subcommand } from '@sapphire/plugin-subcommands';
import type { Message } from 'discord.js';
import generateEmbed from '../../helpers/generate/embed';
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
	public override registerApplicationCommands(registry: Subcommand.Registry) {
		registry.registerChatInputCommand({
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
							name: 'day',
							description: 'How many UwUs to send',
							required: true
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
				}
			]
		});
	}

	public async runOnce(interaction: Subcommand.ChatInputCommandInteraction, _args: Args) {
		//respond with an interaction
		const embed = await generateEmbed({ title: 'Uwu', description: 'Uwu' });
		console.log("embed", embed);
		await interaction.reply({ embeds: [embed] });
	}

	public async runTimes(message: Message, args: Args) {
		const times = await args.pick('number');
		let uwu = '';
		for (let i = 0; i < times; i++) {
			uwu += 'UwU ';
		}
		return message.channel.send(uwu);
	}

	public async runRandom(message: Message, args: Args) {
		const user = await args.pick('user');
		return message.channel.send(`UwU ${user}`);
	}
}
