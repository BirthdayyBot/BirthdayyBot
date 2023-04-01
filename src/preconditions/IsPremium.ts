import { AllFlowsPrecondition } from '@sapphire/framework';
import type { CommandInteraction, ContextMenuCommandInteraction, Message } from 'discord.js';

export class UserPrecondition extends AllFlowsPrecondition {
	#message = 'This command is a premium only command.'; // TODO: Adjust Premium Message

	public override async chatInputRun(interaction: CommandInteraction) {
		return this.premiumCheck(interaction.guildId!);
	}

	public override async contextMenuRun(interaction: ContextMenuCommandInteraction) {
		return this.premiumCheck(interaction.guildId!);
	}

	public override async messageRun(message: Message) {
		return this.premiumCheck(message.guildId!);
	}

	private async premiumCheck(guild_id: string) {
		const is_premium: boolean = (await this.container.utilities.guild.get.GuildById(guild_id))?.premium ?? false;
		return is_premium ? this.ok() : this.error({ message: this.#message });
	}
}
