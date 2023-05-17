import type { Birthday } from '@prisma/client';
import { Time } from '@sapphire/cron';
import { ApplyOptions } from '@sapphire/decorators';
import { EmbedLimits } from '@sapphire/discord-utilities';
import { container } from '@sapphire/pieces';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import {
	DiscordAPIError,
	Guild,
	GuildMember,
	Role,
	ThreadAutoArchiveDuration,
	codeBlock,
	inlineCode,
	roleMention,
	userMention,
	type APIEmbed,
	type EmbedField,
	type Snowflake,
} from 'discord.js';
import { logAll } from '../helpers/provide/config';
import { BOT_ADMIN_LOG, DEBUG, IMG_CAKE, IS_CUSTOM_BOT, MAIN_DISCORD, NEWS } from '../helpers/provide/environment';
import { getCurrentOffset } from '../helpers/utils/date';
import { getGuildInformation, getGuildMember } from '../lib/discord';
import { sendMessage } from '../lib/discord/message';
import type { BirthdayEventInfoModel, TimezoneObject } from '../lib/model';
import type { EmbedInformationModel } from '../lib/model/EmbedInformation.model';
import { generateDefaultEmbed } from '../lib/utils/embed';
import type { RoleRemovePayload } from './BirthdayRoleRemoverTask';

@ApplyOptions<ScheduledTask.Options>({ name: 'BirthdayReminderTask', pattern: '0 * * * *' })
export class BirthdayReminderTask extends ScheduledTask {
	public async run(birthdayEvent?: { userId: string; guildId: string; isTest: boolean }) {
		container.logger.info('[BirthdayTask] Started');
		if (birthdayEvent && Object.keys(birthdayEvent).length !== 0) {
			if (birthdayEvent?.isTest) container.logger.debug('[BirthdayTask] Test Birthday Event run');
			return this.birthdayEvent(birthdayEvent.userId, birthdayEvent.guildId, birthdayEvent.isTest);
		}
		let currentBirthdays: Birthday[] = [];
		const current = getCurrentOffset();
		if (current.utcOffset === undefined) {
			container.logger.error('BirthdayReminderTask ~ run ~ current.utcOffset:', current.utcOffset);
			await sendMessage(BOT_ADMIN_LOG, {
				embeds: [
					generateDefaultEmbed({
						title: 'BirthdayScheduler Report',
						description: 'No Current Offset could be generated',
					}),
				],
			});
			return this.container.logger.warn('[BirthdayTask] Timzone Object not correctly generated');
		}
		const { dateFormatted, utcOffset, date: todaysDate } = current;
		const dateFields = [
			{ name: 'Date', value: inlineCode(dateFormatted), inline: true },
			{ name: 'UTC Offset', value: inlineCode(utcOffset.toString()), inline: true },
		];

		if (IS_CUSTOM_BOT) {
			container.logger.info('[BirthdayTask] Custom Bot task');
			const guildOffset = await this.container.utilities.guild.get.GuildTimezone(MAIN_DISCORD);
			if (guildOffset?.timezone !== utcOffset) {
				return container.logger.debug('[BirthdayTask Custom] Not current Offset');
			}
			currentBirthdays = await this.container.utilities.birthday.get.BirthdayByDateTimezoneAndGuild(
				todaysDate,
				utcOffset,
				MAIN_DISCORD,
			);
		} else {
			currentBirthdays = await this.container.utilities.birthday.get.BirthdayByDateAndTimezone(
				todaysDate,
				utcOffset,
			);
		}

		if (!currentBirthdays.length) {
			currentBirthdays;
			await this.sendBirthdaySchedulerReport([], dateFields, 0, current);
			return this.container.logger.info(
				`[BirthdayTask] No Birthdays Today. Date: ${dateFormatted}, offset: ${current.utcOffset}`,
			);
		}

		this.container.logger.debug(
			`[BirthdayTask] Birthdays today: ${currentBirthdays.length}, date: ${dateFormatted}, offset: ${current.utcOffset}`,
		);

		const eventInfos = await this.birthdayReminderLoop(currentBirthdays);
		await this.sendBirthdaySchedulerReport(eventInfos, dateFields, currentBirthdays.length, current);
		return container.logger.info(
			`[BirthdayTask] Finished running ${currentBirthdays.length} birthdays for offset ${current.utcOffset} [${current.dateFormatted}}]`,
		);
	}

	private async birthdayReminderLoop(birthdays: Birthday[]): Promise<BirthdayEventInfoModel[]> {
		const eventInfos = [];
		for (const birthday of birthdays) {
			if (DEBUG)
				this.container.logger.info(
					`[BirthdayTask] Birthday loop: ${birthdays.indexOf(birthday) + 1}/${birthdays.length}`,
				);
			const eventInfo = await this.birthdayEvent(birthday.userId, birthday.guildId, false);
			eventInfos.push(eventInfo);
		}
		return eventInfos;
	}

	private async birthdayEvent(userId: string, guildId: string, isTest: boolean): Promise<BirthdayEventInfoModel> {
		const eventInfo: BirthdayEventInfoModel = {
			userId,
			guildId,
		};
		const guild = await getGuildInformation(guildId);
		if (!guild) {
			await this.container.utilities.guild.update.DisableGuildAndBirthdays(guildId, true).catch((error) => {
				this.container.logger.error('[BirthdayTask] Error disabling guild and birthdays', error);
			});
			eventInfo.error = 'Guild not found';
			return eventInfo;
		}
		const member = await getGuildMember(guildId, userId);
		if (!member || !isTest) {
			await this.container.utilities.birthday.delete.ByGuildAndUser(guildId, userId).catch((error) => {
				this.container.logger.error('[BirthdayTask] Error deleting birthday', error);
			});
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
			message: 'Not set',
		};
		eventInfo.birthday_role = {
			added: false,
			message: 'Not set',
		};
		logAll(config);

		if (birthdayRole) {
			const role = await guild.roles.fetch(birthdayRole);
			if (role) {
				const birthdayChildInfo = await this.addCurrentBirthdayChildRole(member, guildId, role, isTest);
				eventInfo.birthday_role = birthdayChildInfo;
			} else {
				eventInfo.birthday_role.message = 'Role not found';
				await container.utilities.guild.reset.BirthdayRole(guildId);
			}
		}

		if (!announcementChannel) {
			this.container.logger.debug(
				`[BirthdayTask] Announcement Channel not set for guild ${guild.id} [${guild.name}]`,
			);
			eventInfo.announcement.message = 'Announcement Channel not set';
			return eventInfo;
		}

		const embed: EmbedInformationModel = {
			title: `${NEWS} Birthday Announcement!`,
			description: this.formatBirthdayMessage(announcementMessage, member, guild),
			thumbnail_url: IMG_CAKE,
		};
		const birthdayEmbed = generateDefaultEmbed(embed);

		const content = birthdayPingRole ? roleMention(birthdayPingRole) : '';

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
		const payload: RoleRemovePayload = { memberId: member.id, guildId, roleId: role.id };
		const returnData = {
			added: false,
			message: 'Not set',
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
			message: 'Not set',
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
					"COULDN'T SEND THE BIRTHDAY ANNOUNCEMENT FOR THE BIRTHDAY CHILD\n",
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
		eventInfos.map((eventInfo) => {
			if (typeof eventInfo.announcement === 'object' && eventInfo.announcement.sent) {
				eventInfo.announcement = 'sent';
			}
			if (typeof eventInfo.birthday_role === 'object' && eventInfo.birthday_role.added) {
				eventInfo.birthday_role = 'added';
			}
			return eventInfo;
		});
		const embedFields = [
			...dateFields,
			{ name: 'Birthday Count', value: inlineCode(birthdayCount.toString()), inline: true },
		];
		const embedDescription = birthdayCount > 0 ? '' : 'No Birthdays Today';
		const reportDescription =
			codeBlock('json', JSON.stringify(eventInfos, null, 2)).length > EmbedLimits.MaximumDescriptionLength
				? `${codeBlock('json', JSON.stringify(eventInfos, null, 2)).substring(
						0,
						EmbedLimits.MaximumDescriptionLength - 6,
				  )}...\`\`\``
				: codeBlock('json', JSON.stringify(eventInfos, null, 2));
		// TODO: #228 Use Paginated Embeds when Content is too long
		if (eventInfos.length <= 0) {
			return sendReport();
		}

		const schedulerReportMessage = await sendReport();
		const schedulerLogThread = await schedulerReportMessage?.startThread({
			name: embedTitle,
			autoArchiveDuration: ThreadAutoArchiveDuration.OneHour,
		});
		return schedulerLogThread?.send({
			embeds: [
				generateDefaultEmbed({
					title: embedTitle,
					description: reportDescription,
				}),
			],
		});

		async function sendReport() {
			return sendMessage(BOT_ADMIN_LOG, {
				embeds: [
					generateDefaultEmbed({
						title: embedTitle,
						description: embedDescription,
						fields: embedFields,
					}),
				],
			});
		}
	}
}
