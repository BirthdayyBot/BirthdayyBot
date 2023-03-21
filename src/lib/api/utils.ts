import { createFunctionPrecondition } from '@sapphire/decorators';
import type { ApiResponse } from '@sapphire/plugin-api';
import { API_SECRET } from '../../helpers/provide/environment';
import type { ApiRequest } from './types';

/**
 * It returns a function that takes a request and returns a response
 * @param token - The token to check against. Defaults to the API_SECRET environment variable.
 * @returns A function that takes a request and a response and returns a boolean.
 */
export function authenticated(token = API_SECRET) {
	return createFunctionPrecondition(
		(req: ApiRequest) => req.headers.authorization === token,
		(_req: ApiRequest, res: ApiResponse) => res.unauthorized(),
	);
}

type ValidQueryParams<T = string | string[]> = Array<keyof T> | undefined;

/**
 * `validateParams` is a function that takes a list of required query parameters and returns a function
 * that takes an API request and returns a boolean indicating whether or not the request has all of the
 * required parameters
 * @param requiredParams - An optional list of parameters that are required. If not provided, all
 * parameters are required.
 * @returns A function that takes a request and a response and returns a boolean.
 */
export function validateParams<QueryParams extends Record<string, string | string[]>>(requiredParams?: ValidQueryParams<QueryParams>) {
	const paramsToValidate = requiredParams ?? Object.keys({} as QueryParams);
	const missingParams: string[] = [];
	const invalidParams: Array<{ key: string; receivedType: unknown; expectedType: unknown }> = [];

	return createFunctionPrecondition(
		(req: ApiRequest<QueryParams>) => {
			for (const param of paramsToValidate) {
				/* It's checking if the parameter is in the query. */
				if (!(param in req.query)) {
					missingParams.push(param as string);
					/* It's checking if the type of the parameter is the same as the type of the query parameter. */
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
