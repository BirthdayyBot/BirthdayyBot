import { DefaultEmbedBuilder } from '#lib/discord';
import type { IRemoveBirthdayRoleTask } from '#lib/types/Augments.d.ts';
import { DEFAULT_ANNOUNCEMENT_MESSAGE } from '#root/config';
import { getCurrentOffset, type TimezoneObject } from '#utils/common/date';
import { CdnUrls, Emojis } from '#utils/constants';
import { isCustom } from '#utils/env';
import { BOT_ADMIN_LOG, DEBUG } from '#utils/environment';
import { resolveOnErrorCodesDiscord } from '#utils/functions/promises';
import type { Birthday } from '@prisma/client';
import type { PrismaClientUnknownRequestError } from '@prisma/client/runtime/library.js';
import { ApplyOptions } from '@sapphire/decorators';
import { isTextBasedChannel } from '@sapphire/discord.js-utilities';
import { Time } from '@sapphire/duration';
import { container } from '@sapphire/pieces';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import { isNullish, type Nullish } from '@sapphire/utilities';
import { envParseString } from '@skyra/env-utilities';
import dayjs from 'dayjs';
import {
	AttachmentBuilder,
	DiscordAPIError,
	Guild,
	GuildMember,
	RESTJSONErrorCodes,
	ThreadAutoArchiveDuration,
	codeBlock,
	inlineCode,
	roleMention,
	userMention,
	type APIEmbed,
	type EmbedField,
	type Snowflake
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
			return this.runs(payload);
		}

		return this.runs();
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
			const channel = container.client.channels.cache.get(BOT_ADMIN_LOG);
			if (!isTextBasedChannel(channel)) {
				return container.logger.error('BirthdayReminderTask ~ run ~ channel:', channel);
			}
			const embed = new DefaultEmbedBuilder()
				.setTitle('BirthdayScheduler Report')
				.setDescription('No Current Offset could be generated');

			container.logger.error('BirthdayReminderTask ~ run ~ embed:', embed);

			return channel.send({ embeds: [embed] });
		}
		const { dateFormatted, utcOffset, date: todaysDate } = current;
		const dateFields = [
			{ name: 'Date', value: inlineCode(dateFormatted), inline: true },
			{ name: 'UTC Offset', value: inlineCode(utcOffset.toString()), inline: true }
		];

		if (isCustom) {
			container.logger.info('[BirthdayTask] Custom Bot task');
			const settings = await container.prisma.guild.findUnique({
				where: { id: envParseString('CLIENT_MAIN_GUILD') },
				select: { timezone: true }
			});

			const guildOffset = dayjs().tz(settings?.timezone).utcOffset();
			if (guildOffset !== utcOffset) {
				if (!guildOffset) return container.logger.error('[BirthdayTask] No Guild Offset found');
			}
			currentBirthdays = await container.utilities.birthday.get.BirthdayByDateTimezoneAndGuild(
				todaysDate,
				utcOffset,
				envParseString('CLIENT_MAIN_GUILD')
			);
		} else {
			currentBirthdays = await container.utilities.birthday.get.BirthdayByDateAndTimezone(todaysDate, utcOffset);
		}

		if (!currentBirthdays.length) {
			await this.sendBirthdaySchedulerReport([], dateFields, 0, current);
			return container.logger.info(
				`[BirthdayTask] No Birthdays Today. Date: ${dateFormatted}, offset: ${current.utcOffset}`
			);
		}

		container.logger.debug(
			`[BirthdayTask] Birthdays today: ${currentBirthdays.length}, date: ${dateFormatted}, offset: ${current.utcOffset}`
		);

		const eventInfos = await this.birthdayReminderLoop(currentBirthdays);
		await this.sendBirthdaySchedulerReport(eventInfos, dateFields, currentBirthdays.length, current);
		return container.logger.debug(
			`[BirthdayTask] Finished running ${currentBirthdays.length} birthdays for offset ${current.utcOffset} [${current.dateFormatted}}]`
		);
	}

	private async birthdayReminderLoop(birthdays: Birthday[]): Promise<BirthdayEventInfoModel[]> {
		const eventInfos = [];
		for (const birthday of birthdays) {
			if (DEBUG)
				container.logger.debug(
					`[BirthdayTask] Birthday loop: ${birthdays.indexOf(birthday) + 1}/${birthdays.length}`
				);
			const eventInfo = await this.birthdayEvent(birthday.userId, birthday.guildId, false);
			eventInfos.push(eventInfo);
		}
		return eventInfos;
	}

	private async birthdayEvent(userId: string, guildId: string, isTest: boolean): Promise<BirthdayEventInfoModel> {
		const eventInfo: BirthdayEventInfoModel = {
			userId,
			guildId
		};
		const config = await container.utilities.guild.get.GuildConfig(guildId);
		if (!config) {
			eventInfo.error = 'Guild Config not found';
			return eventInfo;
		}
		const { announcementChannel, birthdayRole, birthdayPingRole, premium: guildIsPremium } = config;

		const announcementMessage = config.announcementMessage ?? DEFAULT_ANNOUNCEMENT_MESSAGE;

		let content: string | undefined;
		if (birthdayPingRole) content = roleMention(birthdayPingRole);
		if (birthdayPingRole === guildId) content = '@everyone';

		const guild = await resolveOnErrorCodesDiscord(
			container.client.guilds.fetch(guildId),
			RESTJSONErrorCodes.UnknownGuild
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
			message: 'Not set'
		};
		this.container.logger.debug(`[BirthdayTask] Guild: ${guild.id} [${guild.name}]`);
		this.container.logger.debug(`[BirthdayTask] Member: ${member.id} [${member.user.tag}]`);

		if (birthdayRole) {
			const payload = { guildID: guild.id, userID: member.id, roleID: birthdayRole };
			eventInfo.birthday_role = await this.handleRole(payload, member, birthdayRole, isTest);
		}

		if (!announcementChannel) {
			container.logger.debug(`[BirthdayTask] Announcement Channel not set for guild ${guild.id} [${guild.name}]`);
			eventInfo.announcement.message = 'Announcement Channel not set';
			return eventInfo;
		}

		const birthdayEmbed = new DefaultEmbedBuilder()
			.setTitle(`${Emojis.News} Birthday Announcement!`)
			.setDescription(this.formatBirthdayMessage(announcementMessage, member, guild))
			.setThumbnail(CdnUrls.Cake);

		const announcementInfo = await this.sendBirthdayAnnouncement(
			guildId,
			announcementChannel,
			birthdayEmbed.toJSON(),
			content
		);

		eventInfo.announcement = announcementInfo;
		return eventInfo;
	}

	private async handleRole(
		data: IRemoveBirthdayRoleTask,
		member: GuildMember,
		roleId: string | Nullish,
		isTest: boolean
	): Promise<{ added: boolean; message: string }> {
		if (isNullish(roleId)) return { added: false, message: 'Role not set' };

		const role = member.guild.roles.cache.get(roleId);

		// If the role doesn't exist anymore, reset:
		if (!role) {
			await container.prisma.guild.update({
				where: { id: data.guildID },
				data: { birthdayRole: null }
			});
			return { added: false, message: 'Role not found' };
		}

		const me = await member.guild.members.fetchMe();

		// If the role can be given, add it to the user:
		if (me.roles.highest.position > role.position) {
			await this.addBirthdayRole(data, member, role.id, isTest);
		}

		return { added: true, message: 'Role handled' };
	}

	private async addBirthdayRole(
		data: IRemoveBirthdayRoleTask,
		member: GuildMember,
		birthdayRole: string,
		isTest: boolean
	) {
		await member.roles.add(birthdayRole);
		const delay = isTest ? Time.Second * 30 : Time.Day;
		await this.container.tasks.create(
			{
				name: 'RemoveBirthdayRoleTask',
				payload: {
					guildID: data.guildID,
					roleID: birthdayRole,
					userID: data.userID
				}
			},
			delay
		);
	}

	private async sendBirthdayAnnouncement(
		guildId: Snowflake,
		channel_id: Snowflake,
		birthdayEmbed: APIEmbed,
		content?: string
	): Promise<{ sent: boolean; message: string }> {
		const returnData = {
			sent: false,
			message: 'Not set'
		};
		try {
			const channel = await container.client.channels.fetch(channel_id);
			if (!isTextBasedChannel(channel)) {
				returnData.message = 'Channel not Text Based';
				return returnData;
			}

			await channel.send({
				embeds: [birthdayEmbed],
				content
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
					error.message
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
			'{SERVERNAME}': guild.name
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
		current: TimezoneObject
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
			{ name: 'Birthday Count', value: inlineCode(birthdayCount.toString()), inline: true }
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
			autoArchiveDuration: ThreadAutoArchiveDuration.OneHour
		});
		const reportFile = new AttachmentBuilder(Buffer.from(reportContent), {
			name: `${embedTitle}.json`,
			description: 'Scheduler Report File'
		});

		if (!schedulerLogThread) {
			if (schedulerReportMessage?.channel && isTextBasedChannel(schedulerReportMessage.channel)) {
				return schedulerReportMessage.channel.send("Couldn't create a thread!");
			}
			return container.logger.error("Couldn't create a thread and unable to send a message to the channel.");
		}

		const embed = new DefaultEmbedBuilder()
			.setTitle(embedTitle)
			.setDescription(`Guilds:\n${codeBlock(guildIdsString.slice(0, 1900))}`);

		await schedulerLogThread.send({ embeds: [embed] });

		return schedulerLogThread.send({
			files: [reportFile]
		});

		function sendReport() {
			const channel = container.client.channels.cache.get(BOT_ADMIN_LOG);
			if (!isTextBasedChannel(channel)) {
				return container.logger.error('[BirthdayTask] Admin log channel not found');
			}

			const embed = new DefaultEmbedBuilder()
				.setTitle(embedTitle)
				.setDescription(embedDescription)
				.addFields(embedFields);

			return channel.send({ embeds: [embed] });
		}
	}
}
