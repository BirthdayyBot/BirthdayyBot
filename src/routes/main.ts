import { ApplyOptions } from '@sapphire/decorators';
import { ApiRequest, ApiResponse, methods, Route } from '@sapphire/plugin-api';
import { APP_ENV } from '../helpers/provide/environment';

@ApplyOptions<Route.Options>({ route: '' })
export class UserRoute extends Route {
	public [methods.GET](_request: ApiRequest, response: ApiResponse): void {
		response.json({ message: `BirthdayyAPI [${APP_ENV}]` });
	}

	public [methods.POST](_request: ApiRequest, response: ApiResponse) {
		response.json({ message: `BirthdayyAPI [${APP_ENV}]` });
	}
}
