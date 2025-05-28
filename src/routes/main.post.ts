import { ApiRequest, ApiResponse, Route } from '@sapphire/plugin-api';
import { authenticated } from '#lib/api/utils';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<Route.Options>({
	name: 'mainPost',
	route: ''
})
export class UserRoute extends Route {
	@authenticated()
	public run(_request: ApiRequest, response: ApiResponse) {
		response.json({ message: 'Hello World' });
	}
}
