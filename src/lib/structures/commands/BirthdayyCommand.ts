import {
	BirthdayyCommandConstructorDefaults,
	implementBirthdayyCommandError,
	implementBirthdayyCommandPaginatedOptions,
	implementBirthdayyCommandParseConstructorPreConditionsPermissionLevel,
	type ExtendOptions
} from '#lib/structures/commands/base/BaseBirthdayyCommandUtilities';
import { PermissionLevels } from '#lib/types';
import {
	Command,
	Args as SapphireArgs,
	UserError,
	type Awaitable,
	type ChatInputCommand,
	type MessageCommand
} from '@sapphire/framework';
import { ChatInputCommandInteraction, type CacheType } from 'discord.js';

/**
 * The base class for all Birthdayy commands.
 * @see {@link BirthdayySubcommand} for subcommand support.
 */
export abstract class BirthdayyCommand extends Command<BirthdayyCommand.Args, BirthdayyCommand.Options> {
	public readonly permissionLevel: PermissionLevels;

	public constructor(context: Command.LoaderContext, options: BirthdayyCommand.Options) {
		super(context, { ...BirthdayyCommandConstructorDefaults, ...options });
		this.permissionLevel = options.permissionLevel ?? BirthdayyCommandConstructorDefaults.permissionLevel;
	}

	protected error(identifier: UserError | string, context?: unknown): never {
		implementBirthdayyCommandError(identifier, context);
	}

	protected override parseConstructorPreConditions(options: BirthdayyCommand.Options): void {
		super.parseConstructorPreConditions(options);
		implementBirthdayyCommandParseConstructorPreConditionsPermissionLevel(this, options.permissionLevel);
	}

	public abstract override chatInputRun(
		interaction: ChatInputCommandInteraction,
		context: ChatInputCommand.RunContext
	): Awaitable<unknown>;

	public static readonly PaginatedOptions = implementBirthdayyCommandPaginatedOptions<BirthdayyCommand.Options>;
}

export namespace BirthdayyCommand {
	export type Options = ExtendOptions<Command.Options>;
	export type Args = SapphireArgs;
	export type LoaderContext = Command.LoaderContext;
	export type RunContext = MessageCommand.RunContext;

	export type Interaction<Cached extends CacheType = 'cached'> = ChatInputCommandInteraction<Cached>;
}
