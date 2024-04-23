import { dayOptions, monthOptions, userOptions, yearOptions } from '#lib/components/builder';
import { BirthdayySubcommand } from '#lib/structures';
import { updateBirthdayOverview } from '#lib/utils/birthday/overview';
import { addZeroToSingleDigitNumber } from '#lib/utils/common/string';
import { floatPromise, resolveOnErrorCodesPrisma } from '#lib/utils/functions/promises';
import { formatDateForDisplay, numberToMonthName } from '#utils/common/date';
import { BrandingColors, Emojis, PrismaErrorCodeEnum } from '#utils/constants';
import { interactionProblem, interactionSuccess } from '#utils/embed';
import { getBirthdays } from '#utils/functions/guilds';
import { resolveTarget } from '#utils/utils';
import { type SlashCommandBuilder, type SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, CommandOptionsRunTypeEnum, Result } from '@sapphire/framework';
import { applyLocalizedBuilder, fetchT, resolveKey } from '@sapphire/plugin-i18next';
import { isNullish, isNullOrUndefined, Nullish } from '@sapphire/utilities';
import { bold, chatInputApplicationCommandMention, EmbedBuilder } from 'discord.js';
import { container } from '@sapphire/pieces';

@ApplyOptions<BirthdayySubcommand.Options>({
	description: 'commands/birthdayy:description',
	detailedDescription: 'commands/birthdayy:detailedDescription',
	subcommands: [
		{ name: 'set', chatInputRun: 'runSet' },
		{ name: 'reset', chatInputRun: 'runReset' },
		{ name: 'upcoming', chatInputRun: 'runUpcoming' },
		{ name: 'view', chatInputRun: 'runView' }
	],
	runIn: CommandOptionsRunTypeEnum.GuildAny
})
export class UserCommand extends BirthdayySubcommand {
	public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
		registry.registerChatInputCommand(
			(
				builder //
			) => this.registerSubcommands(builder).setDMPermission(false)
		);
	}

	public async runSet(interaction: BirthdayySubcommand.Interaction) {
		const settings = await container.prisma.guild.findUnique({
			where: { id: interaction.guildId },
			select: { rolesBirthday: true, channelsAnnouncement: true }
		});

		if (!this.isCorrectlyConfigured(settings?.rolesBirthday, settings?.channelsAnnouncement))
			this.error('commands/birthdayy:setBirthdayNotConfigured');

		const birthday = this.extractBirthdayFromOptions(interaction.options);
		const user = interaction.options.getUser('target') ?? interaction.user;
		const isSelfUser = user.id === interaction.user.id;

		await container.prisma.birthday.upsert({
			where: { userId_guildId: { userId: user.id, guildId: interaction.guildId } },
			update: { birthday },
			create: {
				birthday,
				guild: {
					connectOrCreate: {
						where: { id: interaction.guildId },
						create: { id: interaction.guildId }
					}
				},
				user: {
					connectOrCreate: {
						where: { id: user.id },
						create: {
							id: user.id
						}
					}
				}
			}
		});

		const t = await fetchT(interaction);

		const content = isSelfUser ? t('commands/birthday:setSelfSuccess') : t('commands/birthday:setSuccessTarget', { target: user.toString() });

		const embed = new EmbedBuilder().setColor(BrandingColors.Primary).setDescription(content);

		return interaction.reply({ embeds: [embed] });
	}

	public async runReset(interaction: BirthdayySubcommand.Interaction) {
		const user = interaction.options.getUser('target') ?? interaction.user;
		const isSelfUser = user.id === interaction.user.id;

		const result = await Result.fromAsync(
			await container.prisma.birthday.delete({
				where: { userId_guildId: { userId: user.id, guildId: interaction.guildId } }
			})
		);
		const t = await fetchT(interaction);
		const content = result.match({
			ok: () => (isSelfUser ? t('commands/birthday:resetSelfSuccess') : t('commands/birthday:resetTargetSuccess')),
			err: () => (isSelfUser ? t('commands/birthdayy:resetSelfFailure') : t('commands/birthday:resetTargetFailure'))
		});

		const embed = new EmbedBuilder().setColor(BrandingColors.Primary).setDescription(content);

		return interaction.reply({ embeds: [embed] });
	}

	public async runUpcoming(_interaction: BirthdayySubcommand.Interaction) {}

	public async list(interaction: BirthdayySubcommand.Interaction) {
		const birthdayManager = getBirthdays(interaction.guild);
		const month = interaction.options.getInteger('month');

		const birthdays = month ? birthdayManager.findBirthdayWithMonth(month) : birthdayManager.findTeenNextBirthday();

		const options = { month: numberToMonthName(Number(month)), context: month ? 'month' : '' };

		const title = month
			? await resolveKey(interaction, 'commands/birthday:list.title.month', options)
			: await resolveKey(interaction, 'commands/birthday:list.title.next');

		return birthdayManager.sendListBirthdays(interaction, birthdays, title);
	}

	public async set(interaction: BirthdayySubcommand.Interaction) {
		const target = interaction.options.getUser('user') ?? interaction.user;
		const day = interaction.options.getInteger('day', true);
		const month = interaction.options.getInteger('month', true);
		const year = interaction.options.getInteger('year');

		const context = target === interaction.user ? 'user' : 'self';

		const birthday = `${year ?? 'XXXX'}/${addZeroToSingleDigitNumber(month)}/${addZeroToSingleDigitNumber(day)}`;

		await this.container.prisma.birthday.upsert({
			create: { userId: target.id, guildId: interaction.guildId, birthday },
			where: { userId_guildId: { guildId: interaction.guildId, userId: target.id } },
			update: { birthday }
		});

		floatPromise(updateBirthdayOverview(interaction.guild));

		const content = await resolveKey(interaction, 'commands/birthday:set.success', { birthday, target, context });

		return interaction.reply(content);
	}

	public async remove(interaction: BirthdayySubcommand.Interaction) {
		const target = interaction.options.getUser('user') ?? interaction.user;
		const context = target ? 'user' : 'self';

		const result = await resolveOnErrorCodesPrisma(
			this.container.prisma.birthday.delete({
				where: { userId_guildId: { guildId: interaction.guildId, userId: target.id } }
			}),
			PrismaErrorCodeEnum.NotFound
		);

		if (isNullish(result)) {
			const key = await resolveKey(interaction, 'commands/birthday:remove.notRegistered', { target, context });
			return interactionProblem(interaction, key);
		}

		floatPromise(updateBirthdayOverview(interaction.guild));

		return interactionSuccess(interaction, await resolveKey(interaction, 'commands/birthday:remove.success', { target, context }));
	}

	public async show(interaction: BirthdayySubcommand.Interaction) {
		const { user, options } = resolveTarget(interaction);
		const birthday = getBirthdays(interaction.guild).get(user.id);

		if (isNullOrUndefined(birthday)) {
			return interactionProblem(interaction, await resolveKey(interaction, 'commands/birthday:show.notRegistered'));
		}

		return interactionSuccess(
			interaction,
			await resolveKey(interaction, 'commands/birthday:show.success', {
				date: bold(formatDateForDisplay(birthday.birthday)),
				emoji: Emojis.Arrow,
				...options
			})
		);
	}

	public async test(interaction: BirthdayySubcommand.Interaction) {
		const target = interaction.options.getUser('user') ?? interaction.user;
		const context = target ? 'user' : 'self';

		const birthay = await this.container.prisma.birthday.findUnique({
			where: { userId_guildId: { guildId: interaction.guildId, userId: target.id } }
		});

		if (isNullish(birthay)) {
			const key = await resolveKey(interaction, 'commands/birthday:remove.notRegistered', { target, context });
			return interactionProblem(interaction, key);
		}

		const payload = { userId: target.id, guildId: interaction.guildId, isTest: true };

		await this.container.tasks.create({ name: 'BirthdayReminderTask', payload });

		return interaction.reply(
			'Birthday reminder task created. Consult the overview and your roles to verify that the task has been carried out correctly.'
		);
	}

	private extractBirthdayFromOptions(options: BirthdayySubcommand.Interaction['options']) {
		const year = options.getString('year') ?? 'XXXX';
		const month = options.getString('month', true);
		const day = options.getString('day', true);

		return `${year}-${month}-${day}`;
	}

	private isCorrectlyConfigured(birthdayRole: string | Nullish, birthdayChannel: string | Nullish) {
		// A birthday role, or a channel and message must be configured:
		return !isNullish(birthdayRole) || !isNullish(birthdayChannel);
	}

	private registerSubcommands(builder: SlashCommandBuilder) {
		return applyLocalizedBuilder(builder, 'commands/birthday:birthday')
			.addSubcommand((subcommand) => this.registerListSubcommand(subcommand))
			.addSubcommand((subcommand) => this.registerSetSubcommand(subcommand))
			.addSubcommand((subcommand) => this.registerRemoveSubcommand(subcommand))
			.addSubcommand((subcommand) => this.registerShowSubcommand(subcommand))
			.addSubcommand((subcommand) => this.registerTestSubcommand(subcommand));
	}

	private registerShowSubcommand(builder: SlashCommandSubcommandBuilder) {
		return applyLocalizedBuilder(builder, 'commands/birthday:show').addUserOption((option) => userOptions(option, 'commands/birthday:show.user'));
	}

	private registerSetSubcommand(builder: SlashCommandSubcommandBuilder) {
		return applyLocalizedBuilder(builder, 'commands/birthday:set')
			.addIntegerOption((option) => dayOptions(option, 'commands/birthday:set.day'))
			.addIntegerOption((option) => monthOptions(option, 'commands/birthday:set.month'))
			.addIntegerOption((option) => yearOptions(option, 'commands/birthday:set.year'))
			.addUserOption((option) => userOptions(option, 'commands/birthday:set.user'));
	}

	private registerRemoveSubcommand(builder: SlashCommandSubcommandBuilder) {
		return applyLocalizedBuilder(builder, 'commands/birthday:remove').addUserOption((option) =>
			userOptions(option, 'commands/birthday:remove.user')
		);
	}

	private registerListSubcommand(builder: SlashCommandSubcommandBuilder) {
		return applyLocalizedBuilder(builder, 'commands/birthday:list').addIntegerOption((option) =>
			monthOptions(option, 'commands/birthday:list.month').setRequired(false)
		);
	}

	private registerTestSubcommand(builder: SlashCommandSubcommandBuilder) {
		return applyLocalizedBuilder(builder, 'commands/birthday:test').addUserOption((option) => userOptions(option, 'commands/birthday:test.user'));
	}
}

export const BirthdayApplicationCommandMentions = {
	List: chatInputApplicationCommandMention('birthday', 'list', '935174192389840896'),
	Set: chatInputApplicationCommandMention('birthday', 'set', '935174192389840896'),
	Remove: chatInputApplicationCommandMention('birthday', 'remove', '935174192389840896'),
	Show: chatInputApplicationCommandMention('birthday', 'show', '935174192389840896'),
	Test: chatInputApplicationCommandMention('birthday', 'test', '935174192389840896')
} as const;
