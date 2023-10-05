import { TimezoneWithLocale, formatDateWithMonthAndDay } from '#utils/common/index';
import { Emojis } from '#utils/constants';
import { defaultEmbed } from '#utils/embed';
import { IMG_CAKE } from '#utils/environment';
import { getSettings } from '#utils/functions/guilds';
import { floatPromise } from '#utils/functions/promises';
import { CollectionConstructor } from '@discordjs/collection';
import { Birthday, Guild, Prisma } from '@prisma/client';
import { AsyncQueue } from '@sapphire/async-queue';
import { canSendEmbeds, isGuildBasedChannel } from '@sapphire/discord.js-utilities';
import { container } from '@sapphire/framework';
import { Time } from '@sapphire/time-utilities';
import { cast, isNullish } from '@sapphire/utilities';
import dayjs from 'dayjs';
import {
	Collection,
	EmbedBuilder,
	Guild as GuildDiscord,
	GuildMember,
	MessageCreateOptions,
	roleMention,
	userMention,
} from 'discord.js';

enum CacheActions {
	None,
	Fetch,
	Insert,
}

export class BirthdaysManager extends Collection<string, Birthday> {
	/**
	 * The Guild instance that manages this manager
	 */
	public guild: GuildDiscord;

	private annoncementQueue = new AsyncQueue();

	/**
	 * The current case count
	 */
	private _count: number | null = null;

	/**
	 * The timer that sweeps this manager's entries
	 */
	private _timer: NodeJS.Timeout | null = null;

	public constructor(guild: GuildDiscord) {
		super();
		this.guild = guild;
	}

	public currentDate(format?: boolean) {
		return dayjs()
			.tz(TimezoneWithLocale[this.guild.preferredLocale])
			.format(format ? ' YYYY-MM-DD' : '');
	}

	public async findTodayBirthday() {
		const contains = formatDateWithMonthAndDay(this.currentDate(true));
		await this.fetch();
		return this.filter(({ birthday }) => birthday.includes(contains)).toJSON();
	}

	public async announcedTodayBirthday() {
		const birthdays = await this.findTodayBirthday();

		for (const birthday of birthdays) floatPromise(this.announcedBirthday(birthday));
	}

	public async announcedBirthday(birthday: Birthday) {
		await this.annoncementQueue.wait();
		try {
			const settings = await getSettings(this.guild).fetch();
			const member = await this.guild.members.fetch(birthday.userId);
			const options = this.createOptionsMessageForAnnoncementChannel(settings, member);
			await this.announceBirthdayInChannel(options, member);
			await this.addCurrentBirthdayChildRole(settings, member);
		} finally {
			this.annoncementQueue.shift();
		}
	}

	public sortBirthdayWithMonthAndDay(birthdays: Birthday[]) {
		return birthdays.sort((firstBirthday, secondBirthday) => {
			const firstBirthdayDate = dayjs(firstBirthday.birthday);
			const secondBirthdayDate = dayjs(secondBirthday.birthday);

			return firstBirthdayDate.month() === secondBirthdayDate.month()
				? firstBirthdayDate.date() - secondBirthdayDate.date()
				: firstBirthdayDate.month() - secondBirthdayDate.month();
		});
	}

	public async create(data: Omit<Prisma.BirthdayUncheckedCreateInput, 'guildId'>): Promise<Birthday> {
		const guild = await container.prisma.birthday.create({ data: { ...data, guildId: this.guild.id } });
		return guild;
	}

	public async fetch(id?: string): Promise<Birthday>;
	public async fetch(id?: string[]): Promise<Collection<string, Birthday>>;
	public async fetch(id?: null): Promise<this>;
	public async fetch(id?: string | string[] | null): Promise<Birthday | Collection<string, Birthday> | this | null> {
		if (Array.isArray(id)) {
			return this._cache(
				await container.prisma.birthday.findMany({ where: { guildId: this.guild.id, userId: { in: id } } }),
				CacheActions.None,
			);
		}

		if (super.size !== this._count && id) {
			this._cache(
				await container.prisma.birthday.findMany({ where: { guildId: this.guild.id } }),
				CacheActions.Fetch,
			);
		}

		return this;
	}

	public insert(data: Birthday): Birthday;
	public insert(data: Birthday[]): Collection<string, Birthday>;
	public insert(data: Birthday | Birthday[]) {
		// @ts-expect-error TypeScript does not read the overloaded `data` parameter correctly
		return this._cache(data, CacheActions.Insert);
	}

	private _cache(entry: Birthday, type: CacheActions): Birthday;
	private _cache(entries: Birthday[], type?: CacheActions): Collection<string, Birthday>;
	private _cache(entries?: null, type?: CacheActions): null;
	private _cache(entries?: Birthday | Birthday[] | null, type?: CacheActions) {
		if (!entries) return null;

		const parsedEntries = Array.isArray(entries) ? entries : [entries];

		for (const entry of parsedEntries) {
			super.set(entry.userId, entry);
		}
		if (type === CacheActions.Insert) this._count! += parsedEntries.length;

		if (!this._timer) {
			this._timer = setInterval(() => {
				super.sweep(() => Date.now() > Date.now() + Time.Minute * 15);
				if (!super.size) this._timer = null;
			}, 1000);
		}

		if (Array.isArray(entries)) {
			return new Collection<string, Birthday>(entries.map((entry) => [entry.userId, entry]));
		}
		return entries;
	}

	public static get [Symbol.species]() {
		return cast<CollectionConstructor>(Collection);
	}

	private formatBirthdayMessage(message: string, member: GuildMember, guild: GuildDiscord) {
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

	private createOptionsMessageForAnnoncementChannel(
		{ announcementMessage, birthdayPingRole }: Guild,
		member: GuildMember,
	): MessageCreateOptions {
		const embed = new EmbedBuilder(defaultEmbed())
			.setTitle(`${Emojis.News} Birthday Announcement!`)
			.setDescription(this.formatBirthdayMessage(announcementMessage, member, this.guild))
			.setThumbnail(IMG_CAKE);

		return { content: birthdayPingRole ? roleMention(birthdayPingRole) : '', embeds: [embed] };
	}

	private async announceBirthdayInChannel(options: MessageCreateOptions, member: GuildMember) {
		const { announcementChannel } = await getSettings(this.guild).fetch();

		if (isNullish(announcementChannel)) {
			return container.logger.info(
				`Announcement channel is empty, so i can't announce the anniversary of ${member.displayName}`,
			);
		}

		try {
			const channel = await this.guild.channels.fetch(announcementChannel);

			if (!channel) {
				return container.logger.error(`Announcement channel (${announcementChannel}) does not exist.`);
			}

			if (isGuildBasedChannel(channel) && canSendEmbeds(channel)) {
				const message = await channel.send(options);
				container.logger.info(
					`Birthday message for [${member.id}]${member.displayName} sent in channel ${message.channelId}.`,
				);
			} else {
				container.logger.warn(`Cannot send a message with embeds in channel ${channel.id}.`);
			}
		} catch (error) {
			container.logger.error(
				`Error while announcing birthday for [${member.id}] ${member.displayName}: ${error}`,
			);
		}
	}

	private async addCurrentBirthdayChildRole(guild: Guild, member: GuildMember) {
		const { birthdayRole } = guild;

		if (isNullish(birthdayRole)) {
			container.logger.info(`Birthday role is empty, so i can't`);
			return;
		}

		try {
			if (member.roles.cache.has(birthdayRole)) {
				container.logger.info(`The user already has the role, so i can't `);
			}

			await member.roles.add(birthdayRole);
			container.logger.info(`The Birthday Role ${birthdayRole} has been added to the member ${member.id} `);
		} finally {
			floatPromise(this.addRemoveBirthdayRoleTask(member, guild, birthdayRole));
		}
	}

	private async addRemoveBirthdayRoleTask(member: GuildMember, guild: Guild, roleId: string) {
		return container.tasks.create('BirthdayRoleRemoverTask', {
			memberId: member.id,
			guildId: guild.guildId,
			roleId,
		});
	}
}
