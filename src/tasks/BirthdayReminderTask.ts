import type { Birthday } from '@prisma/client';
import { ApplyOptions } from '@sapphire/decorators';
import { container } from '@sapphire/pieces';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import { Time } from '@sapphire/timestamp';
import { APIEmbed, Guild, GuildMember, inlineCode, Role, roleMention, Snowflake, userMention } from 'discord.js';
import generateEmbed from '../helpers/generate/embed';
import { logAll } from '../helpers/provide/config';
import { BOT_ADMIN_LOG, DEBUG, IMG_CAKE, NEWS } from '../helpers/provide/environment';
import { getCurrentOffset } from '../helpers/utils/date';
import { getGuildInformation, getGuildMember } from '../lib/discord';
import { sendMessage } from '../lib/discord/message';
import type { EmbedInformationModel } from '../lib/model/EmbedInformation.model';

@ApplyOptions<ScheduledTask.Options>({ name: 'BirthdayReminderTask', pattern: '0 * * * *' })
export class BirthdayReminderTask extends ScheduledTask {
	public async run(birthdayEvent?: { userId: string; guildId: string; isTest: boolean }) {
		container.logger.info('[BirthdayTask] Started');
		if (birthdayEvent && Object.keys(birthdayEvent).length !== 0) {
			if (birthdayEvent?.isTest) container.logger.debug('[BirthdayTask] Test Birthday Event run');
			return this.birthdayEvent(birthdayEvent.userId, birthdayEvent.guildId, birthdayEvent.isTest);
		}

		const current = getCurrentOffset();
		if (!current.utcOffset) {
			container.logger.error('BirthdayReminderTask ~ run ~ current.utcOffset:', current.utcOffset);
			await sendMessage(BOT_ADMIN_LOG, {
				embeds: [
					generateEmbed({
						title: 'BirthdayScheduler Report',
						description: 'No Current Offset could be generated',
					}),
				],
			});
			return this.container.logger.warn('[BirthdayTask] Timzone Object not correctly generated');
		}
		const { dateFormatted, utcOffset, timezone } = current;
		const dateFields = [
			{ name: 'Date', value: inlineCode(dateFormatted), inline: true },
			{ name: 'UTC Offset', value: inlineCode(utcOffset.toString()), inline: true },
			{ name: 'Timezone', value: inlineCode(JSON.stringify(timezone)), inline: true },
		];

		const todaysBirthdays: Birthday[] = await this.container.utilities.birthday.get.BirthdayByDateAndTimezone(
			current.date,
			current.utcOffset,
		);

		if (!todaysBirthdays.length) {
			await sendMessage(BOT_ADMIN_LOG, {
				embeds: [
					generateEmbed({
						title: 'BirthdayScheduler Report',
						description: 'No Birthdays Now',
						fields: dateFields,
					}),
				],
			});
			return this.container.logger.info(
				`[BirthdayTask] No Birthdays Today. Date: ${dateFormatted}, offset: ${current.utcOffset}`,
			);
		}

		this.container.logger.debug(
			`[BirthdayTask] Birthdays today: ${todaysBirthdays.length}, date: ${dateFormatted}, offset: ${current.utcOffset}`,
		);

		for (const birthday of todaysBirthdays) {
			if (DEBUG)
				this.container.logger.info(
					`[BirthdayTask] Birthday loop: ${todaysBirthdays.indexOf(birthday) + 1}/${todaysBirthdays.length}`,
				);
			await this.birthdayEvent(birthday.userId, birthday.guildId, false);
		}
		await sendMessage(BOT_ADMIN_LOG, {
			embeds: [
				generateEmbed({
					title: 'BirthdayScheduler Report',
					description: `Run ${todaysBirthdays.length} Birthdays`,
					fields: dateFields,
				}),
			],
		});
		return container.logger.info(
			`[BirthdayTask] Finished running ${todaysBirthdays.length} birthdays for offset ${current.utcOffset} [${current.dateFormatted}}]`,
		);
	}

	private async birthdayEvent(userId: string, guildId: string, isTest: boolean) {
		const guild = await getGuildInformation(guildId);
		const member = await getGuildMember(guildId, userId);

		if (!member || !guild)
			return this.container.logger.info(`[BirthdayTask] Member or Guild not found for ${userId} in ${guildId}`);

		const config = await this.container.utilities.guild.get.GuildConfig(guild.id);
		if (!config) return;
		const { announcementChannel, birthdayRole, birthdayPingRole, announcementMessage } = config;

		logAll(config);

		if (birthdayRole) {
			const role = await guild.roles.fetch(birthdayRole);
			if (!role) {
				if (DEBUG)
					this.container.logger.warn(
						`[BirthdayTask] Birthday role not found for guild ${guild.id} [${guild.name}]`,
					);
				return { error: true, message: 'Birthday role not found' };
			}
			await this.addCurrentBirthdayChildRole(member, guildId, role, isTest);
		}

		if (!announcementChannel) {
			this.container.logger.warn(
				`[BirthdayTask] Announcement Channel not found for guild ${guild.id} [${guild.name}]`,
			);
			return { error: true, message: 'No announcement channel set' };
		}

		const embed: EmbedInformationModel = {
			title: `${NEWS} Birthday Announcement!`,
			description: this.formatBirthdayMessage(announcementMessage, member, guild),
			thumbnail_url: IMG_CAKE,
		};

		const content = birthdayPingRole ? roleMention(birthdayPingRole) : '';
		const birthdayEmbed = generateEmbed(embed);

		return this.sendBirthdayAnnouncement(content, announcementChannel, birthdayEmbed);
	}

	private async addCurrentBirthdayChildRole(member: GuildMember, guildId: Snowflake, role: Role, isTest: boolean) {
		const payload = { memberId: member.id, guildId, roleId: role.id };
		try {
			if (!member.roles.cache.has(role.id)) await member.roles.add(role);

			return await container.tasks.create('BirthdayRoleRemoverTask', payload, {
				repeated: false,
				delay: isTest ? Time.Minute / 6 : Time.Day,
			});
		} catch (error: any) {
			if (error instanceof Error)
				return this.container.logger.error("COULDN'T ADD BIRTHDAY ROLE TO BIRTHDAY CHILD\n", error.message);
		}
	}

	private async sendBirthdayAnnouncement(content: string, channel_id: string, birthdayEmbed: APIEmbed) {
		try {
			const message = await sendMessage(channel_id, {
				content,
				embeds: [birthdayEmbed],
			});
			container.logger.info('Sent Birthday Announcement');
			return message;
		} catch (error: any) {
			if (error instanceof Error) {
				container.logger.warn(
					"COULND'T SEND THE BIRTHDAY ANNOUNCEMENT FOR THE BIRTHDAY CHILD\n",
					error.message,
				);
				// Send error message to log channel
				// TODO: Changed error message
				if (error.message.includes('Missing Access')) {
					// send Log to user
				}
			}

			return null;
		}
	}

	private formatBirthdayMessage(message: string, member: GuildMember, guild: Guild) {
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
