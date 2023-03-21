import { ApplyOptions } from '@sapphire/decorators';
import { container } from '@sapphire/pieces';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import { Time } from '@sapphire/timestamp';
import { APIEmbed, Guild, GuildMember, Role, roleMention, userMention } from 'discord.js';
import generateEmbed from '../helpers/generate/embed';
import { getConfig, logAll } from '../helpers/provide/config';
import { getCurrentOffset } from '../helpers/provide/currentOffset';
import { APP_ENV, DEBUG, IMG_CAKE, NEWS } from '../helpers/provide/environment';
import { getBirthdaysByDateAndTimezone } from '../lib/birthday/birthday';
import { sendMessage } from '../lib/discord/message';
import type { BirthdayWithUserModel } from '../lib/model';
import type { EmbedInformationModel } from '../lib/model/EmbedInformation.model';
import { getGuildInformation, getGuildMember } from '../lib/discord';

@ApplyOptions<ScheduledTask.Options>({ name: 'BirthdayReminderTask', pattern: '0 * * * *' })
export class BirthdayReminderTask extends ScheduledTask {
	public async run(birthdayEvent?: { userID: string; guildID: string; isTest: boolean }) {
		const { date: today, offsetString: offset } = await getCurrentOffset();
		let todaysBirthdays: BirthdayWithUserModel[] = [];

		if (birthdayEvent) {
			const { userID, guildID, isTest } = birthdayEvent;
			return this.birthdayEvent(userID, guildID, isTest);
		}

		if (APP_ENV === 'prd') {
			const { birthdays } = await getBirthdaysByDateAndTimezone(today, offset);
			todaysBirthdays = birthdays;
		}

		if (!todaysBirthdays.length) return this.container.logger.info(`[BirthdayTask] No Birthdays Today. Date: ${today}, offset: ${offset}`);

		if (DEBUG) this.container.logger.info(`[BirthdayTask] Birthdays today: ${todaysBirthdays.length}, date: ${today}, offset: ${offset}`);

		for (const birthday of todaysBirthdays) {
			if (DEBUG) this.container.logger.info(`[BirthdayTask] Birthday loop: ${birthday.id}`);
			await this.birthdayEvent(birthday.user_id, birthday.guild_id, false);
		}
	}

	private async birthdayEvent(userID: string, guildID: string, isTest: boolean) {
		const guild = await getGuildInformation(guildID);
		const member = await getGuildMember(guildID, userID);

		if (!member || !guild) return;

		const config = await getConfig(guild.id);
		const { ANNOUNCEMENT_CHANNEL, BIRTHDAY_ROLE, BIRTHDAY_PING_ROLE, ANNOUNCEMENT_MESSAGE } = config;

		await logAll(config);

		if (BIRTHDAY_ROLE) {
			const role = await guild.roles.fetch(BIRTHDAY_ROLE);
			if (!role) {
				if (DEBUG) this.container.logger.warn(`[BirthdayTask] Birthday role not found for guild ${guild.id} [${guild.name}]`);
				return { error: true, message: 'Birthday role not found' };
			}
			await this.addCurrentBirthdayChildRole({ member, guild, role, isTest });
		}

		if (!ANNOUNCEMENT_CHANNEL) {
			if (DEBUG) this.container.logger.warn(`[BirthdayTask] Announcement Channel not found for guild ${guild.id} [${guild.name}]`);
			return { error: true, message: 'No announcement channel set' };
		}
		const announcementMessage = await this.formatBirthdayMessage(ANNOUNCEMENT_MESSAGE, member, guild);

		const embed: EmbedInformationModel = {
			title: `${NEWS} Birthday Announcement!`,
			description: announcementMessage,
			thumbnail_url: IMG_CAKE,
		};
		const content = BIRTHDAY_PING_ROLE ? roleMention(BIRTHDAY_PING_ROLE) : '';
		const birthdayEmbed = await generateEmbed(embed);

		return this.sendBirthdayAnnouncement(content, ANNOUNCEMENT_CHANNEL, birthdayEmbed);
	}

	private async addCurrentBirthdayChildRole(payload: { member: GuildMember; guild: Guild; role: Role; isTest: boolean }) {
		const { member, role } = payload;
		try {
			if (!member.roles.cache.has(role.id)) await member.roles.add(role);

			return container.tasks.create('BirthdayRoleRemoverTask', payload, { repeated: false, delay: payload.isTest ? Time.Minute : Time.Day });
		} catch (error) {
			return this.container.logger.error('COULDN\'T ADD BIRTHDAY ROLE TO BIRTHDAY CHILD\n', error);
		}
	}

	private async sendBirthdayAnnouncement(content: string, channel_id: string, birthdayEmbed: APIEmbed) {
		try {
			const message = await sendMessage(channel_id, {
				content: content,
				embeds: [birthdayEmbed],
			});
			container.logger.info('Sent Birthday Announcement');
			return message;
		} catch (error: any) {
			container.logger.warn('COULND\'T SEND THE BIRTHDAY ANNOUNCEMENT FOR THE BIRTHDAY CHILD\n', error);
			// Send error message to log channel
			// TODO: Changed error message
			if (error.message.includes('Missing Access')) {
				// send Log to user
			}
			return;
		}
	}

	private async formatBirthdayMessage(message: string, member: GuildMember, guild: Guild) {
		const placeholders = {
			'{USERNAME}': member.user.username,
			'{DISCRIMINATOR}': member.user.discriminator,
			'{NEW_LINE}': '\n',
			'{GUILD_NAME}': guild.name,
			'{GUILD_ID}': guild.id,
			'{MENTION}': userMention(member.id),
			'{SERVERNAME}': guild.name,
		};

		let formattedMessage = message;
		for (const [placeholder, value] of Object.entries(placeholders)) {
			formattedMessage = formattedMessage.replace(new RegExp(placeholder, 'gi'), value);
		}

		return formattedMessage;
	}
}
