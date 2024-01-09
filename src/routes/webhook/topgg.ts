import { authenticated } from '#lib/api/utils';
import { remindMeButtonBuilder } from '#lib/components/button';
import { sendDMMessage, sendMessage } from '#lib/discord/message';
import { addRoleToUser } from '#lib/discord/role';
import type { RoleRemovePayload } from '#root/scheduled-tasks/BirthdayRoleRemoverTask';
import { Emojis } from '#utils/constants';
import { generateDefaultEmbed } from '#utils/embed';
import { CLIENT_NAME, VOTE_CHANNEL_ID } from '#utils/environment';
import { ApplyOptions } from '@sapphire/decorators';
import { Time } from '@sapphire/duration';
import { container } from '@sapphire/framework';
import { ApiRequest, ApiResponse, Route, methods } from '@sapphire/plugin-api';
import { s } from '@sapphire/shapeshift';
import { envIsDefined, envParseString } from '@skyra/env-utilities';
import { ActionRowBuilder, ButtonBuilder, Guild, User } from 'discord.js';

@ApplyOptions<Route.Options>({ route: 'webhook/topgg', enabled: envIsDefined('TOPGG_WEBHOOK_SECRET') })
export class UserRoute extends Route {
	@authenticated(envParseString('TOPGG_WEBHOOK_SECRET'))
	public async [methods.POST](request: ApiRequest, response: ApiResponse) {
		const data = s.object({
			user: s.string,
			type: s.enum('test', 'upvote'),
			query: s.string,
			bot: s.string,
		});

		const body = data.parse(request.body);

		if (!body || body.type !== 'upvote') {
			return response.end();
		}

		try {
			const user = await container.client.users.fetch(body.user).catch(() => null);
			const guild = await container.client.guilds.fetch(process.env.CLIENT_ID).catch(() => null);

			if (!user || !guild) return response.end();

			const defaultRoleID = '1039089174948626473';

			const payload = {
				memberId: user.id,
				guildId: guild.id,
				roleId: defaultRoleID,
			};

			await this.addRoleAndCreateTask(payload);
			await this.sendThankYouDM(user, guild);
			await this.sendVoteNotification(user);

			return response.ok();
		} catch (error) {
			return response.end();
		}
	}

	private async addRoleAndCreateTask(payload: RoleRemovePayload) {
		await addRoleToUser(payload.memberId, payload.roleId, payload.guildId);
		await container.tasks.create('BirthdayRoleRemoverTask', payload, {
			repeated: false,
			delay: Time.Hour * 12,
		});
	}

	private async sendThankYouDM(user: User, guild: Guild) {
		const embed = generateDefaultEmbed({
			title: `${Emojis.Success} You voted for Birthdayy on TopGG!`,
			description: `Thank you so much for supporting me, you're the best ${Emojis.Heart}`,
		});

		const components = [new ActionRowBuilder<ButtonBuilder>().setComponents(await remindMeButtonBuilder(guild))];

		await sendDMMessage(user.id, { embeds: [embed], components });
	}

	private async sendVoteNotification(user: User) {
		const embed = generateDefaultEmbed({
			title: `${Emojis.Exclamation} New Vote on TopGG!`,
			description: `\`${user.username}#${user.discriminator}\` has **voted** for ${CLIENT_NAME}! Use \`/vote\` or vote [here](https://top.gg/bot/${container.client.id}/vote) directly.`,
			thumbnail: { url: user.avatarURL({ extension: 'png' }) ?? user.defaultAvatarURL },
		});

		await sendMessage(VOTE_CHANNEL_ID, { embeds: [embed] });
	}
}
