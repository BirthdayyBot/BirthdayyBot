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
import { isNullOrUndefinedOrEmpty } from '@sapphire/utilities';
import updateBirthdayOverview from '../../helpers/update/overview';
import { BirthdayCMD } from '../../lib/commands/birthday';
import { getCommandGuilds } from '../../helpers/utils/guilds';
import { hasUserGuildPermissions } from '../../helpers/provide/permission';
import type { EmbedInformationModel } from '../../lib/model/EmbedInformation.model';
import { APIErrorCode } from '../../lib/enum/APIErrorCode.enum';
import { Prisma } from '@prisma/client';

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

	public async birthdayRegister(interaction: Subcommand.ChatInputCommandInteraction<'cached'>) {
		await thinking(interaction);
		const user_id = findOption(interaction, 'user', interaction.user.id);
		const author_id = interaction.user.id;
		const guild_id = interaction.guildId;

		if (author_id != user_id && !(await hasUserGuildPermissions(interaction, author_id, ['ManageRoles']))) {
			return replyToInteraction(interaction, {
				content: `${ARROW_RIGHT} \`You don't have the permission to register other users birthdays.\``,
			});
		}

		const date = getDateFromInteraction(interaction);
		if (isNullOrUndefinedOrEmpty(date) || date.isValidDate === false) {
			return replyToInteraction(interaction, {
				content: `${ARROW_RIGHT} \`Please provide a valid date.\``,
			});
		}

		try {
			await container.utilities.birthday.create(date.date, user_id, guild_id);
			return replyToInteraction(interaction, {
				content: `${ARROW_RIGHT} \`Birthday successfully registered.\``,
			});
		} catch (error: any) {
			if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
				return replyToInteraction(interaction, {
					content: `${ARROW_RIGHT} \`This user's birthday is already registered.\n Use /birthday update!\``,
				});
			}
			container.logger.error(error);
			return replyToInteraction(interaction, {
				content: `${ARROW_RIGHT} \`An error occurred while registering the birthday.\``,
			});
		}

	}

	public async birthdayRemove(interaction: Subcommand.ChatInputCommandInteraction<'cached'>) {
		await thinking(interaction);
		const user_id = findOption(interaction, 'user', interaction.user.id);
		const author_id = interaction.user.id;
		const guild_id = interaction.guildId;

		if (isNullOrUndefinedOrEmpty(guild_id)) {
			return replyToInteraction(interaction, {
				content: `${ARROW_RIGHT} \`This command can only be used in a server.\``,
			});
		}

		if (author_id != user_id && !(await hasUserGuildPermissions(interaction, author_id, ['ManageRoles']))) {
			return replyToInteraction(interaction, {
				content: `${ARROW_RIGHT} \`You don't have the permission to remove other users birthdays.\``,
			});
		}

		const birthday = await container.utilities.birthday.get.BirthdayByUserAndGuild(guild_id, user_id);
		if (isNullOrUndefinedOrEmpty(birthday)) {
			return replyToInteraction(interaction, {
				content: `${ARROW_RIGHT} \`This user has no birthday registered.\``,
			});
		}

		try {
			await container.utilities.birthday.delete.ByGuildAndUser(guild_id, user_id);
			return replyToInteraction(interaction, {
				content: `${ARROW_RIGHT} \`Birthday successfully removed.\``,
			});
		}
		catch (error: any) {
			container.logger.error(error);
			return replyToInteraction(interaction, {
				content: `${ARROW_RIGHT} \`An error occurred while removing the birthday.\``,
			});
		}

	}

	public async birthdayList(interaction: Subcommand.ChatInputCommandInteraction<'cached'>) {
		await thinking(interaction);
		const guild_id = interaction.guildId;
		const { embed, components } = await generateBirthdayList(1, guild_id);

		const generatedEmbed = await generateEmbed(embed);
		await replyToInteraction(interaction, { embeds: [generatedEmbed], components: components });
	}

	public async birthdayShow(interaction: Subcommand.ChatInputCommandInteraction<'cached'>) {
		await thinking(interaction);
		const user_id = findOption(interaction, 'user', interaction.user.id);
		const guild_id = interaction.guildId;
		const birthday = await container.utilities.birthday.get.BirthdayByUserAndGuild(guild_id, user_id);

		if (isNullOrUndefinedOrEmpty(birthday)) {
			return replyToInteraction(interaction, {
				content: `${ARROW_RIGHT} \`This user has no birthday registered.\``,
			});
		}

		const readableDate = getBeautifiedDate(birthday.birthday);

		const generatedEmbed = await generateEmbed({
			title: `${BOOK} Show Birthday`,
			description: `${ARROW_RIGHT} <@${birthday.user_id}>'s birthday is at the \`${readableDate}\``,
			thumbnail_url: IMG_CAKE,
		});

		return replyToInteraction(interaction, { embeds: [generatedEmbed] });
	}

	public async birthdayUpdate(interaction: Subcommand.ChatInputCommandInteraction<'cached'>) {
		await thinking(interaction);
		const user_id = findOption(interaction, 'user', interaction.user.id);
		const author_id = interaction.user.id;
		const guild_id = interaction.guildId;

		if (author_id != user_id && !(await hasUserGuildPermissions(interaction, author_id, ['ManageRoles']))) {
			return replyToInteraction(interaction, {
				content: `${ARROW_RIGHT} \`You don't have the permission to update other users birthdays.\``,
			});
		}

		const birthday = await container.utilities.birthday.get.BirthdayByUserAndGuild(guild_id, user_id);

		if (isNullOrUndefinedOrEmpty(birthday)) {
			return replyToInteraction(interaction, {
				content: `${ARROW_RIGHT} \`This user has no birthday registered.\n Use /birthday register!\``,
			});
		}

		const date = getDateFromInteraction(interaction);
		if (isNullOrUndefinedOrEmpty(date) || date.isValidDate === false) {
			return replyToInteraction(interaction, {
				content: `${ARROW_RIGHT} \`Please provide a valid date.\``,
			});
		}

		try {
			await container.utilities.birthday.update.BirthdayByUserAndGuild(guild_id, user_id, date.date);
			const beautifiedDate = getBeautifiedDate(date.date);
			return replyToInteraction(interaction, {
				content: `${ARROW_RIGHT} I updated the Birthday from <@${user_id}> to the \`${beautifiedDate}\`. 🎂`,
			});
		} catch (error: any) {
			container.logger.error(error);
			return replyToInteraction(interaction, {
				content: `${ARROW_RIGHT} \`An error occurred while updating the birthday.\``,
			});
		}

	}

	public async birthdayTest(interaction: Subcommand.ChatInputCommandInteraction<'cached'>) {
		await thinking(interaction);
		const guildID = interaction.guildId;
		const userID = interaction.user.id;

		if (!(await hasUserGuildPermissions(interaction, userID, ['ManageRoles']))) {
			const embed = await generateEmbed({
				description: `${ARROW_RIGHT} \`You don't have the permission to run this command.\``,
			});
			return replyToInteraction(interaction, { embeds: [embed] });
		}

		await container.tasks.run('BirthdayReminderTask', { userID, guildID, isTest: true });
		const embed = await generateEmbed({
			description: `${ARROW_RIGHT} \`Birthday Test Run!`,
		});
		await replyToInteraction(interaction, { embeds: [embed] });
	}
}
