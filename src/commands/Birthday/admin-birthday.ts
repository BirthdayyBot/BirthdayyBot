import { BirthdayySubcommand } from '#lib/structures';
import { PermissionLevels } from '#lib/types';
import {
	registerDayOption,
	registerMonthOption,
	registerUserOption,
	registerUserRequiredOption,
	registerYearOption
} from '#utils/birthday';
import { getDateFromInteraction } from '#utils/common';
import { interactionSuccess } from '#utils/embed';
import { getBirthdays } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry, CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { applyDescriptionLocalizedBuilder, resolveKey } from '@sapphire/plugin-i18next';
import { isNullish, objectValues } from '@sapphire/utilities';
import type { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandSubcommandBuilder } from 'discord.js';

@ApplyOptions<BirthdayySubcommand.Options>({
	subcommands: [
		{ name: 'set', chatInputRun: 'chatInputRunSet' },
		{ name: 'remove', chatInputRun: 'chatInputRunRemove' },
		{ name: 'test', chatInputRun: 'chatInputRunTest' }
	],
	runIn: CommandOptionsRunTypeEnum.GuildAny,
	permissionLevel: PermissionLevels.Moderator
})
export class UserCommand extends BirthdayySubcommand {
	public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
		registry.registerChatInputCommand((builder) =>
			this.registerSubcommands(
				applyDescriptionLocalizedBuilder(builder, 'commands/admin-birthday:rootDescription') //
					.setName('admin-birthday')
					.setDMPermission(false)
			)
		);
	}

	public async chatInputRunSet(interaction: ChatInputCommandInteraction<'cached'>) {
		const user = interaction.options.getUser('user', true);
		const birthday = getDateFromInteraction(interaction);

		const result = await getBirthdays(interaction.guildId).upsert({ userId: user.id, birthday });

		if (isNullish(result)) {
			const content = await resolveKey(interaction, 'commands/admin-birthday:setFailure', { user });
			return interaction.reply({ content });
		}

		const content = await resolveKey(interaction, 'commands/admin-birthday:setSuccess', { user, birthday });
		return interaction.reply({ content });
	}

	public async chatInputRunRemove(interaction: ChatInputCommandInteraction<'cached'>) {
		const user = interaction.options.getUser('user', true);
		const result = await getBirthdays(interaction.guildId).remove(user.id);

		if (isNullish(result)) {
			const content = await resolveKey(interaction, 'commands/admin-birthday:removeFailureNoBirthday', { user });
			return interaction.reply({ content });
		}

		const content = await resolveKey(interaction, 'commands/admin-birthday:removeSuccess', { user });
		return interaction.reply({ content });
	}

	public async chatInputRunTest(interaction: ChatInputCommandInteraction<'cached'>) {
		const user = interaction.options.getUser('user') ?? interaction.user;
		const birthday = await getBirthdays(interaction.guild).fetch(user.id);

		if (isNullish(birthday)) {
			const content = await resolveKey(interaction, 'commands/admin-birthday:testFailure', { user });
			return interaction.reply({ content });
		}

		const result = await getBirthdays(interaction.guild).announcedBirthday(birthday);

		const content = result ? objectValues(result).join('\n') : 'Birthday Test Run';

		return interaction.reply(interactionSuccess(content));
	}

	private registerSubcommands(builder: SlashCommandBuilder) {
		return builder
			.addSubcommand((subcommand) => this.registerSetSubCommand(subcommand))
			.addSubcommand((subcommand) => this.registerRemoveSubCommand(subcommand))
			.addSubcommand((subcommand) => this.registerTestSubCommand(subcommand));
	}

	private registerSetSubCommand(builder: SlashCommandSubcommandBuilder) {
		return applyDescriptionLocalizedBuilder(builder.setName('set'), 'commands/admin-birthday:setDescription') //
			.addUserOption((option) =>
				registerUserRequiredOption(option, 'commands/admin-birthday:setOptionsUserDescription')
			)
			.addIntegerOption((option) => registerDayOption(option, 'commands/admin-birthday:setOptionsDayDescription'))
			.addIntegerOption((option) =>
				registerMonthOption(option, 'commands/admin-birthday:setOptionsMonthDescription')
			)
			.addIntegerOption((option) =>
				registerYearOption(option, 'commands/admin-birthday:setOptionsYearDescription')
			);
	}

	private registerRemoveSubCommand(builder: SlashCommandSubcommandBuilder) {
		return applyDescriptionLocalizedBuilder(builder.setName('remove'), 'commands/admin-birthday:removeDescription') //
			.addUserOption((option) =>
				registerUserRequiredOption(option, 'commands/admin-birthday:removeOptionsUserDescription')
			);
	}

	private registerTestSubCommand(builder: SlashCommandSubcommandBuilder) {
		return applyDescriptionLocalizedBuilder(builder.setName('test'), 'commands/admin-birthday:testDescription') //
			.addUserOption((option) =>
				registerUserOption(option, 'commands/admin-birthday:testOptionsUserDescription')
			);
	}
}
