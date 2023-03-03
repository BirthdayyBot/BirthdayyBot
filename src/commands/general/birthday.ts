import { ApplyOptions } from '@sapphire/decorators';
import { Subcommand } from '@sapphire/plugin-subcommands';
import findOption from '../../helpers/utils/findOption';
import getDateFromInteraction from '../../helpers/utils/getDateFromInteraction';
import { ARROW_RIGHT, AUTOCODE_ENV, BOOK, DEBUG, FAIL, IMG_CAKE, SUCCESS } from '../../helpers/provide/environment';
import type { Args } from '@sapphire/framework';
import generateEmbed from '../../helpers/generate/embed';
import { getBeautifiedDate } from '../../helpers/utils/date';
import generateBirthdayList from '../../helpers/generate/birthdayList';
import replyToInteraction from '../../helpers/send/response';
import thinking from '../../lib/discord/thinking';
import { getBirthdayByGuildAndUser } from '../../helpers/provide/birthday';
import { isNullOrUndefinedOrEmpty } from '@sapphire/utilities';
import birthdayEvent from '../../lib/birthday/birthdayEvent';
import updateBirthdayOverview from '../../helpers/update/overview';
import { BirthdayCMD } from '../../lib/commands/birthday';
import { getCommandGuilds } from '../../helpers/utils/guilds';
import { hasUserGuildPermissions } from '../../helpers/provide/permission';
import type { EmbedInformationModel } from '../../lib/model/EmbedInformation.model';

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
			name: 'update', //Done
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
export class BirthdayCommand extends Subcommand {
	public constructor(context: Subcommand.Context, options: Subcommand.Options) {
		super(context, {
			...options
		});
	}
	public override async registerApplicationCommands(registry: Subcommand.Registry) {
		registry.registerChatInputCommand(await BirthdayCMD(), {
			guildIds: getCommandGuilds('global')
		});
	}
	//todo: check where updateList needs to be set to true
	updateList = false;
	adminLog = false;
	userLog = false;

	content = ``;
	embed: EmbedInformationModel = {
		title: `${FAIL} Failure`,
		description: `Something went wrong`,
		fields: [],
		thumbnail_url: ''
	};
	components = [];

	public async birthdayRegister(interaction: Subcommand.ChatInputCommandInteraction, _args: Args) {
		await thinking(interaction);
		const user_id = findOption(interaction, 'user', interaction.user.id);
		const author_id = interaction.user.id;
		const guild_id = interaction.guildId!;

		if (author_id === user_id) {
			this.embed = await birthdayRegisterProcess(this.embed);
			this.updateList = this.embed.title === `${SUCCESS} Success` ? true : false;
		} else {
			if (await hasUserGuildPermissions(interaction, author_id, [`ManageRoles`])) {
				await birthdayRegisterProcess(this.embed);
				this.updateList = this.embed.title === `${SUCCESS} Success` ? true : false;
			} else {
				this.embed.description = `${ARROW_RIGHT} \`You don't have the permissions to register another user's birthday.\``;
			}
		}

		const generatedEmbed = await generateEmbed(this.embed);
		await replyToInteraction(interaction, { embeds: [generatedEmbed], ephemeral: false });
		this.updateList ? await updateBirthdayOverview(guild_id) : null;

		async function birthdayRegisterProcess(embed: EmbedInformationModel): Promise<EmbedInformationModel> {
			const birthday = getDateFromInteraction(interaction);
			//TODO: #10
			console.log(DEBUG ? 'USERID: ' + user_id : '');
			console.log(DEBUG ? 'GUILDID: ' + guild_id : '');
			console.log(DEBUG ? 'BIRTHDAY: ' + birthday.date : '');
			if (!birthday.isValidDate) {
				embed.description = `${ARROW_RIGHT} \`${birthday.message}\``;
			}
			if (birthday.isValidDate) {
				let request = await lib.chillihero[`birthday-api`][AUTOCODE_ENV].birthday.create({
					user_id: user_id,
					birthday: birthday.date,
					guild_id: guild_id
				});
				if (request.success) {
					const beautifiedDate = getBeautifiedDate(birthday.date);
					console.log('FINAL DATE', beautifiedDate);
					embed.title = `${SUCCESS} Success`;
					embed.description = `${ARROW_RIGHT} I added the Birthday from <@${user_id}> at the \`${beautifiedDate}\`. 🎂`;
				} else {
					if (request.code === 409) {
						embed.description = `${ARROW_RIGHT} \`This user's birthday is already registerd.\n Use /birthday update!\``;
					} else {
						embed.description = `${ARROW_RIGHT} \`${request.message}\``;
						console.warn(request.code);
						console.warn(request.message);
					}
				}
			} else {
				embed.description = `${ARROW_RIGHT} \`${birthday.message}\``;
			}
			return embed;
		}
	}

	public async birthdayRemove(interaction: Subcommand.ChatInputCommandInteraction, _args: Args) {
		await thinking(interaction);
		const user_id = findOption(interaction, 'user', interaction.user.id);
		const author_id = interaction.user.id;
		const guild_id = interaction.guildId!;
		const removeBirthday = async (user_id: string, guild_id: string) => {
			let request = await lib.chillihero[`birthday-api`][AUTOCODE_ENV].birthday.delete({
				user_id: user_id,
				guild_id: guild_id
			});
			if (request.success) {
				this.embed.title = `${SUCCESS} Success`;
				this.embed.description = `${ARROW_RIGHT} I removed the Birthday from <@${user_id}>. 🎂`;
			}
		};
		if (author_id === user_id) {
			await removeBirthday(user_id, guild_id);
		} else {
			const hasPermissions = await hasUserGuildPermissions(interaction, user_id, [`ManageRoles`]);
			if (hasPermissions) {
				await removeBirthday(user_id, guild_id);
				this.updateList = true;
			} else {
				this.embed.description = `${ARROW_RIGHT} \`You don't have the permission to remove other users birthdays.\``;
			}
		}

		const generatedEmbed = await generateEmbed(this.embed);
		await replyToInteraction(interaction, { embeds: [generatedEmbed] });
		this.updateList ? await updateBirthdayOverview(guild_id) : null;
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
		const request = await getBirthdayByGuildAndUser(guild_id, user_id); //try catch request
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
		const author_id = interaction.user.id;
		const guild_id = interaction.guildId!;

		if (author_id === user_id) {
			this.embed = await birthdayUpdateProcess(this.embed);
			this.updateList = this.embed.title === `${SUCCESS} Success` ? true : false;
		} else {
			if (await hasUserGuildPermissions(interaction, author_id, [`ManageRoles`])) {
				await birthdayUpdateProcess(this.embed);
				this.updateList = this.embed.title === `${SUCCESS} Success` ? true : false;
			} else {
				this.embed.description = `${ARROW_RIGHT} \`You don't have the permissions to update another user's birthday.\``;
			}
		}

		const generatedEmbed = await generateEmbed(this.embed);
		await replyToInteraction(interaction, { embeds: [generatedEmbed] });
		this.updateList ? await updateBirthdayOverview(guild_id) : null;

		async function birthdayUpdateProcess(embed: EmbedInformationModel): Promise<EmbedInformationModel> {
			const birthday = getDateFromInteraction(interaction);
			if (!birthday.isValidDate) {
				embed.description = `${ARROW_RIGHT} \`${birthday.message}\``;
			}

			if (birthday.isValidDate) {
				let request = await lib.chillihero[`birthday-api`][AUTOCODE_ENV].birthday.update({
					user_id: user_id,
					birthday: birthday.date,
					guild_id: guild_id
				});
				if (request.success) {
					const beautifiedDate = getBeautifiedDate(birthday.date);
					embed.title = `${SUCCESS} Success`;
					embed.description = `${ARROW_RIGHT} I updated the Birthday from <@${user_id}> to the \`${beautifiedDate}\`. 🎂`;
				} else {
					embed.description = `${ARROW_RIGHT} \`${request.message}\``;
				}
			}
			return embed;
		}
	}

	public async birthdayTest(interaction: Subcommand.ChatInputCommandInteraction, _args: Args) {
		await thinking(interaction);
		const guild_id = interaction.guildId!;
		const user_id = interaction.user.id;
		const hasPermissions = await hasUserGuildPermissions(interaction, user_id, [`ManageRoles`]);
		console.log('hasPermissions', hasPermissions);
		if (hasPermissions) {
			await birthdayEvent(guild_id, user_id, true);
			this.embed.title = `${SUCCESS} Success`;
			this.embed.description = `${ARROW_RIGHT} Birthday Test run!`;
		} else {
			this.embed.description = `${ARROW_RIGHT} \`You don't have the permission to run this command.\``;
		}
		const generatedEmbed = await generateEmbed(this.embed);
		await replyToInteraction(interaction, { embeds: [generatedEmbed] });
	}
}
