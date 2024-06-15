import { BirthdayySubcommand } from '#lib/structures';
import { PermissionLevels } from '#lib/types';
import { UserCommand as BirthdayCommand } from '#root/commands/Birthday/birthday';
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
					.setName('birthday')
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
		return applyDescriptionLocalizedBuilder(builder, 'commands/admin-birthday:setDescription')
			.setName('set')
			.addIntegerOption((option) =>
				BirthdayCommand.dayOptions(option, 'commands/admin-birthday:setOptionsDayDescription')
			)
			.addIntegerOption((option) =>
				BirthdayCommand.monthOptions(option, 'commands/admin-birthday:setOptionsMonthDescription')
			)
			.addIntegerOption((option) =>
				BirthdayCommand.yearOptions(option, 'commands/admin-birthday:setOptionsYearDescription')
			)
			.addUserOption((option) =>
				BirthdayCommand.userOptions(option, 'commands/admin-birthday:setOptionsUserDescription')
			);
	}

	private registerRemoveSubCommand(builder: SlashCommandSubcommandBuilder) {
		return applyDescriptionLocalizedBuilder(builder, 'commands/birthday:removeDescription')
			.setName('remove')
			.addUserOption((option) =>
				BirthdayCommand.userOptions(option, 'commands/admin-birthday:removeOptionsUserDescription')
			);
	}

	private registerTestSubCommand(builder: SlashCommandSubcommandBuilder) {
		return applyDescriptionLocalizedBuilder(builder, 'commands/birthday:testDescription')
			.setName('test')
			.addUserOption((option) =>
				BirthdayCommand.userOptions(option, 'commands/admin-birthday:testOptionsUserDescription')
			);
	}
}
