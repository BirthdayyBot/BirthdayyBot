import { methods, Route, type ApiRequest, type ApiResponse } from '@sapphire/plugin-api';

export class UserRoute extends Route {
	public constructor(context: Route.Context, options: Route.Options) {
		super(context, {
			...options,
			route: 'test'
		});
	}

	public [methods.GET](_request: ApiRequest, response: ApiResponse) {
		response.json({ message: 'Hello World' });
	}

	public [methods.POST](_request: ApiRequest, response: ApiResponse) {
		response.json({ message: 'Hello World' });
	}
}
