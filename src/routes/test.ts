import { ApplyOptions } from '@sapphire/decorators';
import { ApiRequest, ApiResponse, methods, Route } from '@sapphire/plugin-api';
import { authenticated } from '../lib/api/utils';
import { container } from '@sapphire/framework';

@ApplyOptions<Route.Options>({ name: 'test', route: 'test' })
export class UserRoute extends Route {
	@authenticated()
	public [methods.GET](_request: ApiRequest, response: ApiResponse): void {
		container.logger.info('[GET] You are authenticated :)');
		response.json({ message: '[GET] You are authenticated :)' });
	}

	@authenticated()
	public [methods.POST](request: ApiRequest, response: ApiResponse): void {
		response.json({ message: '[POST] You are authenticated :)', body: request.body });
		container.logger.info(`[POST BODY] ${JSON.stringify(request.body, null, 2)}`);
	}
}
