import { ApplyOptions } from '@sapphire/decorators';
import { Listener } from '@sapphire/framework';
import { MiddlewareErrorContext, ServerEvents } from '@sapphire/plugin-api';
import { handleRouteApiError } from '../../lib/utils/errorHandling';

@ApplyOptions<Listener.Options>({ emitter: 'server', event: ServerEvents.Error })
export class ServerErrorEvent extends Listener {
	public run(error: Error, { response, request }: MiddlewareErrorContext) {
		return handleRouteApiError({
			error,
			request,
			response,
			loggerSeverityLevel: 'error',
			sentrySeverityLevel: 'error',
		});
	}
}
