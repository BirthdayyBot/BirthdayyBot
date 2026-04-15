import { ApplyOptions } from '@sapphire/decorators';
import { Events, Listener, LogLevel } from '@sapphire/framework';
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
	public run(interaction: Interaction) {
		if (interaction.isChatInputCommand()) return this.logChatInput(interaction);
		if (interaction.isContextMenuCommand()) return this.logContextMenu(interaction);
	}

	public override onLoad() {
		this.enabled = this.container.logger.has(LogLevel.Debug);
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

		const options = serializeChatInputOptions(interaction.options.data);
		this.container.logger.debug(`${shard} - ${commandName} ${author} ${sentAt}`, options);
	}

	private logContextMenu(interaction: ContextMenuCommandInteraction) {
		const shardId = interaction.guild?.shardId ?? 0;
		const shard = `[${cyan(String(shardId))}]`;
		const commandName = cyan(interaction.commandName);
		const author = `${interaction.user.username}[${cyan(interaction.user.id)}]`;
		const sentAt = interaction.guildId
			? `${interaction.guild?.name ?? 'Unknown'}[${cyan(interaction.guildId)}]`
			: cyan('Direct Messages');

		this.container.logger.debug(
			`${shard} - ${commandName} ${author} ${sentAt}`,
			JSON.stringify(
				{
					commandType: interaction.commandType,
					targetId: interaction.targetId
				},
				null,
				2
			)
		);
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
