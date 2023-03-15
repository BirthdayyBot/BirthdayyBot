import { createFunctionPrecondition } from '@sapphire/decorators';
import type { ApiResponse } from '@sapphire/plugin-api';
import { API_SECRET } from '../../helpers/provide/environment';
import type { ApiRequest } from './types';

export function authenticated(token = API_SECRET) {
    return createFunctionPrecondition(
        (req: ApiRequest) => req.headers.authorization === token,
        (_req: ApiRequest, res: ApiResponse) => res.unauthorized(),
    );
}
