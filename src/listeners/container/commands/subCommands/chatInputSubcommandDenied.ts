import { ApplyOptions } from '@sapphire/decorators';
import { container, Listener } from '@sapphire/framework';
import { SubcommandPluginEvents, type ChatInputSubcommandErrorPayload } from '@sapphire/plugin-subcommands';
import { isBaseError } from '../../../../lib/errors/index';

@ApplyOptions<Listener.Options>({ event: SubcommandPluginEvents.ChatInputSubcommandError })
export class ChatInputSubcommandErrorListener extends Listener<typeof SubcommandPluginEvents.ChatInputSubcommandError> {
	public async run(error: Error, payload: ChatInputSubcommandErrorPayload) {
		const { interaction } = payload;

		// Log and handle the error
		const normalizedError = container.errorLogger.handle(error, {
			interaction,
			logSeverity: 'error',
		});

		// Send response to user
		await container.errorLogger.sendErrorToUser(interaction, normalizedError);

		// Notify admin
		if (isBaseError(normalizedError)) {
			await container.errorLogger.notifyAdmin(normalizedError, {
				commandName: interaction.commandName,
				userId: interaction.user.id,
				guildId: interaction.guildId ?? undefined,
			});
		}
	}
}
