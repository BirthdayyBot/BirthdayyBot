import { sendMessage } from '#lib/discord/message';
import { ApplyOptions } from '@sapphire/decorators';
import { Route, methods, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';

@ApplyOptions<Route.Options>({ name: 'hello', route: 'hello' })
export class UserRoute extends Route {
	public [methods.GET](_request: ApiRequest, response: ApiResponse) {
		response.json({ message: 'Hello World' });
	}

	public async [methods.POST](_request: ApiRequest, response: ApiResponse) {
		try {
			await sendMessage('1063771496436207658', 'Hello World');
			response.json({ message: 'Sent Discord Message' });
		} catch (error) {
			response.statusCode = 500;
			response.json({ message: 'Failed to send Discord Message' });
		}
	}
}
