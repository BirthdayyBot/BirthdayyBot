import { ApplyOptions } from '@sapphire/decorators';
// import type { Args } from '@sapphire/framework';
import { Subcommand } from '@sapphire/plugin-subcommands';
// import type { Message } from 'discord.js';
import CommandBirthday from '../../lib/template/commands/birthday';

@ApplyOptions<Subcommand.Options>({
	description: 'Birthday Command',
	subcommands: [
		{
			name: 'register',
			chatInputRun: 'birthdayAdd'
		},
		{
			name: 'remove',
			chatInputRun: 'birthdayRemove'
		},
		{
			name: 'list',
			chatInputRun: 'birthdayList'
		}
	]
})
export class UwuCommand extends Subcommand {
	public constructor(context: Subcommand.Context, options: Subcommand.Options) {
		super(context, {
			...options,
			description: 'Birthday Command'
		});
	}
	public override async registerApplicationCommands(registry: Subcommand.Registry) {
		registry.registerChatInputCommand(await CommandBirthday());
	}

	// public async birthdayAdd(message: Message, args: Args) {}

	// public async birthdayRemove(message: Message, args: Args) {}

	// public async birthdayList(message: Message, args: Args) {}
}
