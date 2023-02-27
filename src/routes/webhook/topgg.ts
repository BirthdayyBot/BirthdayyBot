import { ApplyOptions } from '@sapphire/decorators';
import { ApiRequest, ApiResponse, methods, Route } from '@sapphire/plugin-api';
import type { APIWebhookTopGG } from '../../lib/model/APIWebhookTopGG.model';
import voteProcess from '../../lib/process/vote';

@ApplyOptions<Route.Options>({ route: `webhook/topgg` })
export class UserRoute extends Route {
	public async [methods.POST](request: ApiRequest, response: ApiResponse) {
		const { authorization } = request.headers;
		if (!authorization || authorization !== process.env.WEBHOOK_SECRET) {
			return response.status(401).json({ error: 'Unauthorized' });
		}
		console.log(request.body);

		const type = (request.body as APIWebhookTopGG).type;
		const user_id = (request.body as APIWebhookTopGG).user;
		switch (type) {
			case 'test':
				console.log('topgg webhook test');
				break;
			case 'upvote':
				await voteProcess('topgg', user_id);
				break;
			default:
				return response.status(400).json({ error: 'Bad Request' });
		}
		return response.status(200).json({ message: 'TOPGG VERIFIED' });
	}
}
