import { authenticated } from '#lib/api/utils';
import { remindMeButtonBuilder } from '#lib/components/button';
import { getUserInfo, getGuildMember, sendDMMessage, sendMessage } from '#lib/discord';
import { type VoteProvider, BirthdayyBotId, GuildIDEnum } from '#lib/types';
import { generateDefaultEmbed } from '#utils/embed';
import { VOTE_ROLE_ID, Emojis, VOTE_CHANNEL_ID, BOT_NAME } from '#utils/environment';
import { resolveOnErrorCodesDiscord } from '#utils/functions';
import type { RoleRemovePayload } from '#root/tasks/BirthdayRoleRemoverTask';
import { Time } from '@sapphire/cron';
import { ApplyOptions } from '@sapphire/decorators';
import { container } from '@sapphire/framework';
import { Route, methods, ApiRequest, ApiResponse } from '@sapphire/plugin-api';
import { envIsDefined, envParseString } from '@skyra/env-utilities';
import { RESTJSONErrorCodes, ActionRowBuilder, ButtonBuilder, User } from 'discord.js';

export interface APIWebhookTopGG {
	user: string;
	type: 'test' | 'upvote';
	query: string;
	bot: string;
}

@ApplyOptions<Route.Options>({ route: 'webhook/topgg', enabled: envIsDefined('TOPGG_WEBHOOK_SECRET') })
export class UserRoute extends Route {
	@authenticated(envParseString('TOPGG_WEBHOOK_SECRET'))
	public async [methods.POST](request: ApiRequest, response: ApiResponse) {
		container.logger.debug(request.body);

		const { type, user } = request.body as APIWebhookTopGG;
		switch (type) {
			case 'test':
				container.logger.info('topgg webhook test');
				break;
			case 'upvote':
				await this.voteProcess('topgg', user);
				break;
			default:
				return response.badRequest({ error: 'Bad Request' });
		}
		return response.end();
	}

	private async voteProcess(provider: VoteProvider, userId: string) {
		const providerInfo = this.getProviderInfo(provider);

		const guild = await resolveOnErrorCodesDiscord(
			container.client.guilds.fetch(BirthdayyBotId.Birthdayy),
			RESTJSONErrorCodes.UnknownGuild,
		);
		if (!guild) return;

		const user = await getUserInfo(userId);
		if (!user) return;

		const member = await getGuildMember(guild?.id, userId);
		if (!member) return;

		const role = guild.roles.cache.get(VOTE_ROLE_ID);
		if (!role) return;

		// 1. Send DM
		await this.sendVoteDM(providerInfo, userId);
		// 2. Message To Server
		await this.sendVoteAnnouncement(providerInfo, user);
		// 3. Update role

		const addRole = await member.roles.add(VOTE_ROLE_ID).catch(() => null);
		if (!addRole) return;

		// 4. Schedule role removal
		await this.scheduleRoleRemoval({ memberId: userId, guildId: guild.id, roleId: role.id });
	}

	private async sendVoteDM(providerInfo: { name: string; url: string }, user_id: string) {
		const dmEmbed = {
			title: `${Emojis.Success} You voted for Birthdayy on ${providerInfo.name}`,
			description: `Thank you so much for supporting me, you're the best ${Emojis.Heart}`,
		};
		const dmEmbedObj = generateDefaultEmbed(dmEmbed);

		const button = await remindMeButtonBuilder(await container.client.guilds.fetch(GuildIDEnum.Birthdayy));
		const components = new ActionRowBuilder<ButtonBuilder>().setComponents(button).toJSON();

		return sendDMMessage(user_id, { embeds: [dmEmbedObj], components: [components] });
	}

	private sendVoteAnnouncement(providerInfo: { name: string; url: string }, user: User) {
		const { username, discriminator } = user;

		return sendMessage(VOTE_CHANNEL_ID, {
			embeds: [
				generateDefaultEmbed({
					title: `${Emojis.Exclamation} New Vote on ${providerInfo.name}`,
					description: `\`${username}#${discriminator}\` has **voted** for ${
						container.client.user?.username ?? BOT_NAME
					}!
				  Use \`/vote\` or vote [here](${providerInfo.url}) directly.`,
					thumbnail: { url: user.avatarURL({ extension: 'png' }) ?? user.defaultAvatarURL },
				}),
			],
		});
	}

	private async scheduleRoleRemoval(options: RoleRemovePayload) {
		await container.tasks.create('BirthdayRoleRemoverTask', options, { repeated: false, delay: Time.Hour * 12 });
	}

	private getProviderInfo(provider: VoteProvider) {
		switch (provider) {
			case 'topgg':
				return {
					name: 'TopGG',
					url: 'https://birthdayy.xyz/topgg/vote',
				};

			case 'discordbotlist':
				return {
					name: 'Discord Bot List',
					url: 'https://birthdayy.xyz/discord-botlist/vote',
				};

			case 'discordlist':
				return {
					name: 'Discord List',
					url: 'https://birthdayy.xyz/discordlist/vote',
				};
		}
	}
}
