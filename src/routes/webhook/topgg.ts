import { ApplyOptions } from '@sapphire/decorators';
import { container } from '@sapphire/pieces';
import { ApiRequest, ApiResponse, methods, Route } from '@sapphire/plugin-api';
import { DEBUG, WEBHOOK_SECRET } from '../../helpers/provide/environment';
import { authenticated } from '../../lib/api/utils';
import type { APIWebhookTopGG } from '../../lib/model/APIWebhookTopGG.model';
import voteProcess from '../../lib/process/vote';

@ApplyOptions<Route.Options>({ route: 'webhook/topgg' })
export class UserRoute extends Route {
	@authenticated(WEBHOOK_SECRET)
	public async [methods.POST](request: ApiRequest, response: ApiResponse) {
		DEBUG ? container.logger.info(request.body) : null;

		const { type } = request.body as APIWebhookTopGG;
		const user_id = (request.body as APIWebhookTopGG).user;
		switch (type) {
			case 'test':
				container.logger.info('topgg webhook test');
				break;
			case 'upvote':
				await voteProcess('topgg', user_id);
				break;
			default:
				return response.badRequest({ error: 'Bad Request' });
		}
		return response.ok({ message: 'TOPGG VERIFIED' });
	}
}
