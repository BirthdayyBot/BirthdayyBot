import type { ApiRequest } from '@sapphire/plugin-api';

export async function ApiVerification(request: ApiRequest): Promise<boolean> {
	const { authorization } = request.headers;
	if (!authorization || authorization !== process.env.API_SECRET) {
		return false;
	}

	return true;
}
