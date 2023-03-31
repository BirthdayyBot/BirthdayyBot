import type { Birthday } from '@prisma/client';
import { ApplyOptions } from '@sapphire/decorators';
import { container } from '@sapphire/pieces';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import { Time } from '@sapphire/timestamp';
import { APIEmbed, Guild, GuildMember, Role, roleMention, Snowflake, userMention } from 'discord.js';
import generateEmbed from '../helpers/generate/embed';
import { logAll } from '../helpers/provide/config';
import { DEBUG, IMG_CAKE, NEWS } from '../helpers/provide/environment';
import { getCurrentOffset } from '../helpers/utils/date';
import { getGuildInformation, getGuildMember } from '../lib/discord';
import { sendMessage } from '../lib/discord/message';
import type { EmbedInformationModel } from '../lib/model/EmbedInformation.model';

@ApplyOptions<ScheduledTask.Options>({ name: 'BirthdayReminderTask', pattern: '0 * * * *' })
export class BirthdayReminderTask extends ScheduledTask {
	public async run(birthdayEvent?: { userId: string; guildId: string; isTest: boolean }) {
		if (birthdayEvent) {
			if (birthdayEvent?.isTest) container.logger.debug('[BirthdayTask] Test Birthday Event run');
			return await this.birthdayEvent(birthdayEvent.userId, birthdayEvent.guildId, birthdayEvent.isTest);
		}
		const current = getCurrentOffset();
		if (!current) return this.container.logger.warn('[BirthdayTask] Timzone Object not found');
		const dateFormatted = current.dateFormatted;

		const todaysBirthdays: Birthday[] = await this.container.utilities.birthday.get.BirthdayByDateAndTimezone(current.date, current.timezone);

		if (!todaysBirthdays.length) {
			return this.container.logger.info(`[BirthdayTask] No Birthdays Today. Date: ${dateFormatted}, offset: ${current.timezone}`);
		}

		this.container.logger.debug(`[BirthdayTask] Birthdays today: ${todaysBirthdays.length}, date: ${dateFormatted}, offset: ${current.timezone}`);

		for (const birthday of todaysBirthdays) {
			if (DEBUG) this.container.logger.info(`[BirthdayTask] Birthday loop: ${birthday.id}`);
			await this.birthdayEvent(birthday.user_id, birthday.guild_id, false);
		}
		container.logger.info(
			`[BirthdayTask] Finished running ${todaysBirthdays.length} birthdays for timezone ${current.timezone} [${current.dateFormatted}}]`,
		);
	}

	private async birthdayEvent(userId: string, guildId: string, isTest: boolean) {
		const guild = await getGuildInformation(guildId);
		const member = await getGuildMember(guildId, userId);

		if (!member || !guild) return this.container.logger.info(`[BirthdayTask] Member or Guild not found for ${userId} in ${guildId}`);

		const config = await this.container.utilities.guild.get.GuildConfig(guild.id);
		if (!config) return;
		const { announcement_channel, birthday_role, birthday_ping_role, announcement_message } = config;

		logAll(config);

		if (birthday_role) {
			const role = await guild.roles.fetch(birthday_role);
			if (!role) {
				if (DEBUG) this.container.logger.warn(`[BirthdayTask] Birthday role not found for guild ${guild.id} [${guild.name}]`);
				return { error: true, message: 'Birthday role not found' };
			}
			await this.addCurrentBirthdayChildRole(member, guildId, role, isTest);
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
		const birthdayEmbed = generateEmbed(embed);

		return this.sendBirthdayAnnouncement(content, announcement_channel, birthdayEmbed);
	}

	private async addCurrentBirthdayChildRole(member: GuildMember, guildId: Snowflake, role: Role, isTest: boolean) {
		const payload = { memberId: member.id, guildId, roleId: role.id };
		try {
			if (!member.roles.cache.has(role.id)) await member.roles.add(role);

			return await container.tasks.create('BirthdayRoleRemoverTask', payload, {
				repeated: false,
				delay: isTest ? Time.Minute * 3 : Time.Day,
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
