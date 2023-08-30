import thinking from '#lib/discord/thinking';
import { reply } from '#utils';
import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';
import { timezoneConfigSubCommand } from './config.js';

@RegisterSubCommand('config', (builder) => timezoneConfigSubCommand(builder))
export class TimezoneCommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputInteraction<'cached'>) {
		await thinking(interaction);

		const timezone = interaction.options.getInteger('timezone', true);

		await this.container.prisma.guild.upsert({
			create: { guildId: interaction.guildId, timezone },
			where: { guildId: interaction.guildId },
			update: { timezone },
		});

		return reply(interaction, `The **Timezone** has been set to UTC${timezone >= 0 ? `+${timezone}` : timezone}.`);
	}
}
