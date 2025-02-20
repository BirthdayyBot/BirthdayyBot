import { ratelimit } from '#lib/api/utils';
import { seconds } from '#utils/common';
import type { Command } from '@sapphire/framework';
import { Route } from '@sapphire/plugin-api';
import type { TFunction } from '@sapphire/plugin-i18next';
import { PermissionFlagsBits } from 'discord-api-types/v10';
import { PermissionsBitField } from 'discord.js';

export class CommandsRoute extends Route {
	@ratelimit(seconds(2), 2)
	public run(request: Route.Request, response: Route.Response) {
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

		return response.ok(commands.map(CommandsRoute.process.bind(null, language)));
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
