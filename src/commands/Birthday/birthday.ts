import { formatBirthdayForDisplay, getAge } from '#lib/birthday';
import { getBirthdays, getSettings } from '#lib/discord';
import { BirthdayySubcommand } from '#lib/structures';
import { BrandingColors } from '#utils/constants';
import { type SlashCommandBuilder, type SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { container } from '@sapphire/pieces';
import { applyLocalizedBuilder, fetchT, resolveKey } from '@sapphire/plugin-i18next';
import { Nullish, isNullOrUndefined, isNullish } from '@sapphire/utilities';
import { envParseString } from '@skyra/env-utilities';
import dayjs from 'dayjs';
import { Colors, EmbedBuilder, chatInputApplicationCommandMention } from 'discord.js';

@ApplyOptions<BirthdayySubcommand.Options>({
	description: 'commands/birthday:rootDescription',
	runIn: CommandOptionsRunTypeEnum.GuildAny,
	subcommands: [
		{ chatInputRun: 'runSet', name: 'set' },
		{ chatInputRun: 'runReset', name: 'reset' },
		{ chatInputRun: 'runUpcoming', name: 'upcoming' },
		{ chatInputRun: 'runView', name: 'view' }
	]
})
export class UserCommand extends BirthdayySubcommand {
	public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
		registry.registerChatInputCommand((builder) => this.registerSubcommands(builder).setDMPermission(false));
	}

	public async runReset(interaction: BirthdayySubcommand.Interaction) {
		const birthday = await getBirthdays(interaction.guild).fetch(interaction.user.id);

		const t = await fetchT(interaction);

		if (isNullOrUndefined(birthday)) {
			const description = t('commands:birthday:resetBirthdayNotSet');
			return interaction.reply({ embeds: [new EmbedBuilder({ description, color: Colors.Red })], ephemeral: true });
		}

		await container.prisma.birthday.delete({
			where: { userId_guildId: { guildId: interaction.guildId, userId: interaction.user.id } }
		});

		await getBirthdays(interaction.guild).remove(interaction.user.id);

		const embed = new EmbedBuilder().setColor(BrandingColors.Primary).setDescription(t('commands:birthday:resetBirthdaySuccess'));

		return interaction.reply({ embeds: [embed] });
	}

	public async runSet(interaction: BirthdayySubcommand.Interaction) {
		const settings = await getSettings(interaction.guild).fetch();

		if (!this.isCorrectlyConfigured(settings.rolesBirthday, settings.channelsAnnouncement)) {
			const description = await resolveKey(interaction, 'commands/birthday:setBirthdayNotConfigured', {
				command: chatInputApplicationCommandMention('config', 'edit', envParseString('CONFIG_COMMAND_ID'))
			});
			return interaction.reply({ embeds: [new EmbedBuilder({ description, color: Colors.Red })], ephemeral: true });
		}

		const date = this.extractBirthdayFromOptions(interaction.options);

		await getBirthdays(interaction.guild).create({ ...date, userId: interaction.user.id });

		const content = await resolveKey(interaction, 'commands/birthday:setBirthdaySuccess', { nextBirthday: formatBirthdayForDisplay(date) });

		const embed = new EmbedBuilder().setColor(BrandingColors.Primary).setDescription(content);

		return interaction.reply({ embeds: [embed] });
	}

	public async runUpcoming(interaction: BirthdayySubcommand.Interaction) {
		const birthdays = await container.prisma.birthday.findMany({
			cursor: {
				day: dayjs().date(),
				month: dayjs().month() + 1,
				userId_guildId: {
					guildId: interaction.guildId,
					userId: interaction.user.id
				}
			},
			orderBy: { day: 'asc', month: 'asc' },
			where: { guildId: interaction.guildId }
		});

		const t = await fetchT(interaction);

		const embed = new EmbedBuilder().setColor(BrandingColors.Primary);

		if (birthdays.length === 0) {
			embed.setDescription(t('commands:birthday:upcomingNoBirthdays'));
		} else {
			const upcomingBirthdays = birthdays.map((birthday) => {
				const user = interaction.guild.members.cache.get(birthday.userId)?.user ?? { tag: 'Unknown User' };
				return t('commands:birthday:upcomingBirthday', {
					birthDate: formatBirthdayForDisplay(birthday),
					age: ` (${getAge(birthday)})`,
					user: user.toString()
				});
			});

			embed.setDescription(upcomingBirthdays.join('\n'));
		}

		return interaction.reply({ embeds: [embed] });
	}

	public async runView(interaction: BirthdayySubcommand.Interaction) {
		const user = interaction.options.getUser('target') ?? interaction.user;
		const t = await fetchT(interaction);

		const birthday = await getBirthdays(interaction.guild)
			.fetch(user.id)
			.catch(() => null);

		const content = birthday
			? t('commands:birthday:viewBirthdaySet', { birthDate: formatBirthdayForDisplay(birthday), user: user.toString() })
			: t('commands/birthday:viewBirthdayNotSet', {
					command: chatInputApplicationCommandMention('birthday', 'set', envParseString('BIRTHDAY_COMMAND_ID')),
					user: user.toString()
				});

		const embed = new EmbedBuilder().setColor(birthday ? BrandingColors.Primary : Colors.Yellow).setDescription(content);

		return interaction.reply({ embeds: [embed] });
	}

	private extractBirthdayFromOptions(options: BirthdayySubcommand.Interaction['options']) {
		const year = options.getInteger('year');
		const month = options.getInteger('month', true);
		const day = options.getInteger('day', true);

		return { day, month, year };
	}

	private isCorrectlyConfigured(birthdayRole: Nullish | string, birthdayChannel: Nullish | string) {
		// A birthday role, or a channel and message must be configured:
		return !isNullish(birthdayRole) || !isNullish(birthdayChannel);
	}

	private registerResetSubcommand(builder: SlashCommandSubcommandBuilder) {
		return applyLocalizedBuilder(builder, 'commands/birthday:resetName', 'commands/birthday:resetDescription');
	}

	private registerSetSubcommand(builder: SlashCommandSubcommandBuilder) {
		return applyLocalizedBuilder(builder, 'commands/birthday:setName', 'commands/birthday:setDescription')
			.addIntegerOption((option) =>
				applyLocalizedBuilder(option, 'commands/birthday:setOptionsDayName', 'commands/birthday:setOptionsDayDescription')
					.setRequired(true)
					.setMinValue(1)
					.setMaxValue(31)
			)
			.addIntegerOption((option) =>
				applyLocalizedBuilder(option, 'commands/birthday:setOptionsMonthName', 'commands/birthday:setOptionsMonthDescription')
					.setRequired(true)
					.setAutocomplete(true)
			)
			.addIntegerOption((option) =>
				applyLocalizedBuilder(option, 'commands/birthday:setOptionsYearName', 'commands/birthday:setOptionsYearDescription')
					.setRequired(false)
					.setMinValue(1903)
			);
	}

	private registerSubcommands(builder: SlashCommandBuilder) {
		return applyLocalizedBuilder(builder, 'commands/birthday:rootName', 'commands/birthday:rootDescription')
			.addSubcommand((subcommand) => this.registerSetSubcommand(subcommand))
			.addSubcommand((subcommand) => this.registerResetSubcommand(subcommand))
			.addSubcommand((subcommand) => this.registerUpcomingSubcommand(subcommand))
			.addSubcommand((subcommand) => this.registerViewSubcommand(subcommand));
	}

	private registerUpcomingSubcommand(builder: SlashCommandSubcommandBuilder) {
		return applyLocalizedBuilder(builder, 'commands/birthday:upcomingName', 'commands/birthday:upcomingDescription');
	}

	private registerViewSubcommand(builder: SlashCommandSubcommandBuilder) {
		return applyLocalizedBuilder(builder, 'commands/birthday:viewName', 'commands/birthday:viewDescription').addUserOption((option) =>
			applyLocalizedBuilder(option, 'commands/birthday:viewOptionsUserName', 'commands/birthday:viewOptionsUserDescription').setRequired(false)
		);
	}
}

export const BirthdayApplicationCommandMentions = {
	List: chatInputApplicationCommandMention('birthday', 'list', '935174192389840896'),
	Remove: chatInputApplicationCommandMention('birthday', 'remove', '935174192389840896'),
	Set: chatInputApplicationCommandMention('birthday', 'set', '935174192389840896'),
	Show: chatInputApplicationCommandMention('birthday', 'show', '935174192389840896'),
	Test: chatInputApplicationCommandMention('birthday', 'test', '935174192389840896')
} as const;
