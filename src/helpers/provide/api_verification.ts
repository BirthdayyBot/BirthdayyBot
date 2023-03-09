import type { ApiRequest } from '@sapphire/plugin-api';
import { API_SECRET } from './environment';

export async function ApiVerification(request: ApiRequest): Promise<boolean> {
    const { authorization } = request.headers;
    if (!authorization || authorization !== API_SECRET) {
        return false;
    }

    return true;
}
