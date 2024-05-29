import { authenticated } from '#lib/api/utils';
import { getT } from '#lib/i18n/translate';
import type { RemoveBirthdayRoleData } from '#root/scheduled-tasks/RemoveBirthdayRole';
import { Emojis, GuildIDEnum } from '#utils/constants';
import { generateDefaultEmbed } from '#utils/embed';
import { CLIENT_NAME, VOTE_CHANNEL_ID } from '#utils/environment';
import { getActionRow, getRemindMeComponent } from '#utils/functions';
import { ApplyOptions } from '@sapphire/decorators';
import { isTextBasedChannel } from '@sapphire/discord.js-utilities';
import { Time } from '@sapphire/duration';
import { container } from '@sapphire/framework';
import { ApiRequest, ApiResponse, Route, methods } from '@sapphire/plugin-api';
import { cast } from '@sapphire/utilities';
import { envIsDefined, envParseString } from '@skyra/env-utilities';
import { Guild, GuildMember, User } from 'discord.js';

interface TopGGWebhookData {
	type: 'upvote';
	user: string;
	query: string;
	bot: string;
}

@ApplyOptions<Route.Options>({ route: 'webhook/topgg', enabled: envIsDefined('TOPGG_WEBHOOK_SECRET') })
export class UserRoute extends Route {
	private readonly roleID = '1039089174948626473';

	@authenticated(envParseString('TOPGG_WEBHOOK_SECRET'))
	public async [methods.POST](request: ApiRequest, response: ApiResponse) {
		const body = cast<TopGGWebhookData>(request.body);

		if (!body || body.type !== 'upvote') {
			return response.end();
		}

		try {
			const guild = container.client.guilds.cache.get(GuildIDEnum.Birthdayy);

			if (!guild) return response.end();

			const member = await guild.members.fetch(body.user).catch(() => null);

			if (!member) return response.end();

			await this.addRoleAndCreateTask(member);
			await this.sendThankYouDM(member.user, guild);
			await this.sendVoteNotification(member.user);

			return response.ok();
		} catch (error) {
			return response.end();
		}
	}

	private async addRoleAndCreateTask(member: GuildMember) {
		const result = await member.roles.add(this.roleID).catch(() => null);

		if (!result) return;

		const payload = {
			userID: member.id,
			guildID: member.guild.id,
			roleID: this.roleID
		} satisfies RemoveBirthdayRoleData;

		return container.tasks.create('removeBirthdayRole', payload, {
			repeated: false,
			delay: Time.Hour * 12
		});
	}

	private async sendThankYouDM(user: User, guild: Guild) {
		const embed = generateDefaultEmbed({
			title: `${Emojis.Success} You voted for Birthdayy on TopGG!`,
			description: `Thank you so much for supporting me, you're the best ${Emojis.Heart}`
		});

		const components = [getActionRow(getRemindMeComponent(getT(guild.preferredLocale)))];
		const channel = user.dmChannel ?? (await user.createDM());

		return channel.send({ embeds: [embed], components });
	}

	private async sendVoteNotification(user: User) {
		const embed = generateDefaultEmbed({
			title: `${Emojis.Exclamation} New Vote on TopGG!`,
			description: `\`${user.username}#${user.discriminator}\` has **voted** for ${CLIENT_NAME}! Use \`/vote\` or vote [here](https://top.gg/bot/${container.client.id}/vote) directly.`,
			thumbnail: { url: user.avatarURL({ extension: 'png' }) ?? user.defaultAvatarURL }
		});

		const channel = container.client.channels.cache.get(VOTE_CHANNEL_ID);

		if (!isTextBasedChannel(channel)) return;

		return channel.send({ embeds: [embed] });
	}
}
