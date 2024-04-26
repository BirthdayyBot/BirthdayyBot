import { formatBirthdayForDisplay } from '#lib/birthday';
import { getBirthdays, getSettings } from '#lib/discord';
import { getSupportedUserLanguageT } from '#lib/i18n/translate';
import { BirthdayySubcommand } from '#lib/structures';
import { BrandingColors } from '#utils/constants';
import { type SlashCommandBuilder, type SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { container } from '@sapphire/pieces';
import { applyLocalizedBuilder, applyNameLocalizedBuilder, fetchT, resolveKey } from '@sapphire/plugin-i18next';
import { Nullish, isNullOrUndefined, isNullish } from '@sapphire/utilities';
import { envParseString } from '@skyra/env-utilities';
import {
	ApplicationCommandType,
	ChatInputCommandInteraction,
	Colors,
	ContextMenuCommandBuilder,
	EmbedBuilder,
	User,
	UserContextMenuCommandInteraction,
	chatInputApplicationCommandMention
} from 'discord.js';

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
		registry.registerContextMenuCommand((builder) => this.registerContextViewCommand(builder));
	}

	public async runReset(interaction: BirthdayySubcommand.Interaction) {
		const birthday = await getBirthdays(interaction.guild).fetch(interaction.user.id);

		const t = await fetchT(interaction);

		if (isNullOrUndefined(birthday)) {
			const description = t('commands/birthday:resetBirthdayNotSet');
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
		const manager = getBirthdays(interaction.guild);

		const embed = await manager.createOverviewMessage(interaction.guild, manager.findTeenNextBirthday());

		return interaction.reply({ embeds: [embed] });
	}

	public async runView(interaction: BirthdayySubcommand.Interaction) {
		const user = interaction.options.getUser('target') ?? interaction.user;
		const embed = this.sharedViewRun(interaction, user);
		return interaction.reply({ embeds: [embed] });
	}

	public override async contextMenuRun(interaction: UserContextMenuCommandInteraction<'cached'>) {
		const embed = this.sharedViewRun(interaction, interaction.targetUser);
		return interaction.reply({ embeds: [embed], ephemeral: true });
	}

	private sharedViewRun(interaction: ChatInputCommandInteraction<'cached'> | UserContextMenuCommandInteraction<'cached'>, user: User) {
		const t = getSupportedUserLanguageT(interaction);

		const birthday = getBirthdays(interaction.guild).get(user.id);
		const content = birthday
			? t('commands/birthday:viewBirthdaySet', { birthDate: formatBirthdayForDisplay(birthday), user: user.toString() })
			: t('commands/birthday:viewBirthdayNotSet', {
					command: chatInputApplicationCommandMention('birthday', 'set', envParseString('BIRTHDAY_COMMAND_ID')),
					user: user.toString()
				});

		return new EmbedBuilder().setColor(birthday ? BrandingColors.Primary : Colors.Yellow).setDescription(content);
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

	private registerContextViewCommand(builder: ContextMenuCommandBuilder) {
		return applyNameLocalizedBuilder(builder, 'commands/birthday:viewContextMenuName')
			.setType(ApplicationCommandType.User)
			.setDMPermission(false);
	}
}

export const BirthdayApplicationCommandMentions = {
	List: chatInputApplicationCommandMention('birthday', 'list', '935174192389840896'),
	Remove: chatInputApplicationCommandMention('birthday', 'remove', '935174192389840896'),
	Set: chatInputApplicationCommandMention('birthday', 'set', '935174192389840896'),
	Show: chatInputApplicationCommandMention('birthday', 'show', '935174192389840896'),
	Test: chatInputApplicationCommandMention('birthday', 'test', '935174192389840896')
} as const;
