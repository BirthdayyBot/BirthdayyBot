import { LanguageHelpDisplayOptions } from '#lib/i18n/LanguageHelp';
import {
	BirthdayyCommandConstructorDefaults,
	type ExtendOptions,
	implementBirthdayyCommandError,
	implementBirthdayyCommandPaginatedOptions,
	implementBirthdayyCommandParseConstructorPreConditionsPermissionLevel
} from '#lib/structures/commands/base/BaseBirthdayyCommandUtilities';
import { PermissionLevels } from '#lib/types';
import { first } from '#utils/common';
import { type Awaitable, ChatInputCommand, Command, type MessageCommand, Args as SapphireArgs, UserError } from '@sapphire/framework';
import { ChatInputCommandInteraction, Snowflake } from 'discord.js';

/**
 * The base class for all Birthdayy commands.
 * @seealso {@link BirthdayySubcommand} for subcommand support.
 */
export abstract class BirthdayyCommand extends Command<BirthdayyCommand.Args, BirthdayyCommand.Options> {
	public declare readonly description: string;
	public declare readonly detailedDescription: LanguageHelpDisplayOptions;
	public readonly guarded: boolean;
	public readonly hidden: boolean;
	public readonly permissionLevel: PermissionLevels;

	public constructor(context: Command.LoaderContext, options: BirthdayyCommand.Options) {
		super(context, { ...BirthdayyCommandConstructorDefaults, ...options });
		this.guarded = options.guarded ?? BirthdayyCommandConstructorDefaults.guarded;
		this.hidden = options.hidden ?? BirthdayyCommandConstructorDefaults.hidden;
		this.permissionLevel = options.permissionLevel ?? BirthdayyCommandConstructorDefaults.permissionLevel;
	}

	/**
	 * Retrieves the global command id from the application command registry.
	 *
	 * @remarks
	 *
	 * This method is used for slash commands, and will throw an error if the
	 * global command ids are empty.
	 */
	public getGlobalCommandId(): Snowflake {
		const ids = this.applicationCommandRegistry.globalChatInputCommandIds;
		if (ids.size === 0) throw new Error('The global command ids are empty.');
		return first(ids.values())!;
	}

	protected error(identifier: UserError | string, context?: unknown): never {
		implementBirthdayyCommandError(identifier, context);
	}

	protected override parseConstructorPreConditions(options: BirthdayyCommand.Options): void {
		super.parseConstructorPreConditions(options);
		implementBirthdayyCommandParseConstructorPreConditionsPermissionLevel(this, options.permissionLevel);
	}

	public abstract override chatInputRun(interaction: ChatInputCommandInteraction, context: ChatInputCommand.RunContext): Awaitable<unknown>;

	public static readonly PaginatedOptions = implementBirthdayyCommandPaginatedOptions<BirthdayyCommand.Options>;
}

export namespace BirthdayyCommand {
	export type Options = ExtendOptions<Command.Options>;
	export type Args = SapphireArgs;
	export type LoaderContext = Command.LoaderContext;
	export type RunContext = MessageCommand.RunContext;

	export type Interaction = ChatInputCommandInteraction<'cached'>;
}
