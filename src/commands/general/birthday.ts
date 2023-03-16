import { ApplyOptions } from '@sapphire/decorators';
import { Subcommand } from '@sapphire/plugin-subcommands';
import findOption from '../../helpers/utils/findOption';
import getDateFromInteraction from '../../helpers/utils/getDateFromInteraction';
import { ARROW_RIGHT, AUTOCODE_ENV, BOOK, FAIL, IMG_CAKE, SUCCESS } from '../../helpers/provide/environment';
import { container } from '@sapphire/framework';
import generateEmbed from '../../helpers/generate/embed';
import { getBeautifiedDate } from '../../helpers/utils/date';
import generateBirthdayList from '../../helpers/generate/birthdayList';
import replyToInteraction from '../../helpers/send/response';
import thinking from '../../lib/discord/thinking';
import { getBirthdayByGuildAndUser, registerBirthday } from '../../lib/birthday/birthday';
import { isNullOrUndefinedOrEmpty } from '@sapphire/utilities';
import updateBirthdayOverview from '../../helpers/update/overview';
import { BirthdayCMD } from '../../lib/commands/birthday';
import { getCommandGuilds } from '../../helpers/utils/guilds';
import { hasUserGuildPermissions } from '../../helpers/provide/permission';
import type { EmbedInformationModel } from '../../lib/model/EmbedInformation.model';
import { removeBirthday } from '../../lib/birthday/birthday';
import { APIErrorCode } from '../../lib/enum/APIErrorCode.enum';
import { BirthdayReminderTask } from '../../tasks/BirthdayReminderTask';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const lib = require('lib')({ token: process.env.STDLIB_SECRET_TOKEN });
@ApplyOptions<Subcommand.Options>({
	description: 'Birthday Command',
	subcommands: [
		{
			name: 'register',
			chatInputRun: 'birthdayRegister',
		},
		{
			name: 'remove',
			chatInputRun: 'birthdayRemove',
		},
		{
			name: 'list',
			chatInputRun: 'birthdayList',
		},
		{
			name: 'update',
			chatInputRun: 'birthdayUpdate',
		},
		{
			name: 'show',
			chatInputRun: 'birthdayShow',
		},
		{
			name: 'test',
			chatInputRun: 'birthdayTest',
		},
	],
})
export class BirthdayCommand extends Subcommand {
	public constructor(context: Subcommand.Context, options: Subcommand.Options) {
		super(context, {
			...options,
		});
	}
	public override async registerApplicationCommands(registry: Subcommand.Registry) {
		registry.registerChatInputCommand(await BirthdayCMD(), {
			guildIds: getCommandGuilds('global'),
		});
	}

	updateList = false;
	adminLog = false;
	userLog = false;

	content = '';
	embed: EmbedInformationModel = {
		title: `${FAIL} Failure`,
		description: 'Something went wrong',
		fields: [],
		thumbnail_url: '',
	};
	components = [];

	public async birthdayRegister(interaction: Subcommand.ChatInputCommandInteraction) {
		await thinking(interaction);
		const user_id = findOption(interaction, 'user', interaction.user.id);
		const author_id = interaction.user.id;
		const guild_id = interaction.guildId!;

		if (author_id === user_id) {
			this.embed = await birthdayRegisterProcess(this.embed);
			this.updateList = this.embed.title === `${SUCCESS} Success` ? true : false;
		} else if (await hasUserGuildPermissions(interaction, author_id, ['ManageRoles'])) {
			await birthdayRegisterProcess(this.embed);
			this.updateList = this.embed.title === `${SUCCESS} Success` ? true : false;
		} else {
			this.embed.description = `${ARROW_RIGHT} \`You don't have the permissions to register another user's birthday.\``;
		}

		const generatedEmbed = await generateEmbed(this.embed);
		await replyToInteraction(interaction, { embeds: [generatedEmbed], ephemeral: false });
		if (this.updateList) await updateBirthdayOverview(guild_id);

		async function birthdayRegisterProcess(embed: EmbedInformationModel): Promise<EmbedInformationModel> {
			const birthday = getDateFromInteraction(interaction);
			container.logger.debug(`Registering birthday for user ${user_id} in guild ${guild_id} with date ${birthday.date}`);

			if (!birthday.isValidDate) {
				embed.description = `${ARROW_RIGHT} \`${birthday.message}\``;
			}
			if (birthday.isValidDate) {
				// TODO: Add username(nick) and discriminator to the request
				const request = await registerBirthday(birthday.date, guild_id, { user_id: user_id });
				if (request.success) {
					embed.title = `${SUCCESS} Success`;
					embed.description = `${ARROW_RIGHT} I added the Birthday from <@${user_id}> at the \`${getBeautifiedDate(birthday.date)}\`. 🎂`;
				} else if (request.error) {
					if (request.error.code === APIErrorCode.DUPLICATE_ENTRY) {
						embed.description = `${ARROW_RIGHT} \`This user's birthday is already registered.\n Use /birthday update!\``;
					} else {
						embed.description = `${ARROW_RIGHT} \`${request.error.message}\``;
						container.logger.error(request.error.code);
						container.logger.error(request.error.message);
					}
				}
			} else {
				embed.description = `${ARROW_RIGHT} \`${birthday.message}\``;
			}
			return embed;
		}
	}

	public async birthdayRemove(interaction: Subcommand.ChatInputCommandInteraction) {
		await thinking(interaction);
		const user_id = findOption(interaction, 'user', interaction.user.id);
		const author_id = interaction.user.id;
		const guild_id = interaction.guildId!;

		if (author_id === user_id) {
			await this.removeBirthdayRequest(user_id, guild_id);
		} else {
			const hasPermissions = await hasUserGuildPermissions(interaction, author_id, ['ManageRoles']);
			if (hasPermissions) {
				await this.removeBirthdayRequest(user_id, guild_id);
				this.updateList = true;
			} else {
				this.embed.description = `${ARROW_RIGHT} \`You don't have the permission to remove other users birthdays.\``;
			}
		}

		const generatedEmbed = await generateEmbed(this.embed);
		await replyToInteraction(interaction, { embeds: [generatedEmbed] });
		if (this.updateList) await updateBirthdayOverview(guild_id);
	}

	public async birthdayList(interaction: Subcommand.ChatInputCommandInteraction) {
		await thinking(interaction);
		const guild_id = interaction.guildId!;
		const { embed, components } = await generateBirthdayList(1, guild_id);

		const generatedEmbed = await generateEmbed(embed);
		await replyToInteraction(interaction, { embeds: [generatedEmbed], components: components });
	}

	public async birthdayShow(interaction: Subcommand.ChatInputCommandInteraction) {
		await thinking(interaction);
		const user_id = findOption(interaction, 'user', interaction.user.id);
		const guild_id = interaction.guildId!;
		const request = await getBirthdayByGuildAndUser(guild_id, user_id);
		// container.logger.info("request", request);
		this.embed.title = `${BOOK} Show Birthday`;
		if (isNullOrUndefinedOrEmpty(request)) {
			// container.logger.info("isEmpty");
			this.embed.description = `${ARROW_RIGHT} \`This user has no registered birthday.\``;
		} else {
			// container.logger.info("isNotEmpty");
			const birthday = request[0];
			const readableDate = getBeautifiedDate(birthday.birthday);
			this.embed.thumbnail_url = IMG_CAKE;
			this.embed.description = `${ARROW_RIGHT} <@${birthday.user_id}>'s birthday is at the \`${readableDate}\``;
		}
		const generatedEmbed = await generateEmbed(this.embed);
		await replyToInteraction(interaction, { embeds: [generatedEmbed] });
	}

	public async birthdayUpdate(interaction: Subcommand.ChatInputCommandInteraction) {
		await thinking(interaction);
		const user_id = findOption(interaction, 'user', interaction.user.id);
		const author_id = interaction.user.id;
		const guild_id = interaction.guildId!;

		if (author_id === user_id) {
			this.embed = await birthdayUpdateProcess(this.embed);
			this.updateList = this.embed.title === `${SUCCESS} Success` ? true : false;
		} else if (await hasUserGuildPermissions(interaction, author_id, ['ManageRoles'])) {
			await birthdayUpdateProcess(this.embed);
			this.updateList = this.embed.title === `${SUCCESS} Success` ? true : false;
		} else {
			this.embed.description = `${ARROW_RIGHT} \`You don't have the permissions to update another user's birthday.\``;
		}

		const generatedEmbed = await generateEmbed(this.embed);
		await replyToInteraction(interaction, { embeds: [generatedEmbed] });
		if (this.updateList) await updateBirthdayOverview(guild_id);

		async function birthdayUpdateProcess(embed: EmbedInformationModel): Promise<EmbedInformationModel> {
			const birthday = getDateFromInteraction(interaction);
			if (!birthday.isValidDate) {
				embed.description = `${ARROW_RIGHT} \`${birthday.message}\``;
			}

			if (birthday.isValidDate) {
				const request = await lib.chillihero['birthday-api'][AUTOCODE_ENV].birthday.update({
					user_id: user_id,
					birthday: birthday.date,
					guild_id: guild_id,
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

	public async birthdayTest(interaction: Subcommand.ChatInputCommandInteraction) {
		await thinking(interaction);
		const guild_id = interaction.guildId!;
		const user_id = interaction.user.id;
		const hasPermissions = await hasUserGuildPermissions(interaction, user_id, ['ManageRoles']);
		container.logger.info('hasPermissions', hasPermissions);
		if (hasPermissions) {
			await BirthdayReminderTask.prototype.birthdayEvent(guild_id, user_id, true);
			this.embed.title = `${SUCCESS} Success`;
			this.embed.description = `${ARROW_RIGHT} Birthday Test run!`;
		} else {
			this.embed.description = `${ARROW_RIGHT} \`You don't have the permission to run this command.\``;
		}
		const generatedEmbed = await generateEmbed(this.embed);
		await replyToInteraction(interaction, { embeds: [generatedEmbed] });
	}

	// Helper Functions
	private async removeBirthdayRequest(user_id: string, guild_id: string) {
		const removeRequest = await removeBirthday(user_id, guild_id);
		if (removeRequest.success) {
			this.embed.title = `${SUCCESS} Success`;
			this.embed.description = `${ARROW_RIGHT} I removed the Birthday from <@${user_id}>. 🎂`;
		} else {
			this.embed.description = `${ARROW_RIGHT} \`${removeRequest.message}\``;
		}
	}
}
