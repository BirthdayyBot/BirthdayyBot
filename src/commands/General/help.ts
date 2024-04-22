import { LanguageHelp, LanguageHelpDisplayOptions } from '#lib/i18n/LanguageHelp';
import { BirthdayyCommand } from '#lib/structures';
import { BrandingColors } from '#lib/utils/constants';
import { splitMessage } from '#lib/utils/utils';
import { ApplyOptions, RequiresClientPermissions } from '@sapphire/decorators';
import { PaginatedMessage } from '@sapphire/discord.js-utilities';
import { ApplicationCommandRegistry, ChatInputCommand, Command, container, Result } from '@sapphire/framework';
import { fetchT, TFunction } from '@sapphire/plugin-i18next';
import { AutocompleteInteraction, ChatInputCommandInteraction, Collection, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

/**
 * Sorts a collection alphabetically as based on the keys, rather than the values.
 * This is used to ensure that subcategories are listed in the pages right after the main category.
 * @param _ The first element for comparison
 * @param __ The second element for comparison
 * @param firstCategory Key of the first element for comparison
 * @param secondCategory Key of the second element for comparison
 */
function sortCommandsAlphabetically(_: Command[], __: Command[], firstCategory: string, secondCategory: string): 1 | -1 | 0 {
	if (firstCategory > secondCategory) return 1;
	if (secondCategory > firstCategory) return -1;
	return 0;
}

@ApplyOptions<BirthdayyCommand.Options>({
	description: 'Displays the help menu, providing information on available commands.'
})
export class UserCommand extends BirthdayyCommand {
	public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
		registry.registerChatInputCommand((builder) => {
			return builder
				.setName('help')
				.setDescription('Displays the help menu, providing information on available commands.')
				.addSubcommand((subcommand) =>
					subcommand
						.setName('categories')
						.setDescription('Displays all command categories.')
						.addStringOption((option) =>
							option.setName('category').setDescription('The category to display.').setRequired(false).setAutocomplete(true)
						)
				)
				.addSubcommand((subcommand) => subcommand.setName('all').setDescription('Displays all available commands.'))
				.addSubcommand((subcommand) =>
					subcommand
						.setName('command')
						.setDescription('Displays the help menu for a specific command.')
						.addStringOption((option) =>
							option.setName('command').setDescription('The command to display.').setRequired(true).setAutocomplete(true)
						)
				);
		});
	}

	public override chatInputRun(interaction: BirthdayyCommand.Interaction) {
		if (interaction.options.getSubcommand() === 'categories') return this.helpCategories(interaction);
		if (interaction.options.getSubcommand() === 'all') return this.all(interaction);
		if (interaction.options.getSubcommand() === 'command') {
			const commandName = interaction.options.getString('command', true);

			if (commandName) {
				const command = container.stores.get('commands').get(commandName);
				if (command) return this.buildCommandHelp(interaction, command);
			}

			return this.display(interaction, null);
		}

		return null;
	}

	public override async autocompleteRun(interaction: AutocompleteInteraction) {
		const { categories } = container.stores.get('commands');
		const focusedOption = interaction.options.getFocused(true);

		if (focusedOption.name === 'category') {
			const options = categories.map((category) => ({ name: category, value: category }));
			return interaction.respond(options.filter((option) => option.name.toLowerCase().includes(focusedOption.value.toLowerCase())));
		} else if (focusedOption.name === 'command') {
			const commands = container.stores
				.get('commands')
				.filter((command) => command.name.toLowerCase().includes(focusedOption.value.toLowerCase()));
			return interaction.respond(commands.map((command) => ({ name: command.name, value: command.name })));
		}
	}

	private async helpCategories(interaction: ChatInputCommandInteraction) {
		const commandsByCategory = await UserCommand.fetchCommands(interaction);
		const t = await fetchT(interaction);
		let i = 0;
		const commandCategories: string[] = [];
		for (const [category, commands] of commandsByCategory) {
			const line = String(++i).padStart(2, '0');
			commandCategories.push(
				`\`${line}.\` **${category}** → ${t('commands/general:helpCommandCount', {
					count: commands.length
				})}`
			);
		}

		const content = commandCategories.join('\n');
		return interaction.reply(content);
	}

	private async all(interaction: ChatInputCommandInteraction) {
		const t = await fetchT(interaction);
		const fullContent = await this.buildHelp(interaction, t);
		const contents = splitMessage(fullContent, { char: '\n', maxLength: 2000 });

		for (const content of contents) {
			const result = await Result.fromAsync(interaction.user.send(content));
			if (result.isOk()) continue;

			if (interaction.guild === null) this.error(t('commands/general:helpDmFailed'));
			return;
		}

		if (interaction.guild) await interaction.reply(t('commands/general:helpDm'));
	}

	@RequiresClientPermissions(PermissionFlagsBits.EmbedLinks)
	private async display(interaction: ChatInputCommandInteraction, index: number | null) {
		const t = await fetchT(interaction);
		const content = t('commands/general:helpAllFlag', { prefix: '/' });

		const display = await this.buildDisplay(interaction, t);
		if (index !== null) display.setIndex(index);

		const response = await interaction.reply({ content, fetchReply: true });
		await display.run(response, interaction.user);
		return response;
	}

	private async buildHelp(interaction: ChatInputCommandInteraction, language: TFunction) {
		const commands = await UserCommand.fetchCommands(interaction);

		const helpMessage: string[] = [];
		for (const [category, list] of commands) {
			helpMessage.push(`**${category} Commands**:\n`, list.map(this.formatCommand.bind(this, language, false)).join('\n'), '');
		}

		return helpMessage.join('\n');
	}

	private async buildDisplay(interaction: ChatInputCommandInteraction, t: TFunction) {
		const commandsByCategory = await UserCommand.fetchCommands(interaction);

		const display = new PaginatedMessage({
			template: new EmbedBuilder().setColor(BrandingColors.Primary)
		}) //
			.setSelectMenuOptions((pageIndex) => ({
				label: commandsByCategory.at(pageIndex - 1)![0].fullCategory!.join(' → ')
			}));

		for (const [category, commands] of commandsByCategory) {
			display.addPageEmbed((embed) =>
				embed //
					.setTitle(`${category} Commands`)
					.setDescription(commands.map(this.formatCommand.bind(this, t, true)).join('\n'))
			);
		}

		return display;
	}

	@RequiresClientPermissions(PermissionFlagsBits.EmbedLinks)
	private async buildCommandHelp(interaction: ChatInputCommandInteraction, command: Command) {
		const t = await fetchT(interaction);

		const builderData = t('system:helpTitles', { returnObjects: true }) as HelpTitlesData;

		const builder = new LanguageHelp()
			.setUsages(builderData.usages)
			.setExtendedHelp(builderData.extendedHelp)
			.setExplainedUsage(builderData.explainedUsage)
			.setExamples(builderData.examples)
			.setPossibleFormats(builderData.possibleFormats)
			.setReminder(builderData.reminders);

		const extendedHelpData = t(command.detailedDescription as string, {
			replace: {
				prefix: '/'
			},
			returnObjects: true
		}) as LanguageHelpDisplayOptions;

		const extendedHelp = builder.display(command.name, extendedHelpData);

		const data = t('commands/general:helpData', {
			footerName: command.name,
			titleDescription: t(command.description),
			returnObjects: true
		}) as { title: string; footer: string };

		return new EmbedBuilder()
			.setColor(BrandingColors.Primary)
			.setTimestamp()
			.setFooter({ text: data.footer })
			.setTitle(data.title)
			.setDescription(extendedHelp);
	}

	private formatCommand(t: TFunction, paginatedMessage: boolean, command: Command) {
		const description = t(command.description);
		return paginatedMessage ? `• /${command.name} → ${description}` : `• **/${command.name}** → ${description}`;
	}

	private static async fetchCommands(interaction: ChatInputCommandInteraction) {
		const commands = container.stores.get('commands');
		const filtered = new Collection<string, Command[]>();

		await Promise.all(
			commands.map(async (cmd) => {
				const command = cmd as Command;

				const result = await cmd.preconditions.chatInputRun(interaction, command as ChatInputCommand, {
					command: null!
				});

				if (result.isErr()) return;

				const category = filtered.get(command.fullCategory.join(' → '));
				if (category) category.push(command);
				else filtered.set(command.fullCategory.join(' → '), [command]);
			})
		);

		return filtered.sort(sortCommandsAlphabetically);
	}
}

interface HelpTitlesData {
	aliases: string;
	usages: string;
	extendedHelp: string;
	explainedUsage: string;
	possibleFormats: string;
	examples: string;
	reminders: string;
}
