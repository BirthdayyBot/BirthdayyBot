import { ApplyOptions } from '@sapphire/decorators';
import { ApiRequest, ApiResponse, Route, type RouteOptions } from '@sapphire/plugin-api';

@ApplyOptions<RouteOptions>({ name: 'mainGet', route: '' })
export class UserRoute extends Route {
	public run(_request: ApiRequest, response: ApiResponse) {
		response.json({ message: 'Hello World' });
	}
}
