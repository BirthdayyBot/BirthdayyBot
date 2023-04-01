import { inlineCode, userMention } from '@discordjs/formatters';
import { ApplyOptions } from '@sapphire/decorators';
import { container } from '@sapphire/pieces';
import { Subcommand } from '@sapphire/plugin-subcommands';
import { isNullOrUndefinedOrEmpty } from '@sapphire/utilities';
import generateBirthdayList from '../../helpers/generate/birthdayList';
import generateEmbed from '../../helpers/generate/embed';
import { ARROW_RIGHT, BOOK, FAIL, IMG_CAKE, SUCCESS } from '../../helpers/provide/environment';
import { hasUserGuildPermissions } from '../../helpers/provide/permission';
import replyToInteraction from '../../helpers/send/response';
import { formatDateForDisplay } from '../../helpers/utils/date';
import getDateFromInteraction from '../../helpers/utils/getDateFromInteraction';
import { getCommandGuilds } from '../../helpers/utils/guilds';
import { BirthdayCMD } from '../../lib/commands/birthday';
import thinking from '../../lib/discord/thinking';

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
			name: 'show',
			chatInputRun: 'birthdayShow'
		},
		{
			name: 'test',
			chatInputRun: 'birthdayTest'
		}
	]
})
export class BirthdayCommand extends Subcommand {
	public override registerApplicationCommands(registry: Subcommand.Registry) {
		registry.registerChatInputCommand(BirthdayCMD(), {
			guildIds: getCommandGuilds('global')
		});
	}

	public async birthdayRegister(interaction: Subcommand.ChatInputCommandInteraction<'cached'>) {
		await thinking(interaction);
		const targetUser = interaction.options.getUser('user') ?? interaction.user;

		if (
			interaction.user.id !== targetUser.id &&
			!(await hasUserGuildPermissions({ interaction, user: interaction.user, permissions: ['ManageRoles'] }))
		) {
			return replyToInteraction(interaction, {
				embeds: [
					generateEmbed({
						title: `${FAIL} Failed`,
						description: `${ARROW_RIGHT} ${inlineCode("You don't have the permission to register other users birthdays.")}`
					})
				],
				ephemeral: true
			});
		}

		const date = getDateFromInteraction(interaction);
		if (isNullOrUndefinedOrEmpty(date) || !date.isValidDate) {
			return replyToInteraction(interaction, {
				embeds: [
					generateEmbed({
						title: `${FAIL} Failed`,
						description: `${ARROW_RIGHT} ${inlineCode('The date you entered is not valid.')}`
					})
				],
				ephemeral: true
			});
		}

		const birthday = await container.utilities.birthday.get.BirthdayByUserAndGuild(interaction.guildId, targetUser.id);

		if (!isNullOrUndefinedOrEmpty(birthday)) {
			return replyToInteraction(interaction, {
				embeds: [
					generateEmbed({
						title: `${FAIL} Failed`,
						description: `${ARROW_RIGHT} This user's birthday is already registerd. Use </birthday update:${935174192389840896n}>`
					})
				],
				ephemeral: true
			});
		}

		try {
			await container.utilities.birthday.create(date.date, interaction.guildId, targetUser);

			return replyToInteraction(interaction, {
				embeds: [
					generateEmbed({
						title: `${BOOK} Birthday Registered`,
						description: `${ARROW_RIGHT} ${inlineCode(`The birthday of ${targetUser.username} was successfully registered.`)}`,
						fields: [
							{
								name: 'Date',
								value: formatDateForDisplay(date.date),
								inline: true
							}
						],
						thumbnail_url: IMG_CAKE
					})
				],
				ephemeral: true
			});
		} catch (error: any) {
			container.logger.error(error);
			return replyToInteraction(interaction, {
				embeds: [
					generateEmbed({
						title: `${FAIL} Failed`,
						description: `${ARROW_RIGHT} ${inlineCode('An error occured while registering the birthday.')}`
					})
				],
				ephemeral: true
			});
		}
	}

	public async birthdayRemove(interaction: Subcommand.ChatInputCommandInteraction<'cached'>) {
		await thinking(interaction);
		const targetUser = interaction.options.getUser('user') ?? interaction.user;
		const { guildId } = interaction;

		if (
			interaction.user.id !== targetUser.id &&
			!(await hasUserGuildPermissions({ interaction, user: targetUser, permissions: ['ManageRoles'] }))
		) {
			return replyToInteraction(interaction, {
				embeds: [
					generateEmbed({
						title: `${FAIL} Failed`,
						description: `${ARROW_RIGHT} ${inlineCode("You don't have the permission to remove other users birthdays.")}`
					})
				],
				ephemeral: true
			});
		}

		const birthday = await container.utilities.birthday.get.BirthdayByUserAndGuild(guildId, targetUser.id);

		if (isNullOrUndefinedOrEmpty(birthday)) {
			return replyToInteraction(interaction, {
				embeds: [
					generateEmbed({
						title: `${FAIL} Failed`,
						description: `${ARROW_RIGHT} ${inlineCode('This user has no birthday registered.')}`
					})
				],
				ephemeral: true
			});
		}

		try {
			await container.utilities.birthday.delete.ByGuildAndUser(guildId, targetUser.id);

			return replyToInteraction(interaction, {
				embeds: [
					generateEmbed({
						title: `${BOOK} Birthday Removed`,
						description: `${ARROW_RIGHT} The birthday of ${userMention(targetUser.id)} was successfully removed.`
					})
				],
				ephemeral: true
			});
		} catch (error: any) {
			container.logger.error(error);
			return replyToInteraction(interaction, {
				embeds: [
					generateEmbed({
						title: `${FAIL} Failed`,
						description: `${ARROW_RIGHT} ${inlineCode('An error occured while removing the birthday.')}`
					})
				],
				ephemeral: true
			});
		}
	}

	public async birthdayList(interaction: Subcommand.ChatInputCommandInteraction<'cached'>) {
		await thinking(interaction);

		const { embed, components } = await generateBirthdayList(1, interaction.guildId);

		const generatedEmbed = generateEmbed(embed);
		await replyToInteraction(interaction, { embeds: [generatedEmbed], components });
	}

	public async birthdayShow(interaction: Subcommand.ChatInputCommandInteraction<'cached'>) {
		await thinking(interaction);
		const targetUser = interaction.options.getUser('user') ?? interaction.user;

		const birthday = await container.utilities.birthday.get.BirthdayByUserAndGuild(interaction.guildId, targetUser.id);

		if (isNullOrUndefinedOrEmpty(birthday)) {
			return replyToInteraction(interaction, {
				embeds: [
					generateEmbed({
						title: `${FAIL} Failed`,
						description: `${ARROW_RIGHT} ${inlineCode("This user doesn't have a birthday registered.")}`
					})
				],
				ephemeral: true
			});
		}

		const embed = generateEmbed({
			title: `${BOOK} Birthday`,
			description: `${ARROW_RIGHT} ${userMention(birthday.userId)}'s birthday is at the ${formatDateForDisplay(birthday.birthday)}.`,
			thumbnail_url: IMG_CAKE
		});

		return replyToInteraction(interaction, { embeds: [embed], ephemeral: true });
	}

	public async birthdayUpdate(interaction: Subcommand.ChatInputCommandInteraction<'cached'>) {
		await thinking(interaction);
		const targetUser = interaction.options.getUser('user') ?? interaction.user;

		if (
			interaction.user.id !== targetUser.id &&
			!(await hasUserGuildPermissions({ interaction, user: targetUser.id, permissions: ['ManageRoles'] }))
		) {
			return replyToInteraction(interaction, {
				embeds: [
					generateEmbed({
						title: `${FAIL} Failed`,
						description: `${ARROW_RIGHT} ${inlineCode("You don't have the permission to update other users birthdays.")}`
					})
				],
				ephemeral: true
			});
		}

		const birthday = await container.utilities.birthday.get.BirthdayByUserAndGuild(interaction.guildId, targetUser.id);

		if (isNullOrUndefinedOrEmpty(birthday)) {
			return replyToInteraction(interaction, {
				embeds: [
					generateEmbed({
						title: `${FAIL} Failed`,
						description: `${ARROW_RIGHT} ${inlineCode("This user doesn't have a birthday registered.")}`
					})
				],
				ephemeral: true
			});
		}

		const date = getDateFromInteraction(interaction);

		if (isNullOrUndefinedOrEmpty(date.date)) {
			const embed = generateEmbed({
				title: `${FAIL} Failed`,
				description: `${ARROW_RIGHT} ${inlineCode('Please provide a valid date')}`
			});

			return replyToInteraction(interaction, { embeds: [embed], ephemeral: true });
		}

		try {
			await container.utilities.birthday.update.BirthdayByUserAndGuild(interaction.guildId, targetUser.id, date.date);

			return replyToInteraction(interaction, {
				embeds: [
					generateEmbed({
						title: `${SUCCESS} Success`,
						description: `${ARROW_RIGHT} I updated the Birthday from ${userMention(birthday.userId)} to the ${formatDateForDisplay(
							date.date
						)}. 🎂`
					})
				]
			});
		} catch (error: any) {
			container.logger.error(error);
			return replyToInteraction(interaction, {
				embeds: [
					generateEmbed({
						title: `${FAIL} Failed`,
						description: `${ARROW_RIGHT} ${inlineCode('An error occurred while updating the birthday.')}`
					})
				],
				ephemeral: true
			});
		}
	}

	public async birthdayTest(interaction: Subcommand.ChatInputCommandInteraction<'cached'>) {
		await thinking(interaction);
		const targetUser = interaction.user;

		if (!(await hasUserGuildPermissions({ interaction, user: targetUser, permissions: ['ManageRoles'] }))) {
			const embed = generateEmbed({
				title: `${FAIL} Failed`,
				description: `${ARROW_RIGHT} ${inlineCode("You don't have the permission to run this command.")}`
			});
			return replyToInteraction(interaction, { embeds: [embed] });
		}

		await container.tasks.run('BirthdayReminderTask', { userId: targetUser.id, guildId: interaction.guildId, isTest: true });
		const embed = generateEmbed({
			title: `${SUCCESS} Success`,
			description: `${ARROW_RIGHT} ${inlineCode('Birthday Test Run!')}`
		});
		return replyToInteraction(interaction, { embeds: [embed] });
	}
}
