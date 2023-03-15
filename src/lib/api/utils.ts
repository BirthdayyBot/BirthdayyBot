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

type ValidQueryParams<T = string | string[]> = Array<keyof T> | undefined;

export function validateParams<QueryParams extends Record<string, string | string[]>>(requiredParams?: ValidQueryParams<QueryParams>) {
	const paramsToValidate = requiredParams ?? Object.keys({} as QueryParams);
	const missingParams: string[] = [];
	const invalidParams: Array<{ key: string; receivedType: unknown; expectedType: unknown }> = [];

	return createFunctionPrecondition(
		(req: ApiRequest<QueryParams>) => {
			for (const param of paramsToValidate) {
				if (!(param in req.query)) {
					missingParams.push(param as string);
				} else if (typeof req.query[param as string] !== (typeof {} as QueryParams[typeof param])) {
					invalidParams.push({
						key: param as string,
						receivedType: typeof req.query[param],
						expectedType: typeof {} as QueryParams[typeof param],
					});
				}
			}
			return missingParams.length === 0 && invalidParams.length === 0;
		},
		(_req: ApiRequest<QueryParams>, res: ApiResponse) =>
			res.badRequest({
				missing: missingParams.length > 0 ? `Missing Parameter(s) - ${missingParams.join(', ')}` : undefined,
				invalid: invalidParams.length > 0 ? `Invalid Parameter(s) - ${invalidParams.join(', ')}` : undefined,
			}),
	);
}
