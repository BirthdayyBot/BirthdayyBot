import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener } from '@sapphire/framework';
import { DEBUG } from '#utils/environment';
import { cyan } from 'colorette';
import {
	ApplicationCommandOptionType,
	type ChatInputCommandInteraction,
	type CommandInteractionOption,
	type ContextMenuCommandInteraction,
	type Interaction
} from 'discord.js';

@ApplyOptions<Listener.Options>({ event: Events.InteractionCreate })
export class UserListener extends Listener<typeof Events.InteractionCreate> {
	private readonly seenInteractionIds = new Set<string>();

	public run(interaction: Interaction) {
		// De-dupe in case multiple interaction events fire/loggers attach.
		if (this.seenInteractionIds.has(interaction.id)) return;
		this.seenInteractionIds.add(interaction.id);
		// Avoid unbounded growth in long-running processes.
		if (this.seenInteractionIds.size > 1_000) this.seenInteractionIds.clear();

		if (interaction.isChatInputCommand()) return this.logChatInput(interaction);
		if (interaction.isContextMenuCommand()) return this.logContextMenu(interaction);
	}

	public override onLoad() {
		// Always enabled (including production). Verbosity controlled by DEBUG env.
		this.enabled = true;
		return super.onLoad();
	}

	private logChatInput(interaction: ChatInputCommandInteraction) {
		const shardId = interaction.guild?.shardId ?? 0;
		const shard = `[${cyan(String(shardId))}]`;
		const commandName = cyan(`/${interaction.commandName}`);
		const author = `${interaction.user.username}[${cyan(interaction.user.id)}]`;
		const sentAt = interaction.guildId
			? `${interaction.guild?.name ?? 'Unknown'}[${cyan(interaction.guildId)}]`
			: cyan('Direct Messages');

		// Always log the command. Only include full option payload when DEBUG=true.
		if (DEBUG) {
			const options = serializeChatInputOptions(interaction.options.data);
			this.container.logger.debug(`${shard} - ${commandName} ${author} ${sentAt}\n${options}`);
			return;
		}

		this.container.logger.info(`${shard} - ${commandName} ${author} ${sentAt}`);
	}

	private logContextMenu(interaction: ContextMenuCommandInteraction) {
		const shardId = interaction.guild?.shardId ?? 0;
		const shard = `[${cyan(String(shardId))}]`;
		const commandName = cyan(interaction.commandName);
		const author = `${interaction.user.username}[${cyan(interaction.user.id)}]`;
		const sentAt = interaction.guildId
			? `${interaction.guild?.name ?? 'Unknown'}[${cyan(interaction.guildId)}]`
			: cyan('Direct Messages');

		if (DEBUG) {
			this.container.logger.debug(
				`${shard} - ${commandName} ${author} ${sentAt}\n${JSON.stringify(
					{
						commandType: interaction.commandType,
						targetId: interaction.targetId
					},
					null,
					2
				)}`
			);
			return;
		}

		this.container.logger.info(`${shard} - ${commandName} ${author} ${sentAt}`);
	}
}

function serializeChatInputOptions(options: readonly CommandInteractionOption[]) {
	if (!options.length) return 'options: <none>';
	return JSON.stringify(options.map(serializeChatInputOption), null, 2);
}

function serializeChatInputOption(option: CommandInteractionOption): Record<string, unknown> {
	const base: Record<string, unknown> = { name: option.name, type: option.type };

	if (
		option.type === ApplicationCommandOptionType.SubcommandGroup ||
		option.type === ApplicationCommandOptionType.Subcommand
	) {
		base.options = option.options?.map(serializeChatInputOption) ?? [];
		return base;
	}

	if (option.value !== undefined) base.value = option.value;
	if (option.user) base.user = { id: option.user.id, username: option.user.username };
	if (option.member && typeof option.member === 'object' && 'user' in option.member) {
		const memberUser = option.member.user;
		base.member = { id: memberUser.id, username: memberUser.username };
	}
	if (option.channel) base.channel = { id: option.channel.id, name: option.channel.name, type: option.channel.type };
	if (option.role) base.role = { id: option.role.id, name: option.role.name };
	if (option.attachment) {
		base.attachment = {
			id: option.attachment.id,
			name: option.attachment.name,
			contentType: option.attachment.contentType,
			size: option.attachment.size
		};
	}

	return base;
}
