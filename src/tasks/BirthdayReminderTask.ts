import type { Birthday } from '@prisma/client';
import { ApplyOptions } from '@sapphire/decorators';
import { EmbedLimits } from '@sapphire/discord-utilities';
import { container } from '@sapphire/pieces';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import { Time } from '@sapphire/timestamp';
import {
	APIEmbed,
	codeBlock,
	DiscordAPIError,
	EmbedField,
	Guild,
	GuildMember,
	inlineCode,
	Role,
	roleMention,
	Snowflake,
	ThreadAutoArchiveDuration,
	userMention,
} from 'discord.js';
import generateEmbed from '../helpers/generate/embed';
import { logAll } from '../helpers/provide/config';
import { BOT_ADMIN_LOG, DEBUG, IMG_CAKE, NEWS } from '../helpers/provide/environment';
import { getCurrentOffset } from '../helpers/utils/date';
import { getGuildInformation, getGuildMember } from '../lib/discord';
import { sendMessage } from '../lib/discord/message';
import type { BirthdayEventInfoModel, TimezoneObject } from '../lib/model';
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
		const { dateFormatted, utcOffset } = current;
		const dateFields = [
			{ name: 'Date', value: inlineCode(dateFormatted), inline: true },
			{ name: 'UTC Offset', value: inlineCode(utcOffset.toString()), inline: true },
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

		const eventInfos = [];
		for (const birthday of todaysBirthdays) {
			if (DEBUG)
				this.container.logger.info(
					`[BirthdayTask] Birthday loop: ${todaysBirthdays.indexOf(birthday) + 1}/${todaysBirthdays.length}`,
				);
			const eventInfo = await this.birthdayEvent(birthday.userId, birthday.guildId, false);
			eventInfos.push(eventInfo);
		}
		// check if codeBlock('json', JSON.stringify(eventInfos, null, 2)) is longer than Embed description limit if yes remove the to much characters
		await this.sendBirthdaySchedulerReport(eventInfos, dateFields, todaysBirthdays.length, current);
		return container.logger.info(
			`[BirthdayTask] Finished running ${todaysBirthdays.length} birthdays for offset ${current.utcOffset} [${current.dateFormatted}}]`,
		);
	}

	private async birthdayEvent(userId: string, guildId: string, isTest: boolean): Promise<BirthdayEventInfoModel> {
		const eventInfo: BirthdayEventInfoModel = {
			userId,
			guildId,
			error: '',
		};
		const guild = await getGuildInformation(guildId);
		if (!guild) {
			await this.container.utilities.guild.update.DisableGuildAndBirthdays(guildId, true);
			eventInfo.error = 'Guild not found';
			return eventInfo;
		}
		const member = await getGuildMember(guildId, userId);
		if (!member) {
			await this.container.utilities.birthday.update.BirthdayDisabled(userId, guildId, true);
			eventInfo.error = 'Member not found';
			return eventInfo;
		}

		const config = await this.container.utilities.guild.get.GuildConfig(guild.id);
		if (!config) {
			eventInfo.error = 'Guild Config not found';
			return eventInfo;
		}
		const { announcementChannel, birthdayRole, birthdayPingRole, announcementMessage } = config;

		eventInfo.announcement = {
			sent: false,
			message: 'Error',
		};
		eventInfo.birthday_role = {
			added: false,
			message: 'Error',
		};
		logAll(config);

		if (birthdayRole) {
			const role = await guild.roles.fetch(birthdayRole);
			if (role) {
				const birthdayChildInfo = await this.addCurrentBirthdayChildRole(member, guildId, role, isTest);
				eventInfo.birthday_role = birthdayChildInfo;
			} else {
				eventInfo.birthday_role.message = 'Role not found';
			}
		}

		if (!announcementChannel) {
			this.container.logger.warn(
				`[BirthdayTask] Announcement Channel not found for guild ${guild.id} [${guild.name}]`,
			);
			eventInfo.announcement.message = 'Announcement Channel not found';
			return eventInfo;
		}

		const embed: EmbedInformationModel = {
			title: `${NEWS} Birthday Announcement!`,
			description: this.formatBirthdayMessage(announcementMessage, member, guild),
			thumbnail_url: IMG_CAKE,
		};

		const content = birthdayPingRole ? roleMention(birthdayPingRole) : '';
		const birthdayEmbed = generateEmbed(embed);

		const announcementInfo = await this.sendBirthdayAnnouncement(
			guildId,
			content,
			announcementChannel,
			birthdayEmbed,
		);
		eventInfo.announcement = announcementInfo;
		return eventInfo;
	}

	private async addCurrentBirthdayChildRole(
		member: GuildMember,
		guildId: Snowflake,
		role: Role,
		isTest: boolean,
	): Promise<{
		added: boolean;
		message: string;
	}> {
		const payload = { memberId: member.id, guildId, roleId: role.id };
		const returnData = {
			added: false,
			message: 'Error',
		};
		try {
			if (!member.roles.cache.has(role.id)) await member.roles.add(role);
			await container.tasks.create('BirthdayRoleRemoverTask', payload, {
				repeated: false,
				delay: isTest ? Time.Minute / 6 : Time.Day,
			});
			returnData.added = true;
			returnData.message = 'Success';
			return returnData;
		} catch (error: any) {
			if (error instanceof DiscordAPIError) {
				if (error.message.includes('Missing Permissions') || error.message.includes('Missing Access')) {
					// send Log to user and remove role from config
					await this.container.utilities.guild.reset.BirthdayRole(guildId);
					returnData.message = 'Missing Permissions';
				} else {
					returnData.message = error.message;
				}
				this.container.logger.error("COULDN'T ADD BIRTHDAY ROLE TO BIRTHDAY CHILD\n", error.message);
			}
			return returnData;
		}
	}

	private async sendBirthdayAnnouncement(
		guildId: Snowflake,
		content: string,
		channel_id: Snowflake,
		birthdayEmbed: APIEmbed,
	): Promise<{ sent: boolean; message: string }> {
		const returnData = {
			sent: false,
			message: 'Error',
		};
		try {
			await sendMessage(channel_id, {
				content,
				embeds: [birthdayEmbed],
			});
			container.logger.info('Sent Birthday Announcement');
			returnData.sent = true;
			returnData.message = 'Success';
			return returnData;
		} catch (error: any) {
			if (error instanceof DiscordAPIError) {
				// TODO: Changed error message
				if (error.message.includes('Missing Permissions') || error.message.includes('Missing Access')) {
					// send Log to user and remove channel from config
					returnData.message = 'Missing Permissions';
					await this.container.utilities.guild.reset.AnnouncementChannel(guildId);
				} else if (error.message.includes('Unknown Channel')) {
					// send Log to user and remove channel from config
					returnData.message = 'Unknown Channel';
					await this.container.utilities.guild.reset.AnnouncementChannel(guildId);
				} else {
					returnData.message = error.message;
				}
				container.logger.warn(
					"COULND'T SEND THE BIRTHDAY ANNOUNCEMENT FOR THE BIRTHDAY CHILD\n",
					error.message,
				);
			}

			return returnData;
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

	private async sendBirthdaySchedulerReport(
		eventInfos: BirthdayEventInfoModel[],
		dateFields: EmbedField[],
		birthdayCount: number,
		current: TimezoneObject,
	) {
		const embedTitle = `BirthdayScheduler Report ${current.dateFormatted} ${current.utcOffset ?? 'undefined'}`;

		// check if codeBlock('json', JSON.stringify(eventInfos, null, 2)) is longer than Embed description limit if yes remove the to much characters
		const embedDescription =
			codeBlock('json', JSON.stringify(eventInfos, null, 2)).length > EmbedLimits.MaximumDescriptionLength
				? `${codeBlock('json', JSON.stringify(eventInfos, null, 2)).substring(
						0,
						EmbedLimits.MaximumDescriptionLength - 3,
				  )}...`
				: codeBlock('json', JSON.stringify(eventInfos, null, 2));

		const schedulerReportMessage = await sendMessage(BOT_ADMIN_LOG, {
			embeds: [
				generateEmbed({
					title: embedTitle,
					description: '',
					fields: [
						...dateFields,
						{ name: 'Birthday Count', value: inlineCode(birthdayCount.toString()), inline: true },
					],
				}),
			],
		});
		const schedulerLogThread = await schedulerReportMessage?.startThread({
			name: embedTitle,
			autoArchiveDuration: ThreadAutoArchiveDuration.OneHour,
		});
		await schedulerLogThread?.send({
			embeds: [
				generateEmbed({
					title: embedTitle,
					description: embedDescription,
				}),
			],
		});
	}
}
