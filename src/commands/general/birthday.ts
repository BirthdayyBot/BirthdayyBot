import { ApplyOptions } from '@sapphire/decorators';
import { Subcommand } from '@sapphire/plugin-subcommands';
import CommandBirthday from '../../lib/template/commands/birthday';
import findOption from '../../helpers/utils/findOption';
import getDateFromInteraction from '../../helpers/utils/getDateFromInteraction';
import { ARROW_RIGHT, FAIL } from '../../helpers/provide/environment';
import type { Args } from '@sapphire/framework';
import generateEmbed from '../../helpers/generate/embed';
import { getBeautifiedDate } from '../../helpers/utils/date';
const lib = require('lib')({ token: process.env.STDLIB_SECRET_TOKEN });
@ApplyOptions<Subcommand.Options>({
	description: 'Birthday Command',
	subcommands: [
		{
			name: 'register',
			chatInputRun: 'birthdayRegister'
		},
		{
			name: 'remove',
			chatInputRun: 'birthdayRemove'
		},
		{
			name: 'list',
			chatInputRun: 'birthdayList'
		},
		{
			name: 'update',
			chatInputRun: 'birthdayUpdate'
		},
		{
			name: 'test',
			chatInputRun: 'birthdayTest'
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

	updateList = false;
	adminLog = false;
	userLog = false;
	embed = {
		title: `${FAIL} Failure`,
		description: `Something went wrong`,
		fields: []
	};
	components = [];
	content = ``;

	public async birthdayRegister(interaction: Subcommand.ChatInputCommandInteraction, _args: Args) {
		const user_id = findOption(interaction, 'user', interaction.user.id);
		const birthday = getDateFromInteraction(interaction);
		const guild_id = interaction.guildId;

		if (!birthday.isValidDate) {
			this.embed.description = `${ARROW_RIGHT} \`${birthday.message}\``;
		}

		if (birthday.isValidDate) {
			this.embed.title = `${ARROW_RIGHT} Success`;
			console.log(`USERID`, user_id);
			let request = await lib.chillihero[`birthday-api`][`@release`].birthday.create({
				user_id: user_id,
				birthday: birthday.date,
				guild_id: guild_id
			});

			if (request.success) {
				const beautifiedDate = getBeautifiedDate(birthday.date);
				console.log('FINAL DATE', beautifiedDate);
				this.embed.description = `${ARROW_RIGHT} I added the Birthday from <@${user_id}> at the \`${bd}\`. 🎂`;
				this.updateList = true;
			}

			const generatedEmbed = await generateEmbed(this.embed);
			interaction.reply({ embeds: [generatedEmbed] });
		}

		// public async birthdayRemove(message: Message, args: Args) {}

		// public async birthdayList(message: Message, args: Args) {}
	}
}
