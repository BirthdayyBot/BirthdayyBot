import { ApplyOptions } from '@sapphire/decorators';
import { Subcommand } from '@sapphire/plugin-subcommands';
import CommandBirthday from '../../lib/template/commands/birthday';
import findOption from '../../helpers/utils/findOption';
import getDateFromInteraction from '../../helpers/utils/getDateFromInteraction';
import { ARROW_RIGHT, AUTOCODE_ENV, FAIL, SUCCESS } from '../../helpers/provide/environment';
import type { Args } from '@sapphire/framework';
import generateEmbed from '../../helpers/generate/embed';
import { getBeautifiedDate } from '../../helpers/utils/date';
import generateBirthdayList from '../../helpers/generate/birthdayList';
import replyToInteraction from '../../helpers/send/response';
import thinking from '../../helpers/send/thinking';
const lib = require('lib')({ token: process.env.STDLIB_SECRET_TOKEN });
@ApplyOptions<Subcommand.Options>({
	description: 'Birthday Command',
	subcommands: [
		{
			name: 'register', //DONE
			chatInputRun: 'birthdayRegister'
		},
		{
			name: 'remove', //TODO
			chatInputRun: 'birthdayRemove'
		},
		{
			name: 'list', //DONE
			chatInputRun: 'birthdayList'
		},
		{
			name: 'update', //TODO
			chatInputRun: 'birthdayUpdate'
		},
		{
			name: 'test', //TODO
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
		thinking(interaction, true);
		const user_id = findOption(interaction, 'user', interaction.user.id);
		const birthday = getDateFromInteraction(interaction);
		const guild_id = interaction.guildId;
		console.log('USERID', user_id);
		console.log('GUILDID', guild_id);
		console.log('BIRTHDAY', birthday);
		if (!birthday.isValidDate) {
			this.embed.description = `${ARROW_RIGHT} \`${birthday.message}\``;
		}
		//TODO: Check if permission to manage Roles if userID is interaction.user.id
		if (birthday.isValidDate) {
			this.embed.title = `${SUCCESS} Success`;
			console.log(`USERID`, user_id);
			let request = await lib.chillihero[`birthday-api`][AUTOCODE_ENV].birthday.create({
				user_id: user_id,
				birthday: birthday.date,
				guild_id: guild_id
			});
			console.log('REQUEST', request);
			if (request.success) {
				const beautifiedDate = getBeautifiedDate(birthday.date);
				console.log('FINAL DATE', beautifiedDate);
				this.embed.description = `${ARROW_RIGHT} I added the Birthday from <@${user_id}> at the \`${beautifiedDate}\`. 🎂`;
				this.updateList = true;
			} else {
				if (request.code === 409) {
					this.embed.description = `${ARROW_RIGHT} \`This user's birthday is already registerd.\n Use /birthday update!\``;
				} else {
					this.embed.description = `${ARROW_RIGHT} \`${request.message}\``;
					console.warn(request.code);
					console.warn(request.message);
				}
			}
		} else {
			this.embed.description = `${ARROW_RIGHT} \`${birthday.message}\``;
		}
		const generatedEmbed = await generateEmbed(this.embed);
		replyToInteraction({ interaction, embeds: [generatedEmbed], ephemeral: false });
	}

	public async birthdayRemove(interaction: Subcommand.ChatInputCommandInteraction, args: Args) {
		//TODO: Check if User fullfills permissions to remove birthday ()
		const user = findOption(interaction, 'user', null);
	}

	public async birthdayList(interaction: Subcommand.ChatInputCommandInteraction, _args: Args) {
		const guild_id = interaction.guildId!;

		const { embed, components } = await generateBirthdayList(1, guild_id);

		const generatedEmbed = await generateEmbed(embed);
		interaction.reply({ embeds: [generatedEmbed], components: components });
	}

	public async birthdayShow(interaction: Subcommand.ChatInputCommandInteraction, _args: Args) {
		const user = findOption(interaction, 'user', interaction.user.id);
	}
}
