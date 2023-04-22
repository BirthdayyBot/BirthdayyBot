import { ApplyOptions } from '@sapphire/decorators';
import { container } from '@sapphire/pieces';
import { ApiRequest, ApiResponse, methods, Route } from '@sapphire/plugin-api';
import { authenticated } from '../../lib/api/utils';
import type { APIWebhookTopGG } from '../../lib/model/APIWebhookTopGG.model';
import voteProcess from '../../lib/process/vote';
import { envIsDefined, envParseBoolean, envParseString } from '@skyra/env-utilities';

@ApplyOptions<Route.Options>({ route: 'webhook/topgg', enabled: envIsDefined('WEBHOOK_SECRET') })
export class UserRoute extends Route {
	@authenticated(envParseString('WEBHOOK_SECRET'))
	public async [methods.POST](request: ApiRequest, response: ApiResponse) {
		envParseBoolean('DEBUG') ? container.logger.info(request.body) : null;

		const { type, user } = request.body as APIWebhookTopGG;
		switch (type) {
			case 'test':
				container.logger.info('topgg webhook test');
				break;
			case 'upvote':
				await voteProcess('topgg', user);
				break;
			default:
				return response.badRequest({ error: 'Bad Request' });
		}
		return response.ok({ message: 'TOPGG VERIFIED' });
	}
}
