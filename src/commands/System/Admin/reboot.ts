import { BirthdayyCommand } from '#lib/structures';
import { Events, PermissionLevels } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry } from '@sapphire/framework';
import { envParseBoolean, envParseString } from '@skyra/env-utilities';

@ApplyOptions<BirthdayyCommand.Options>({ permissionLevel: PermissionLevels.BotOwner })
export class UserCommand extends BirthdayyCommand {
	public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
		registry.registerChatInputCommand(
			(builder) => builder.setName(this.name).setDescription('Reboots the bot.').setDMPermission(false),
			{ guildIds: [envParseString('CLIENT_MAIN_GUILD')] }
		);
	}

	public override async chatInputRun(interaction: BirthdayyCommand.Interaction) {
		await interaction.reply('🌀 Rebooting...');

		if (envParseBoolean('INFLUX_ENABLED')) {
			const { client } = this.container;
			try {
				client.emit(
					Events.AnalyticsSync,
					client.guilds.cache.size,
					client.guilds.cache.reduce((acc, val) => acc + val.memberCount, 0)
				);

				await client.analytics!.writeApi.flush();
				await client.analytics!.writeApi.close();
			} catch {
				// noop
			}
		}

		process.exit(0);
	}
}
