import { DefaultEmbedBuilder } from '#lib/discord';
import { Emojis, GuildIDEnum } from '#utils/constants';
import { VOTE_CHANNEL_ID } from '#utils/environment';
import { getActionRow, getRemindMeComponent } from '#utils/functions';
import { isTextBasedChannel } from '@sapphire/discord.js-utilities';
import { Time } from '@sapphire/duration';
import { container } from '@sapphire/framework';
import { Route, type ValidatorFunction } from '@sapphire/plugin-api';
import { envParseString } from '@skyra/env-utilities';
import { Guild, GuildMember, User } from 'discord.js';

interface TopGGWebhookData {
	type: 'upvote';
	user: string;
	query: string;
	bot: string;
}

const validateTopGGWebhookData: ValidatorFunction<unknown, TopGGWebhookData> = (data) => {
	if (typeof data !== 'object' || data === null) {
		throw new Error('Body must be a valid JSON object');
	}

	const { type, user, query, bot } = data as Partial<TopGGWebhookData>;

	if (type !== 'upvote') {
		throw new Error('Field "type" must be "upvote"');
	}

	if (typeof user !== 'string' || user.trim() === '') {
		throw new Error('Field "user" must be a non-empty string');
	}

	if (typeof query !== 'string' || query.trim() === '') {
		throw new Error('Field "query" must be a non-empty string');
	}

	if (typeof bot !== 'string' || bot.trim() === '') {
		throw new Error('Field "bot" must be a non-empty string');
	}

	return { type, user, query, bot }; // Return the validated and typed object
};

export class TopGGRoute extends Route {
	private readonly roleID = '1039089174948626473';

	public async run(request: Route.Request, response: Route.Response) {
		if (request.headers.authorization !== envParseString('TOPGG_WEBHOOK_SECRET')) {
			return response.error('Unauthorized');
		}

		try {
			const requestBody = (await request.readBodyJson()) as Record<string, string>;
			const body = validateTopGGWebhookData(requestBody);
			const guild = container.client.guilds.cache.get(GuildIDEnum.Birthdayy);

			if (!guild) return response.error('Guild not found');

			const member = await guild.members.fetch(body.user).catch(() => null);

			if (!member) return response.error('Member not found');

			await this.addRoleAndCreateTask(member);
			await this.sendThankYouDM(member.user, guild);
			await this.sendVoteNotification(member.user);

			return response.ok();
		} catch (error) {
			return response.error('Internal Server Error');
		}
	}

	private async addRoleAndCreateTask(member: GuildMember) {
		const result = await member.roles.add(this.roleID).catch(() => null);

		if (!result) return;

		const payload = {
			userID: member.id,
			guildID: member.guild.id,
			roleID: this.roleID,
			yield: true
		};

		return container.tasks.create({ name: 'RemoveBirthdayRoleTask', payload }, Time.Hour * 12);
	}

	private async sendThankYouDM(user: User, guild: Guild) {
		const embed = new DefaultEmbedBuilder()
			.setTitle(`${Emojis.Success} You voted for Birthdayy on TopGG!`)
			.setDescription(`Thank you so much for supporting me, you're the best ${Emojis.Heart}`);

		const components = [getActionRow(getRemindMeComponent(container.i18n.getT(guild.preferredLocale)))];
		const channel = user.dmChannel ?? (await user.createDM());

		return channel.send({ embeds: [embed.toJSON()], components });
	}

	private async sendVoteNotification(user: User) {
		const embed = new DefaultEmbedBuilder()
			.setTitle(`${Emojis.Info} New Vote on TopGG!`)
			.setDescription(
				`\`${user.username}#${user.discriminator}\` has **voted** for ${container.client.user!.displayName}! Use \`/vote\` or vote [here](https://top.gg/bot/${container.client.id}/vote) directly.`
			)
			.setThumbnail(user.avatarURL({ extension: 'png' }) ?? user.defaultAvatarURL);

		const channel = container.client.channels.cache.get(VOTE_CHANNEL_ID);

		if (!isTextBasedChannel(channel)) return;

		return channel.send({ embeds: [embed.toJSON()] });
	}
}
