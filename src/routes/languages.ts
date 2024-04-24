import { ratelimit } from '#lib/api/utils';
import { seconds } from '#utils/common';
import { ApplyOptions } from '@sapphire/decorators';
import { ApiRequest, ApiResponse, Route, RouteOptions, methods } from '@sapphire/plugin-api';

@ApplyOptions<RouteOptions>({ route: 'languages' })
export class UserRoute extends Route {
	@ratelimit(seconds(2), 2)
	public [methods.GET](_: ApiRequest, response: ApiResponse) {
		return response.json([...this.container.i18n.languages.keys()]);
	}
}
