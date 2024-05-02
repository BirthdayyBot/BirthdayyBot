import { ratelimit } from '#lib/api/utils';
import { seconds } from '#utils/common';
import { ApplyOptions } from '@sapphire/decorators';
import type { Command } from '@sapphire/framework';
import { ApiRequest, ApiResponse, methods, Route, type RouteOptions } from '@sapphire/plugin-api';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { PermissionsBitField } from 'discord.js';
import type { TFunction } from 'i18next';

@ApplyOptions<RouteOptions>({ route: 'commands' })
export class UserRoute extends Route {
	@ratelimit(seconds(2), 2)
	public [methods.GET](request: ApiRequest, response: ApiResponse) {
		const { lang, category } = request.query;
		const { i18n, stores } = this.container;
		const language = i18n.getT((lang as string) ?? 'en-US');
		const commands = (
			category ? stores.get('commands').filter((cmd) => cmd.category === category) : stores.get('commands')
		).filter((cmd) => {
			const permissions = new PermissionsBitField(cmd.options.requiredUserPermissions);
			return (
				permissions.missing(PermissionFlagsBits.Administrator) ||
				permissions.missing(PermissionFlagsBits.ManageGuild)
			);
		});

		return response.json(commands.map(UserRoute.process.bind(null, language)));
	}

	private static process(t: TFunction, cmd: Command) {
		const command = cmd;
		return {
			category: command.category,
			description: t(command.description),
			name: command.name,
			preconditions: command.preconditions
		};
	}
}
