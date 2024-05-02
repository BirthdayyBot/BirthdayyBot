import { CustomCommand } from '#lib/structures/commands/CustomCommand';
import { Events, PermissionLevels } from '#lib/types/Enums';
import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { applyDescriptionLocalizedBuilder, fetchT } from '@sapphire/plugin-i18next';
import { envParseBoolean, envParseString } from '@skyra/env-utilities';

@ApplyOptions<CustomCommand.Options>({
	description: 'commands/system:rebootDescription',
	permissionLevel: PermissionLevels.BotOwner
})
export class UserCommand extends CustomCommand {
	public override registerApplicationCommands(registry: CustomCommand.Registry) {
		registry.registerChatInputCommand(
			(builder) => applyDescriptionLocalizedBuilder(builder, this.description).setName('reboot'),
			{ guildIds: [envParseString('CLIENT_MAIN_GUILD')] }
		);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
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
