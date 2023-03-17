import { methods, Route, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';
import { sendText } from '../lib/discord';
export class UserRoute extends Route {
	public constructor(context: Route.Context, options: Route.Options) {
		super(context, {
			...options,
			route: 'test',
		});
	}

	public async [methods.GET](_request: ApiRequest, response: ApiResponse) {
		try {
			sendText('1063771496436207658', 'Hello World');
			response.json({ message: 'Sent Discord Message' });
		} catch (error) {
			response.statusCode = 500;
			response.json({ message: 'Failed to send Discord Message' });
		}
	}

	public [methods.POST](_request: ApiRequest, response: ApiResponse) {
		response.json({ message: 'Hello World' });
	}
}
