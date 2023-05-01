import { ApplyOptions } from '@sapphire/decorators';
import { container } from '@sapphire/pieces';
import { ApiRequest, ApiResponse, methods, Route } from '@sapphire/plugin-api';
import { authenticated } from '../../lib/api/utils';
import type { APIWebhookTopGG } from '../../lib/model/APIWebhookTopGG.model';
import { envIsDefined, envParseBoolean, envParseString } from '@skyra/env-utilities';
import type { VoteProvider } from '../../lib/types/VoteProvider.type';
import { Time } from '@sapphire/cron';
import { VOTE_ROLE_ID, SUCCESS, HEART, EXCLAMATION, VOTE_CHANNEL_ID, BOT_NAME } from '../../helpers';
import { remindMeButton } from '../../lib/components/button';
import { sendDMMessage, sendMessage } from '../../lib/discord';
import { GuildIDEnum } from '../../lib/enum/GuildID.enum';
import { generateDefaultEmbed } from '../../lib/utils/embed';
import type { User } from 'discord.js';

@ApplyOptions<Route.Options>({ route: 'webhook/topgg', enabled: envIsDefined('WEBHOOK_SECRET') })
export class UserRoute extends Route {
	@authenticated(envParseString('WEBHOOK_SECRET'))
	public async [methods.POST](request: ApiRequest, response: ApiResponse) {
		envParseBoolean('DEBUG') ? container.logger.info(request.body) : null;

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
		return response.ok({ message: 'TOPGG VERIFIED' });
	}

	private async voteProcess(provider: VoteProvider, user_id: string) {
		const providerInfo = this.getProviderInfo(provider);
		const member = await container.client.users.fetch(user_id);
		// 1. Send DM
		await this.sendVoteDM(providerInfo, user_id);
		// 2. Message To Server
		await this.sendVoteAnnouncement(providerInfo, member);
		// 3. Update role
		const addRole = await this.addVoteRole(user_id);
		// 4. Schedule role removal
		if (addRole) await this.scheduleRoleRemoval(VOTE_ROLE_ID, user_id, GuildIDEnum.BIRTHDAYY_HQ);
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
					thumbnail: { url: user.avatarURL() ?? user.defaultAvatarURL },
				}),
			],
		});
	}

	/**
	 * Adds the vote role to the user with the provided user ID
	 * @param user_id - The ID of the user to add the vote role to
	 * @returns A boolean indicating whether the role was added or not
	 */
	private async addVoteRole(user_id: string): Promise<boolean> {
		const user = await (await container.client.guilds.fetch(GuildIDEnum.BIRTHDAYY_HQ)).members.fetch(user_id);
		if (!user) return false;

		const role = await (await container.client.guilds.fetch(GuildIDEnum.BIRTHDAYY_HQ)).roles.fetch(VOTE_ROLE_ID);
		if (!role) return false;

		await user.roles.add(role);
		return true;
	}

	private async scheduleRoleRemoval(user_id: string, role_id: string, guild_id: string) {
		const options = { user_id, role_id, guild_id };
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
