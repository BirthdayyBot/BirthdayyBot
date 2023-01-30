import { ApplyOptions } from '@sapphire/decorators';
import { Subcommand } from '@sapphire/plugin-subcommands';
import CommandBirthday from '../../lib/template/commands/birthday';
import findOption from '../../helpers/utils/findOption';
import getDateFromInteraction from '../../helpers/utils/getDateFromInteraction';
import { ARROW_RIGHT, AUTOCODE_ENV, BOOK, FAIL, IMG_CAKE, SUCCESS } from '../../helpers/provide/environment';
import type { Args } from '@sapphire/framework';
import generateEmbed from '../../helpers/generate/embed';
import { getBeautifiedDate } from '../../helpers/utils/date';
import generateBirthdayList from '../../helpers/generate/birthdayList';
import replyToInteraction from '../../helpers/send/response';
import thinking from '../../helpers/send/thinking';
import { getBirthdayByGuildAndUser } from '../../helpers/provide/birthday';
import { isNullOrUndefinedOrEmpty } from '@sapphire/utilities';
import birthdayEvent from '../../lib/birthday/birthdayEvent';

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
			name: 'show', //DONE
			chatInputRun: 'birthdayShow'
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
	//todo: check where updateList needs to be set to true
	updateList = false;
	adminLog = false;
	userLog = false;

	content = ``;
	embed = {
		title: `${FAIL} Failure`,
		description: `Something went wrong`,
		fields: [],
		thumbnail_url: ''
	};
	components = [];

	public async birthdayRegister(interaction: Subcommand.ChatInputCommandInteraction, _args: Args) {
		thinking(interaction);
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
		await replyToInteraction(interaction, { embeds: [generatedEmbed], ephemeral: false });
	}

	public async birthdayRemove(interaction: Subcommand.ChatInputCommandInteraction, _args: Args) {
		await thinking(interaction);
		//TODO: Check if User fullfills permissions to remove birthday ()
		const user = findOption(interaction, 'user', interaction.user.id);
		const guild_id = interaction.guildId;
		if (user === interaction.user.id) {
			//TODO: remove own birthday
		} else {
			//TODO: can remove other users birthday?
		}
		let request = await lib.chillihero[`birthday-api`][AUTOCODE_ENV].birthday.delete({
			user_id: user,
			guild_id: guild_id
		});
		if (request.success) {
			this.embed.title = `${SUCCESS} Success`;
			this.embed.description = `${ARROW_RIGHT} I removed the Birthday from <@${user}>. 🎂`;
		}

		const generatedEmbed = await generateEmbed(this.embed);
		await replyToInteraction(interaction, { content: user, embeds: [generatedEmbed] });
	}

	public async birthdayList(interaction: Subcommand.ChatInputCommandInteraction, _args: Args) {
		const guild_id = interaction.guildId!;

		const { embed, components } = await generateBirthdayList(1, guild_id);

		const generatedEmbed = await generateEmbed(embed);
		await replyToInteraction(interaction, { embeds: [generatedEmbed], components: components });
	}

	public async birthdayShow(interaction: Subcommand.ChatInputCommandInteraction, _args: Args) {
		await thinking(interaction);
		const user_id = findOption(interaction, 'user', interaction.user.id);
		const guild_id = interaction.guildId!;
		let request = await getBirthdayByGuildAndUser(guild_id, user_id); //try catch request
		// console.log("request", request);
		this.embed.title = `${BOOK} Show Birthday`;
		if (isNullOrUndefinedOrEmpty(request)) {
			// console.log("isEmpty");
			this.embed.description = `${ARROW_RIGHT} \`This user has no registered birthday.\``;
		} else {
			// console.log("isNotEmpty");
			const birthday = request[0];
			const readableDate = getBeautifiedDate(birthday.birthday);
			this.embed.thumbnail_url = IMG_CAKE;
			this.embed.description = `${ARROW_RIGHT} <@${birthday.user_id}>'s birthday is at the \`${readableDate}\``;
		}
		const generatedEmbed = await generateEmbed(this.embed);
		await replyToInteraction(interaction, { embeds: [generatedEmbed] });
	}

	public async birthdayUpdate(interaction: Subcommand.ChatInputCommandInteraction, _args: Args) {
		await thinking(interaction);
		const user_id = findOption(interaction, 'user', interaction.user.id);
		const birthday = getDateFromInteraction(interaction);
		const guild_id = interaction.guildId;

		if (!birthday.isValidDate) {
			this.embed.description = `${ARROW_RIGHT} \`${birthday.message}\``;
		}

		if (birthday.isValidDate) {
			let request = await lib.chillihero[`birthday-api`][AUTOCODE_ENV].birthday.update({
				user_id: user_id,
				birthday: birthday.date,
				guild_id: guild_id
			});
			if (request.success) {
				const beautifiedDate = getBeautifiedDate(birthday.date);
				this.embed.title = `${SUCCESS} Success`;
				this.embed.description = `${ARROW_RIGHT} I updated the Birthday from <@${user_id}> to the \`${beautifiedDate}\`. 🎂`;
				this.updateList = true;
			} else {
				this.embed.description = `${ARROW_RIGHT} \`${birthday.message}\``;
			}
			const generatedEmbed = await generateEmbed(this.embed);
			await replyToInteraction(interaction, { embeds: [generatedEmbed] });
		}
	}

	public async birthdayTest(interaction: Subcommand.ChatInputCommandInteraction, _args: Args) {
		await thinking(interaction);
		const guild_id = interaction.guildId!;
		const user_id = interaction.user.id;
		//TODO: check if enough permissions are provided
		await birthdayEvent(guild_id, user_id, true);
		this.embed.title = `${SUCCESS} Success`;
		this.embed.description = `${ARROW_RIGHT} Birthday Test run!`;
		const generatedEmbed = await generateEmbed(this.embed);
		await replyToInteraction(interaction, { embeds: [generatedEmbed] });
	}
}
