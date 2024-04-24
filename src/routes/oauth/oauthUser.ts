import { authenticated, ratelimit } from '#lib/api/utils';
import { minutes } from '#utils/common';
import { ApplyOptions } from '@sapphire/decorators';
import { Time } from '@sapphire/duration';
import { FetchResultTypes, fetch } from '@sapphire/fetch';
import { ApiRequest, ApiResponse, HttpCodes, MimeTypes, Route, type RouteOptions, methods } from '@sapphire/plugin-api';
import { OAuth2Routes, type RESTPostOAuth2AccessTokenResult } from 'discord-api-types/v9';
import { stringify } from 'node:querystring';

@ApplyOptions<RouteOptions>({ route: 'oauth/user' })
export class UserRoute extends Route {
	@authenticated()
	@ratelimit(minutes(5), 2, true)
	public async [methods.POST](request: ApiRequest, response: ApiResponse) {
		const requestBody = request.body as Record<string, string>;
		if (typeof requestBody.action !== 'string') {
			return response.badRequest();
		}

		if (requestBody.action === 'SYNC_USER') {
			if (!request.auth) return response.error(HttpCodes.Unauthorized);

			const auth = this.container.server.auth!;

			// If the token expires in a day, refresh
			let authToken = request.auth.token;
			if (Date.now() + Time.Day >= request.auth.expires) {
				const body = await this.refreshToken(request.auth.id, request.auth.refresh);
				if (body !== null) {
					const authentication = auth.encrypt({
						expires: Date.now() + body.expires_in * 1000,
						id: request.auth.id,
						refresh: body.refresh_token,
						token: body.access_token
					});

					response.cookies.add(auth.cookie, authentication, { maxAge: body.expires_in });
					authToken = body.access_token;
				}
			}

			try {
				return response.json(await auth.fetchData(authToken));
			} catch (error) {
				this.container.logger.fatal(error);
				return response.error(HttpCodes.InternalServerError);
			}
		}

		return response.error(HttpCodes.BadRequest);
	}

	private async refreshToken(id: string, refreshToken: string) {
		const { logger, server } = this.container;
		try {
			logger.debug(`Refreshing Token for ${id}`);
			return await fetch<RESTPostOAuth2AccessTokenResult>(
				OAuth2Routes.tokenURL,
				{
					body: stringify({
						client_id: server.auth!.id,
						client_secret: server.auth!.secret,
						grant_type: 'refresh_token',
						redirect_uri: server.auth!.redirect,
						refresh_token: refreshToken,
						scope: server.auth!.scopes
					}),
					headers: {
						'Content-Type': MimeTypes.ApplicationFormUrlEncoded
					},
					method: 'POST'
				},
				FetchResultTypes.JSON
			);
		} catch (error) {
			logger.fatal(error);
			return null;
		}
	}
}
