import { SettingsManager } from '#lib/structures/managers';
import { generateBirthdayList } from '#utils/birthday/birthday';
import { TimezoneWithLocale, formatBirthdayMessage, formatDateForDisplay, parseInputDate } from '#utils/common/index';
import { CdnUrls, ClientColor, Emojis, PrismaErrorCodeEnum } from '#utils/constants';
import { defaultEmbed, interactionSuccess } from '#utils/embed';
import { DEFAULT_ANNOUNCEMENT_MESSAGE } from '#utils/environment';
import { floatPromise, resolveOnErrorCodesPrisma } from '#utils/functions/promises';
import { type Birthday, Prisma, type Guild as Settings } from '@prisma/client';
import { AsyncQueue } from '@sapphire/async-queue';
import {
	type GuildTextBasedChannelTypes,
	PaginatedFieldMessageEmbed,
	canSendEmbeds,
	isGuildBasedChannel
} from '@sapphire/discord.js-utilities';
import { Time } from '@sapphire/duration';
import { container } from '@sapphire/framework';
import { type TOptions, resolveKey } from '@sapphire/plugin-i18next';
import { isNullOrUndefinedOrEmpty, isNullish } from '@sapphire/utilities';
import dayjs from 'dayjs';
import {
	type APIEmbed,
	ChatInputCommandInteraction,
	Collection,
	EmbedBuilder,
	Guild,
	GuildMember,
	Message,
	type MessageCreateOptions,
	type MessageEditOptions,
	roleMention,
	userMention
} from 'discord.js';

enum CacheActions {
	None,
	Fetch,
	Insert
}

export class BirthdaysManager extends Collection<string, Birthday> {
	public guildId: string;

	/**
	 * The Guild instance that manages this manager
	 */
	public guild: Guild;

	public settings: SettingsManager;

	private announcementQueue = new AsyncQueue();

	/**
	 * The current case count
	 */
	private _count: number | null = null;

	/**
	 * The timer that sweeps this manager's entries
	 */
	private _timer: NodeJS.Timeout | null = null;

	public constructor(guild: Guild, settings: SettingsManager) {
		super();
		this.guild = guild;
		this.guildId = guild.id;
		this.settings = settings;
	}

	public currentDate() {
		const date = dayjs().tz(TimezoneWithLocale[this.guild.preferredLocale]);
		return date;
	}

	public async findTodayBirthday() {
		const contains = this.currentDate().format('MM-DD');
		await this.fetch();
		return this.filter(({ birthday }) => birthday.includes(contains)).toJSON();
	}

	public async *announcedTodayBirthday() {
		for (const birthday of await this.findTodayBirthday()) {
			yield this.announcedBirthday(birthday);
		}
	}

	public findBirthdayWithMonth(month: number) {
		return this.filter(({ birthday }) => parseInputDate(birthday).getMonth() === month).toJSON();
	}

	public findTeenNextBirthday() {
		return this.sortBirthdayWithMonthAndDay(this.toJSON()).slice(0, 10);
	}

	public async defaultBirthdayListEmbed(img: boolean = true) {
		const translateEmbed = (await resolveKey(this.guild, 'commands/birthday:list.embedList', {
			returnObjects: true
		})) satisfies APIEmbed;

		const embed = new EmbedBuilder(translateEmbed).setColor(ClientColor);

		return img ? embed : embed.setThumbnail(null);
	}

	public async sendListBirthdays(
		interaction: ChatInputCommandInteraction | Message,
		birthdays: Birthday[],
		key: string,
		options?: TOptions
	) {
		const embed = await this.defaultBirthdayListEmbed();

		if (isNullOrUndefinedOrEmpty(birthdays)) {
			const description = await resolveKey(interaction, key, { ...options, context: 'empty' });
			const messageOptions: MessageEditOptions = {
				embeds: [embed.setDescription(description)]
			};

			return interaction instanceof Message
				? interaction.edit(messageOptions)
				: interaction.reply(interactionSuccess(description));
		}

		const paginatedBirthdays = new PaginatedFieldMessageEmbed<Birthday>()
			.setTemplate(await this.defaultBirthdayListEmbed())
			.setTitleField(await resolveKey(interaction, key, options))
			.setItems(this.sortBirthdayWithMonthAndDay(birthdays))
			.formatItems(this.formatItems)
			.setItemsPerPage(20);
		return paginatedBirthdays.make().run(interaction);
	}

	public async announcedBirthday(birthday: Birthday) {
		if (isNullish(birthday)) return;
		const member = this.guild.members.resolve(birthday.userId);
		if (!member) return;

		const options = this.createOptionsMessageForAnnouncementChannel(await this.settings.fetch(), member);
		const message = await this.announceBirthdayInChannel(options, member);
		const role = await this.addCurrentBirthdayChildRole(await this.settings.fetch(), member);

		this.announcementQueue.shift();
		return { message, role };
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

	public async create(args: Omit<Prisma.BirthdayUncheckedCreateInput, 'guildId'>): Promise<Birthday> {
		const birthday = await container.prisma.birthday.upsert({
			where: { userId_guildId: { guildId: this.guildId, userId: args.userId } },
			create: { ...args, guildId: this.guildId },
			update: args
		});
		await this.updateBirthdayOverview();
		return this._cache(birthday, CacheActions.Insert);
	}

	public async remove(userId: string) {
		const birthday = await resolveOnErrorCodesPrisma(
			container.prisma.birthday.delete({
				where: {
					userId_guildId: {
						guildId: this.guildId,
						userId
					}
				}
			}),
			PrismaErrorCodeEnum.NotFound
		);

		if (isNullish(birthday)) return false;

		await this.updateBirthdayOverview();
		return super.delete(userId);
	}

	public async fetch(id?: string): Promise<Birthday>;
	public async fetch(id?: string[]): Promise<Collection<string, Birthday>>;
	public async fetch(id?: null): Promise<this>;
	public async fetch(id?: string | string[] | null): Promise<Birthday | Collection<string, Birthday> | this | null> {
		if (Array.isArray(id)) {
			return this._cache(
				await container.prisma.birthday.findMany({ where: { guildId: this.guildId, userId: { in: id } } }),
				CacheActions.None
			);
		}

		if (typeof id === 'string') {
			return this._cache(
				await container.prisma.birthday.findFirstOrThrow({
					where: {
						guildId: this.guildId,
						userId: id
					}
				}),
				CacheActions.None
			);
		}

		if (super.size !== this._count && id) {
			this._cache(
				await container.prisma.birthday.findMany({ where: { guildId: this.guildId, userId: id } }),
				CacheActions.Fetch
			);
		}

		this._cache(await container.prisma.birthday.findMany({ where: { guildId: this.guildId } }), CacheActions.Fetch);

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

	private async fetchOverviewMessage(
		channel: GuildTextBasedChannelTypes,
		overviewMessage: string
	): Promise<Message<boolean> | null> {
		return channel.messages.fetch(overviewMessage);
	}

	private createOptionsMessageForAnnouncementChannel(
		{ announcementMessage, birthdayPingRole }: Settings,
		member: GuildMember
	): MessageCreateOptions {
		const message = announcementMessage ?? DEFAULT_ANNOUNCEMENT_MESSAGE;
		const embed = new EmbedBuilder(defaultEmbed())
			.setTitle(`${Emojis.News} Birthday Announcement!`)
			.setDescription(formatBirthdayMessage(message, member))
			.setThumbnail(CdnUrls.Cake);

		return { content: birthdayPingRole ? roleMention(birthdayPingRole) : '', embeds: [embed] };
	}

	private async announceBirthdayInChannel(options: MessageCreateOptions, member: GuildMember) {
		const { announcementChannel } = await this.settings.fetch();
		if (isNullish(announcementChannel)) {
			return `Announcement channel is empty, so i can't announce the anniversary of ${member.displayName}`;
		}

		try {
			const channel = await this.guild.channels.fetch(announcementChannel);

			if (!channel) {
				return `Announcement channel (${announcementChannel}) does not exist.`;
			}

			if (isGuildBasedChannel(channel) && canSendEmbeds(channel)) {
				const message = await channel.send(options);
				return `This Birthday has been announced in the [message](${message.url}).`;
			}

			return `Cannot send a message with embeds in channel ${channel.id}.`;
		} catch (error) {
			return `Error while announcing birthday for [${member.id}] ${member.displayName}: ${error}`;
		}
	}

	private async addCurrentBirthdayChildRole(guild: Settings, member: GuildMember) {
		const { birthdayRole } = guild;

		if (isNullish(birthdayRole)) return `Birthday role for ths member is empty, so i can't`;

		if (member.roles.cache.has(birthdayRole)) return `The user already has the role, so i can't `;

		if (member.manageable) {
			try {
				await member.roles.add(birthdayRole);
				return `The Birthday Role ${birthdayRole} has been added to the member ${member.id}`;
			} catch {
				return 'An error occurred when adding the role to this member ';
			} finally {
				floatPromise(
					container.tasks.create('BirthdayRoleRemoverTask', {
						memberId: member.id,
						guildId: member.guild.id,
						birthdayRole
					})
				);
			}
		}

		return `I cannot modify this member because his position is equal or superior to me. `;
	}

	private async updateBirthdayOverview() {
		const settings = await this.settings.fetch();

		const { overviewChannel, overviewMessage } = settings;
		const birthdayList = await generateBirthdayList(1, this.guild);

		if (isNullish(overviewChannel)) return null;

		const options = { ...birthdayList.components, embeds: [birthdayList.embed] };

		const channel = await container.client.channels.fetch(overviewChannel).catch(() => null);

		if (isNullish(channel) || !isGuildBasedChannel(channel)) return null;

		const message = overviewMessage ? await this.fetchOverviewMessage(channel, overviewMessage) : null;

		container.logger.info(`Updated Overview Message in guild: ${this.guildId}`);
		container.logger.debug(message);

		if (message) return message.edit(options);

		return channel.send(options);
	}

	private formatItems = (birthday: Birthday) => {
		// example: @Swiizyy#0001 - 30. november 2002 (21 years) :cake_birthdayy:
		const date = dayjs(birthday.birthday.replaceAll(/-/g, '/'));
		const age = dayjs().diff(date, 'year');
		const formattedDate = formatDateForDisplay(birthday.birthday);
		const ageText = age === 1 ? 'year' : 'years';
		const ageFormatted = `${age} ${ageText}`;
		const emoji = date.isSame(this.currentDate(), 'date') ? Emojis.Cake : '';
		const text = `${userMention(birthday.userId)} - ${formattedDate} (${ageFormatted}) ${emoji}`;
		return text;
	};
}
