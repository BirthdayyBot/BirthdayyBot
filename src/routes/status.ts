import { ApplyOptions } from '@sapphire/decorators';
import { ApiRequest, ApiResponse, methods, Route } from '@sapphire/plugin-api';

@ApplyOptions<Route.Options>({ route: 'status' })
export class UserRoute extends Route {
    public [methods.GET](_request: ApiRequest, response: ApiResponse) {
        response.statusCode = 200;
        response.json({ message: 'Status Test' });
    }

    public [methods.POST](_request: ApiRequest, response: ApiResponse) {
        response.json({ message: 'Status Test' });
    }
}
