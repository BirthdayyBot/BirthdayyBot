import { sendMessage } from '#lib/discord/message';
import { CdnUrls, Emojis } from '#lib/utils/constants';
import { getCurrentOffset, type TimezoneObject } from '#utils/common/date';
import { generateDefaultEmbed } from '#utils/embed';
import { isCustom } from '#utils/env';
import { BOT_ADMIN_LOG, DEBUG, DEFAULT_ANNOUNCEMENT_MESSAGE } from '#utils/environment';
import { getBirthdays } from '#utils/functions/guilds';
import { floatPromise, resolveOnErrorCodesDiscord } from '#utils/functions/promises';
import type { Birthday } from '@prisma/client';
import type { PrismaClientUnknownRequestError } from '@prisma/client/runtime/library.js';
import { ApplyOptions } from '@sapphire/decorators';
import { Time } from '@sapphire/duration';
import { container } from '@sapphire/pieces';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import { envParseString } from '@skyra/env-utilities';
import {
	AttachmentBuilder,
	DiscordAPIError,
	Guild,
	GuildMember,
	RESTJSONErrorCodes,
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

export interface BirthdayEventInfoModel {
	userId: string;
	guildId: string;
	error?: string;
	message?: string;
	announcement?: string | { sent: boolean; message: string };
	birthday_role?: string | { added: boolean; message: string };
}

@ApplyOptions<ScheduledTask.Options>({ name: 'BirthdayReminderTask', pattern: '0 * * * *' })
export class BirthdayReminderTask extends ScheduledTask {
	public async run(payload?: { userId: string; guildId: string; isTest: boolean }) {
		if (payload) {
			const birthday = await container.prisma.birthday.findUnique({
				where: { userId_guildId: { userId: payload.userId, guildId: payload.guildId } },
			});
			if (!birthday) return null;
			return this.birthdayEvent(payload.userId, payload.guildId, payload.isTest);
		}

		for (const [, guild] of await container.client.guilds.fetch()) {
			floatPromise(getBirthdays(guild.id).announcedTodayBirthday());
		}
		return null;
	}

	public async runs(birthdayEvent?: { userId: string; guildId: string; isTest: boolean }) {
		container.logger.debug('[BirthdayTask] Started');
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
			return container.logger.warn('[BirthdayTask] Timzone Object not correctly generated');
		}
		const { dateFormatted, utcOffset, date: todaysDate } = current;
		const dateFields = [
			{ name: 'Date', value: inlineCode(dateFormatted), inline: true },
			{ name: 'UTC Offset', value: inlineCode(utcOffset.toString()), inline: true },
		];

		if (isCustom) {
			container.logger.info('[BirthdayTask] Custom Bot task');
			const guildOffset = await container.utilities.guild.get.GuildTimezone(envParseString('CLIENT_MAIN_GUILD'));
			if (guildOffset?.timezone !== utcOffset) {
				if (!guildOffset) return container.logger.error('[BirthdayTask] No Guild Offset found');
				return container.logger.debug(
					`[BirthdayTask Custom] Not current Offset. Current Offset [${utcOffset}] GuildOffset [${guildOffset.timezone}]`,
				);
			}
			currentBirthdays = await container.utilities.birthday.get.BirthdayByDateTimezoneAndGuild(
				todaysDate,
				utcOffset,
				envParseString('CLIENT_MAIN_GUILD'),
			);
		} else {
			currentBirthdays = await container.utilities.birthday.get.BirthdayByDateAndTimezone(todaysDate, utcOffset);
		}

		if (!currentBirthdays.length) {
			currentBirthdays;
			await this.sendBirthdaySchedulerReport([], dateFields, 0, current);
			return container.logger.info(
				`[BirthdayTask] No Birthdays Today. Date: ${dateFormatted}, offset: ${current.utcOffset}`,
			);
		}

		container.logger.debug(
			`[BirthdayTask] Birthdays today: ${currentBirthdays.length}, date: ${dateFormatted}, offset: ${current.utcOffset}`,
		);

		const eventInfos = await this.birthdayReminderLoop(currentBirthdays);
		await this.sendBirthdaySchedulerReport(eventInfos, dateFields, currentBirthdays.length, current);
		return container.logger.debug(
			`[BirthdayTask] Finished running ${currentBirthdays.length} birthdays for offset ${current.utcOffset} [${current.dateFormatted}}]`,
		);
	}

	private async birthdayReminderLoop(birthdays: Birthday[]): Promise<BirthdayEventInfoModel[]> {
		const eventInfos = [];
		for (const birthday of birthdays) {
			if (DEBUG)
				container.logger.debug(
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
		const config = await container.utilities.guild.get.GuildConfig(guildId);
		if (!config) {
			eventInfo.error = 'Guild Config not found';
			return eventInfo;
		}
		const {
			channelsAnnouncement,
			messagesAnnouncement,
			rolesBirthday,
			rolesNotified,
			premium: guildIsPremium,
		} = config;

		const guild = await resolveOnErrorCodesDiscord(
			container.client.guilds.fetch(guildId),
			RESTJSONErrorCodes.UnknownGuild,
		);

		if (!guild) {
			eventInfo.error = 'Guild not found';
			if (!guildIsPremium) {
				// TODO: Clean up in #407
				await container.utilities.guild.update
					.DisableGuildAndBirthdays(guildId, true)
					.catch((error: PrismaClientUnknownRequestError) => {
						container.logger.error('[BirthdayTask] Error disabling guild and birthdays', error);
					});
				eventInfo.error += ' - Guild & Birthdays disabled';
			}
			return eventInfo;
		}
		const member = await resolveOnErrorCodesDiscord(guild.members.fetch(userId), RESTJSONErrorCodes.UnknownMember);

		if (!member) {
			eventInfo.error = 'Member not found';
			if (!isTest && !guildIsPremium) {
				await container.utilities.birthday.delete
					.ByGuildAndUser(guildId, userId)
					.catch((error: PrismaClientUnknownRequestError) => {
						container.logger.error('[BirthdayTask] Error deleting birthday', error);
					});
				eventInfo.error += ' - Birthday deleted';
			}
			return eventInfo;
		}

		eventInfo.announcement = {
			sent: false,
			message: 'Not set',
		};
		eventInfo.birthday_role = {
			added: false,
			message: 'Not set',
		};

		this.container.logger.debug(`[BirthdayTask] Guild: ${guild.id} [${guild.name}]`);
		this.container.logger.debug(`[BirthdayTask] Member: ${member.id} [${member.user.tag}]`);

		if (rolesBirthday) {
			const role = await guild.roles.fetch(rolesBirthday);
			if (role) {
				const birthdayChildInfo = await this.addCurrentBirthdayChildRole(member, guildId, role, isTest);
				eventInfo.birthday_role = birthdayChildInfo;
			} else {
				eventInfo.birthday_role.message = 'Role not found';
				await container.utilities.guild.reset.BirthdayRole(guildId);
			}
		}

		if (!channelsAnnouncement) {
			container.logger.debug(`[BirthdayTask] Announcement Channel not set for guild ${guild.id} [${guild.name}]`);
			eventInfo.announcement.message = 'Announcement Channel not set';
			return eventInfo;
		}

		const embed: APIEmbed = {
			title: `${Emojis.News} Birthday Announcement!`,
			description: this.formatBirthdayMessage(
				messagesAnnouncement ?? DEFAULT_ANNOUNCEMENT_MESSAGE,
				member,
				guild,
			),
			thumbnail: {
				url: CdnUrls.Cake,
			},
		};
		const birthdayEmbed = generateDefaultEmbed(embed);

		const announcementInfo = await this.sendBirthdayAnnouncement(
			guildId,
			channelsAnnouncement,
			birthdayEmbed,
			rolesNotified.map((role) => roleMention(role)).join(' '),
		);
		eventInfo.announcement = announcementInfo;
		return eventInfo;
	}

	private async addCurrentBirthdayChildRole(
		member: GuildMember,
		guildID: Snowflake,
		role: Role,
		isTest: boolean,
	): Promise<{
		added: boolean;
		message: string;
	}> {
		const returnData = {
			added: false,
			message: 'Not set',
		};

		try {
			if (!member.roles.cache.has(role.id)) await member.roles.add(role);
			await container.tasks.create(
				{
					name: 'RemoveBirthdayRole',
					payload: { guildID, userID: member.user.id, roleID: role.id },
				},
				{
					repeated: false,
					delay: isTest ? Time.Minute / 6 : Time.Day,
				},
			);
			returnData.added = true;
			returnData.message = 'Success';
			return returnData;
		} catch (error: any) {
			if (error instanceof DiscordAPIError) {
				if (error.message.includes('Missing Permissions') || error.message.includes('Missing Access')) {
					await container.utilities.guild.reset.BirthdayRole(guildID);
					returnData.message = 'Missing Permissions';
				} else {
					returnData.message = error.message;
				}
				container.logger.error("COULDN'T ADD BIRTHDAY ROLE TO BIRTHDAY CHILD\n", error.message);
			}
			return returnData;
		}
	}

	private async sendBirthdayAnnouncement(
		guildId: Snowflake,
		channel_id: Snowflake,
		birthdayEmbed: APIEmbed,
		content?: string,
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
			container.logger.debug('Sent Birthday Announcement');
			returnData.sent = true;
			returnData.message = 'Success';
			return returnData;
		} catch (error: any) {
			if (error instanceof DiscordAPIError) {
				// TODO: Changed error message
				if (error.message.includes('Missing Permissions') || error.message.includes('Missing Access')) {
					// send Log to user and remove channel from config
					returnData.message = 'Missing Permissions';
					await container.utilities.guild.reset.AnnouncementChannel(guildId);
				} else if (error.message.includes('Unknown Channel')) {
					// send Log to user and remove channel from config
					returnData.message = 'Unknown Channel';
					await container.utilities.guild.reset.AnnouncementChannel(guildId);
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
		// const reportDescription =
		// 	codeBlock('json', JSON.stringify(eventInfos, null, 2)).length > EmbedLimits.MaximumDescriptionLength
		// 		? `${codeBlock('json', JSON.stringify(eventInfos, null, 2)).substring(
		// 				0,
		// 				EmbedLimits.MaximumDescriptionLength - 6,
		// 		  )}...\`\`\``
		// 		: codeBlock('json', JSON.stringify(eventInfos, null, 2));
		const reportContent = JSON.stringify(eventInfos, null, 2);
		if (eventInfos.length <= 0) {
			return sendReport();
		}

		let guildIdsString = '';
		for (const eventInfo of eventInfos) {
			guildIdsString += `${eventInfo.guildId}\n`;
		}

		const schedulerReportMessage = await sendReport();
		const schedulerLogThread = await schedulerReportMessage?.startThread({
			name: embedTitle,
			autoArchiveDuration: ThreadAutoArchiveDuration.OneHour,
		});
		const reportFile = new AttachmentBuilder(Buffer.from(reportContent), {
			name: `${embedTitle}.json`,
			description: 'Scheduler Report File',
		});

		if (!schedulerLogThread) {
			return schedulerReportMessage?.channel.send('Couldnt create a thread!');
		}
		await schedulerLogThread.send({
			embeds: [
				generateDefaultEmbed({
					title: embedTitle,
					description: `Guilds:\n${codeBlock(guildIdsString)}`,
				}),
			],
		});

		return schedulerLogThread.send({
			files: [reportFile],
		});

		function sendReport() {
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

declare module '@sapphire/plugin-scheduled-tasks' {
	interface ScheduledTasks {
		BirthdayReminderTask: { userId: string; guildId: string; isTest: boolean } | undefined;
	}
}
