import { BirthdayyCommand } from '#lib/structures';
import { Events, PermissionLevels } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import { ApplicationCommandRegistry } from '@sapphire/framework';
import { applyDescriptionLocalizedBuilder, fetchT } from '@sapphire/plugin-i18next';
import { envParseBoolean, envParseString } from '@skyra/env-utilities';

@ApplyOptions<BirthdayyCommand.Options>({ permissionLevel: PermissionLevels.BotOwner })
export class UserCommand extends BirthdayyCommand {
	public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
		registry.registerChatInputCommand(
			(builder) =>
				applyDescriptionLocalizedBuilder(builder, 'commands/system:rebootDescription').setName('reboot'),
			{ guildIds: [envParseString('CLIENT_MAIN_GUILD')] }
		);
	}

	public override async chatInputRun(interaction: BirthdayyCommand.Interaction) {
		const t = await fetchT(interaction);
		const content = t('commands/system:reboot');
		await interaction.reply({ content, ephemeral: true });

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
