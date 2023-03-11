import { ApplyOptions } from '@sapphire/decorators';
import { ApiRequest, ApiResponse, methods, Route } from '@sapphire/plugin-api';

@ApplyOptions<Route.Options>({ route: '' })
export class UserRoute extends Route {
    // TODO: #25 Create validation for the request when exposing the route publicly
    public [methods.GET](_request: ApiRequest, response: ApiResponse): void {
        response.json({ message: 'Landing Page!' });
    }

    public [methods.POST](_request: ApiRequest, response: ApiResponse) {
        response.json({ message: 'Landing Page!' });
    }
}
