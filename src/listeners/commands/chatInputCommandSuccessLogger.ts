import type { User } from 'discord.js';

import { ApplyOptions } from '@sapphire/decorators';
import { type ChatInputCommandSuccessPayload, Events, Listener, LogLevel } from '@sapphire/framework';
import { cyan } from 'colorette';

@ApplyOptions<Listener.Options>({ event: Events.ChatInputCommandSuccess })
export class UserListener extends Listener<typeof Events.ChatInputCommandSuccess> {
	public override onLoad() {
		this.enabled = this.container.logger.has(LogLevel.Debug);
		return super.onLoad();
	}

	public run({ interaction }: ChatInputCommandSuccessPayload) {
		const shard = `[${cyan('0')}]`;
		const commandName = cyan(`/${interaction.commandName}`);
		const author = this.author(interaction.user);
		const sentAt = interaction.guildId ? `${interaction.guild?.name ?? 'Unknown'}[${cyan(interaction.guildId)}]` : cyan('Direct Messages');
		this.container.logger.debug(`${shard} - ${commandName} ${author} ${sentAt}`);
	}

	private author(author: User) {
		return `${author.username}[${cyan(author.id)}]`;
	}
}
