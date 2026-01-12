import { Time } from '@sapphire/cron';
import { ApplyOptions } from '@sapphire/decorators';
import { container } from '@sapphire/pieces';
import { ApiRequest, ApiResponse, methods, Route } from '@sapphire/plugin-api';
import { envIsDefined, envParseString } from '@skyra/env-utilities';
import type { User } from 'discord.js';
import { DiscordAPIError, RESTJSONErrorCodes } from 'discord.js';
import { BOT_NAME, EXCLAMATION, HEART, SUCCESS, VOTE_CHANNEL_ID, VOTE_ROLE_ID } from '../../helpers';
import { authenticated } from '../../lib/api/utils';
import { remindMeButton } from '../../lib/components/button';
import { getUserInfo, sendDMMessage, sendMessage } from '../../lib/discord';
import { GuildIDEnum } from '../../lib/enum/GuildID.enum';
import type { APIWebhookTopGG } from '../../lib/model/APIWebhookTopGG.model';
import type { VoteProvider } from '../../lib/types/VoteProvider.type';
import { generateDefaultEmbed } from '../../lib/utils/embed';
import { fromDiscordAPIError } from '../../lib/utils/ErrorLogger';
import type { RoleRemovePayload } from '../../tasks/BirthdayRoleRemoverTask';

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

		let guild;
		try {
			guild = await container.client.guilds.fetch(GuildIDEnum.BIRTHDAYY_HQ);
		} catch (error) {
			if (error instanceof DiscordAPIError && error.code === RESTJSONErrorCodes.UnknownGuild) {
				return;
			}
			const discordError = fromDiscordAPIError(error as DiscordAPIError, {
				guildId: GuildIDEnum.BIRTHDAYY_HQ,
			});
			container.errorLogger.handle(discordError, {
				logSeverity: 'warn',
				guildId: GuildIDEnum.BIRTHDAYY_HQ,
			});
			return;
		}

		const user = await getUserInfo(userId);
		if (!user) return;

		let member;
		try {
			member = await guild.members.fetch(userId);
		} catch (error) {
			if (error instanceof DiscordAPIError && error.code === RESTJSONErrorCodes.UnknownMember) {
				return;
			}
			const discordError = fromDiscordAPIError(error as DiscordAPIError, {
				guildId: guild.id,
				userId,
			});
			container.errorLogger.handle(discordError, {
				logSeverity: 'warn',
				guildId: guild.id,
				userId,
			});
			return;
		}

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
			title: `${SUCCESS} You voted for Birthdayy on ${providerInfo.name}`,
			description: `Thank you so much for supporting me, you're the best ${HEART}`,
		};
		const dmEmbedObj = generateDefaultEmbed(dmEmbed);
		const component = {
			type: 1,
			components: [remindMeButton],
		};

		return sendDMMessage(user_id, { embeds: [dmEmbedObj], components: [component] });
	}

	private async sendVoteAnnouncement(providerInfo: { name: string; url: string }, user: User) {
		const { username, discriminator } = user;

		return sendMessage(VOTE_CHANNEL_ID, {
			embeds: [
				generateDefaultEmbed({
					title: `${EXCLAMATION} New Vote on ${providerInfo.name}`,
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
