import { ApplyOptions } from '@sapphire/decorators';
import { container } from '@sapphire/pieces';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import { Time } from '@sapphire/timestamp';
import { APIEmbed, EmbedData, Guild, GuildMember, Role, roleMention, userMention } from 'discord.js';
import generateEmbed from '../helpers/generate/embed';
import { getConfig, logAll } from '../helpers/provide/config';
import { getCurrentOffset } from '../helpers/provide/currentOffset';
import { APP_ENV, DEBUG, IMG_CAKE, NEWS } from '../helpers/provide/environment';
import { getBirthdaysByDateAndTimezone } from '../lib/birthday/birthday';
import { sendMessage } from '../lib/discord/message';
import type { BirthdayWithUserModel } from '../lib/model';
import type { EmbedInformationModel } from '../lib/model/EmbedInformation.model';

@ApplyOptions<ScheduledTask.Options>({ name: 'BirthdayReminderTask', pattern: '0 * * * *' })
export class BirthdayReminderTask extends ScheduledTask {
	public async run() {
		const { date: today, offsetString: offset } = await getCurrentOffset();
		let todaysBirthdays: BirthdayWithUserModel[] = []
		if (APP_ENV === 'prd') {
			const { birthdays } = await getBirthdaysByDateAndTimezone(today, offset);
			todaysBirthdays = birthdays;
		}

		if (DEBUG) this.container.logger.info(`[BirthdayTask] Birthdays today: ${todaysBirthdays.length}, date: ${today}, offset: ${offset}`);

		if (!todaysBirthdays.length) return this.container.logger.info(`[Task] No Birthdays Today. Date: ${today}, offset: ${offset}`);

		for (const birthday of todaysBirthdays) {
			if (DEBUG) this.container.logger.info(`[BirthdayTask] Birthday loop: ${birthday.id}`);
			await this.birthdayEvent(birthday.user_id, birthday.guild_id, false);
		}
	}

	public async birthdayEvent(userID: string, guildID: string, isTest: boolean) {
		const guild = this.container.client.guilds.cache.get(guildID) ?? await this.container.client.guilds.fetch(guildID);
		const member = guild.members.cache.get(userID) ?? await guild.members.fetch(userID);

		const config = await getConfig(guild.id);
		const { ANNOUNCEMENT_CHANNEL, BIRTHDAY_ROLE, BIRTHDAY_PING_ROLE, ANNOUNCEMENT_MESSAGE } = config;

		await logAll(config);

		if (BIRTHDAY_ROLE) {
			const role = guild.roles.cache.get(BIRTHDAY_ROLE) && await guild.roles.fetch(BIRTHDAY_ROLE);
			if (!role) return { error: true, message: 'Birthday role not found' };
			await this.addCurrentBirthdayChildRole({ member, guild, role, isTest });
		}

		const announcementMessage = await this.formatBirthdayMessage(ANNOUNCEMENT_MESSAGE, member, guild);

		if (!ANNOUNCEMENT_CHANNEL) return { error: true, message: 'No announcement channel set' }

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
