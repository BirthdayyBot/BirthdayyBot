import { ApplyOptions } from '@sapphire/decorators';
import { container, Events, Listener, type ChatInputCommandErrorPayload } from '@sapphire/framework';
import { isBaseError } from '../../../lib/errors/index';

/**
 * Handle errors from chat input commands
 */
@ApplyOptions<Listener.Options>({ event: Events.ChatInputCommandError })
export class CommandErrorListener extends Listener<typeof Events.ChatInputCommandError> {
	public async run(error: Error, payload: ChatInputCommandErrorPayload) {
		const { interaction } = payload;

		const normalizedError = container.errorLogger.handle(error, {
			interaction,
			logSeverity: 'error',
		});

		await container.errorLogger.sendErrorToUser(interaction, normalizedError);

		if (isBaseError(normalizedError)) {
			await container.errorLogger.notifyAdmin(normalizedError, {
				commandName: interaction.commandName,
				userId: interaction.user.id,
				guildId: interaction.guildId ?? undefined,
			});
		}
	}
}
