import { ApplyOptions } from '@sapphire/decorators';
import { ApiRequest, ApiResponse, methods, Route } from '@sapphire/plugin-api';
import { authenticated } from '../lib/api/utils';

@ApplyOptions<Route.Options>({ name: 'authenticated', route: 'authenticated' })
export class UserRoute extends Route {
	@authenticated()
	public [methods.GET](_request: ApiRequest, response: ApiResponse): void {
		response.json({ message: 'You are authenticated :)' });
	}
}
