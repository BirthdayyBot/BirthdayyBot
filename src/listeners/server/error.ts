import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { ServerEvents, type MiddlewareErrorContext } from '@sapphire/plugin-api';

@ApplyOptions<Listener.Options>({ emitter: 'server', event: ServerEvents.Error })
export class ServerErrorEvent extends Listener {
	public run(error: Error, { response }: MiddlewareErrorContext) {
		this.container.errorLogger.handle(error, { logSeverity: 'error' });

		return response.status(500).json({
			message: 'An unexpected error occurred while processing your request.',
		});
	}
}
