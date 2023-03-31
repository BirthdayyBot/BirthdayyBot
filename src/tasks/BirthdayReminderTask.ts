import type { Birthday } from '@prisma/client';
import { ApplyOptions } from '@sapphire/decorators';
import { container } from '@sapphire/pieces';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import { Time } from '@sapphire/timestamp';
import { APIEmbed, Guild, GuildMember, Role, roleMention, userMention } from 'discord.js';
import generateEmbed from '../helpers/generate/embed';
import { logAll } from '../helpers/provide/config';
import { getCurrentOffset } from '../helpers/provide/currentOffset';
import { DEBUG, IMG_CAKE, NEWS } from '../helpers/provide/environment';
import { getGuildInformation, getGuildMember } from '../lib/discord';
import { sendMessage } from '../lib/discord/message';
import type { EmbedInformationModel } from '../lib/model/EmbedInformation.model';

@ApplyOptions<ScheduledTask.Options>({ name: 'BirthdayReminderTask', pattern: '0 * * * *' })
export class BirthdayReminderTask extends ScheduledTask {
	public async run(birthdayEvent?: { userID: string; guildID: string; isTest: boolean }) {
		if (birthdayEvent) {
			const { userID, guildID, isTest } = birthdayEvent;
			if (isTest) container.logger.info('[BirthdayTask] Test Birthday Event run');
			return this.birthdayEvent(userID, guildID, isTest);
		}
		const current = getCurrentOffset();
		if (!current) return this.container.logger.info('[BirthdayTask] No Timezone Found');
		const dateFormatted = current.date.format('YYYY-MM-DD');

		const todaysBirthdays: Birthday[] = await this.container.utilities.birthday.get.BirthdayByDateAndTimezone(current.date, current.timezone);

		if (!todaysBirthdays.length) {
			return this.container.logger.info(`[BirthdayTask] No Birthdays Today. Date: ${dateFormatted}, offset: ${current.timezone}`);
		}

		if (DEBUG) {
			this.container.logger.info(
				`[BirthdayTask] Birthdays today: ${todaysBirthdays.length}, date: ${dateFormatted}, offset: ${current.timezone}`,
			);
		}

		for (const birthday of todaysBirthdays) {
			if (DEBUG) this.container.logger.info(`[BirthdayTask] Birthday loop: ${birthday.id}`);
			await this.birthdayEvent(birthday.user_id, birthday.guild_id, false);
		}
	}

	private async birthdayEvent(userID: string, guildID: string, isTest: boolean) {
		const guild = await getGuildInformation(guildID);
		const member = await getGuildMember(guildID, userID);

		if (!member || !guild) return this.container.logger.info(`[BirthdayTask] Member or Guild not found for ${userID} in ${guildID}`);

		const config = await this.container.utilities.guild.get.GuildConfig(guild.id);
		if (!config) return;
		const { announcement_channel, birthday_role, birthday_ping_role, announcement_message } = config;

		await logAll(config);

		if (birthday_role) {
			const role = await guild.roles.fetch(birthday_role);
			if (!role) {
				if (DEBUG) this.container.logger.warn(`[BirthdayTask] Birthday role not found for guild ${guild.id} [${guild.name}]`);
				return { error: true, message: 'Birthday role not found' };
			}
			await this.addCurrentBirthdayChildRole({ member, guild, role, isTest });
		}

		if (!announcement_channel) {
			if (DEBUG) this.container.logger.warn(`[BirthdayTask] Announcement Channel not found for guild ${guild.id} [${guild.name}]`);
			return { error: true, message: 'No announcement channel set' };
		}
		const announcementMessage = await this.formatBirthdayMessage(announcement_message, member, guild);

		const embed: EmbedInformationModel = {
			title: `${NEWS} Birthday Announcement!`,
			description: announcementMessage,
			thumbnail_url: IMG_CAKE,
		};
		const content = birthday_ping_role ? roleMention(birthday_ping_role) : '';
		const birthdayEmbed = await generateEmbed(embed);

		return this.sendBirthdayAnnouncement(content, announcement_channel, birthdayEmbed);
	}

	private async addCurrentBirthdayChildRole(payload: { member: GuildMember; guild: Guild; role: Role; isTest: boolean }) {
		const { member, role } = payload;
		try {
			if (!member.roles.cache.has(role.id)) await member.roles.add(role);

			return await container.tasks.create('BirthdayRoleRemoverTask', payload, {
				repeated: false,
				delay: payload.isTest ? Time.Minute : Time.Day,
			});
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
