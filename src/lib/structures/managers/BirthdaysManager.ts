import { formatDateForDisplay, parseInputDate } from '#core/services/date';
import { DefaultEmbedBuilder } from '#lib/discord';
import { SettingsManager } from '#lib/structures/managers';
import { DEFAULT_ANNOUNCEMENT_MESSAGE } from '#root/config';
import { formatBirthdayMessage } from '#utils/common/index';
import { CdnUrls, ClientColor, Emojis } from '#utils/constants';
import { interactionSuccess } from '#utils/embed';
import { isProduction } from '#utils/env';
import { Prisma, type Birthday, type Guild as Settings } from '@prisma/client';
import {
	PaginatedFieldMessageEmbed,
	canSendEmbeds,
	isGuildBasedChannel,
	type GuildTextBasedChannelTypes
} from '@sapphire/discord.js-utilities';
import { Time } from '@sapphire/duration';
import { container } from '@sapphire/framework';
import { resolveKey, type TOptions } from '@sapphire/plugin-i18next';
import { chunk, isNullOrUndefinedOrEmpty, isNullish } from '@sapphire/utilities';
import dayjs from 'dayjs';
import {
	ChatInputCommandInteraction,
	Collection,
	EmbedBuilder,
	Guild,
	GuildMember,
	Message,
	Role,
	roleMention,
	userMention,
	type MessageCreateOptions,
	type MessageEditOptions
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

	/**
	 * Retrieves the current date in the specified timezone.
	 * @returns The current date.
	 */
	public async getCurrentDate() {
		const { timezone } = await this.settings.fetch();
		return dayjs().tz(timezone);
	}

	/**
	 * Finds birthdays that occur today.
	 * @returns An array of birthdays that occur today.
	 */
	public async findTodayBirthday() {
		const contains = (await this.getCurrentDate()).format('MM-DD');
		await this.fetch();
		return this.filter(({ birthday }) => birthday.includes(contains)).toJSON();
	}

	/**
	 * Retrieves and yields the birthdays that are announced today.
	 * @returns An asynchronous generator that yields the announced birthdays.
	 */
	public async *announcedTodayBirthday() {
		for (const birthday of await this.findTodayBirthday()) {
			yield this.announcedBirthday(birthday);
		}
	}

	/**
	 * Finds birthdays with the specified month.
	 * @param month - The month to search for birthdays.
	 * @returns An array of birthdays with the specified month.
	 */
	public findBirthdayWithMonth(month: number) {
		return this.filter(({ birthday }) => parseInputDate(birthday).getMonth() === month).toJSON();
	}

	/**
	 * Finds the next 10 teen birthdays.
	 * @returns An array of teen birthdays sorted by month and day.
	 */
	public findTeenNextBirthday() {
		return this.sortBirthdaysByMonthAndDay(this.toJSON()).slice(0, 10);
	}

	/**
	 * Generates a default birthday list embed.
	 * @param includeImage - Whether to include an image in the embed. Defaults to true.
	 * @returns The generated embed.
	 */
	public generateDefaultBirthdayListEmbed(includeImage: boolean = true) {
		const t = container.i18n.getT(this.guild.preferredLocale);
		return new EmbedBuilder()
			.setTitle(t('commands/birthday:list.embedList.title'))
			.setColor(ClientColor)
			.setThumbnail(includeImage ? CdnUrls.Cake : null)
			.setFooter({ text: t('commands/birthday:list.embedList.footer') });
	}

	/**
	 * Sends a list of birthdays.
	 * @param interaction - The interaction or message object.
	 * @param birthdays - An array of Birthday objects.
	 * @param key - The key used to resolve the title field of the embed.
	 * @param options - Additional options for resolving the key and description.
	 * @returns A Promise that resolves to the edited message or reply interaction.
	 */
	public async sendPaginatedBirthdays(
		interaction: ChatInputCommandInteraction | Message,
		birthdays: Birthday[],
		key: string,
		options?: TOptions
	) {
		const defaultEmbed = this.generateDefaultBirthdayListEmbed();

		if (isNullOrUndefinedOrEmpty(birthdays)) {
			const description = await resolveKey(interaction, key, { ...options, context: 'empty' });
			const messageOptions: MessageEditOptions = {
				embeds: [defaultEmbed.setDescription(description).toJSON()]
			};

			return interaction instanceof Message
				? interaction.edit(messageOptions)
				: interaction.reply(interactionSuccess(description));
		}

		const paginatedBirthdays = new PaginatedFieldMessageEmbed<Birthday>()
			.setTemplate(defaultEmbed.toJSON())
			.setTitleField(await resolveKey(interaction, key, options))
			.setItems(this.sortBirthdaysByMonthAndDay(birthdays))
			.formatItems(this.formatBirthdayItem)
			.setItemsPerPage(20);
		return paginatedBirthdays.make().run(interaction);
	}

	/**
	 * Announces a birthday by sending a message in the announcement channel and adding a role to the member.
	 * @param birthday - The birthday to be announced.
	 * @returns A promise that resolves when the birthday has been announced.
	 */
	public async announcedBirthday(birthday: Birthday): Promise<[Message<boolean> | null, Role | null]> {
		const member = this.guild.members.resolve(birthday.userId);
		if (!member) return [null, null];

		return Promise.all([
			this.announceBirthdayInChannel(
				this.createOptionsMessageForAnnouncementChannel(await this.settings.fetch(), member)
			),
			this.addCurrentBirthdayChildRole(await this.settings.fetch(), member)
		]);
	}

	/**
	 * Sorts an array of birthdays by month and day.
	 * @param birthdays - The array of birthdays to be sorted.
	 * @returns The sorted array of birthdays.
	 */
	public sortBirthdaysByMonthAndDay(birthdays: Birthday[]) {
		return birthdays.sort((firstBirthday, secondBirthday) => {
			const firstBirthdayDate = dayjs(firstBirthday.birthday);
			const secondBirthdayDate = dayjs(secondBirthday.birthday);

			return firstBirthdayDate.month() === secondBirthdayDate.month()
				? firstBirthdayDate.date() - secondBirthdayDate.date()
				: firstBirthdayDate.month() - secondBirthdayDate.month();
		});
	}

	/**
	 * Upserts a birthday record in the database.
	 * If a record with the same `userId` and `guildId` already exists, it updates the record.
	 * Otherwise, it creates a new record.
	 *
	 * @param args - The data for the birthday record to upsert.
	 * @returns The upserted birthday record, or `null` if an error occurred.
	 */
	public async upsert(args: Omit<Prisma.BirthdayUncheckedCreateInput, 'guildId'>): Promise<Birthday | null> {
		try {
			const birthday = await container.prisma.birthday.upsert({
				where: {
					userId_guildId: {
						guildId: this.guildId,
						userId: args.userId
					}
				},
				update: args,
				create: {
					...args,
					guildId: this.guildId
				}
			});
			await this.updateBirthdayOverview();
			return this._cache(birthday, CacheActions.Insert);
		} catch (error) {
			container.logger.error(error);
			return null;
		}
	}

	/**
	 * Removes a birthday record for the specified user.
	 *
	 * @param userId - The ID of the user whose birthday record should be removed.
	 * @returns A boolean indicating whether the removal was successful.
	 */
	public async remove(userId: string) {
		try {
			try {
				const birthday = await container.prisma.birthday.delete({
					where: {
						userId_guildId: {
							guildId: this.guildId,
							userId
						}
					}
				});
				await this.updateBirthdayOverview();
				return birthday;
			} finally {
				super.delete(userId);
			}
		} catch {
			return null;
		}
	}

	/**
	 * Fetches a birthday or a collection of birthdays from the database.
	 *
	 * @param id - The ID(s) of the birthday(s) to fetch. Can be a single ID or an array of IDs.
	 * @returns A Promise that resolves to a Birthday object, a Collection of Birthday objects, or null if no birthday is found.
	 */
	public async fetch(id?: string): Promise<Birthday>;
	public async fetch(id?: string[] | null): Promise<Collection<string, Birthday> | null>;
	public async fetch(id?: string | string[] | null): Promise<Birthday | Collection<string, Birthday> | null> {
		if (Array.isArray(id)) {
			return this._cache(
				await container.prisma.birthday.findMany({ where: { guildId: this.guildId, userId: { in: id } } }),
				CacheActions.None
			);
		}

		if (typeof id === 'string') {
			return this._cache(
				await container.prisma.birthday.findUniqueOrThrow({
					where: {
						userId_guildId: {
							guildId: this.guildId,
							userId: id
						}
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

	/**
	 * Caches the provided entries in the BirthdaysManager.
	 *
	 * @param entries - The entries to be cached. Can be a single entry, an array of entries, or null.
	 * @param type - The type of cache action. Defaults to undefined.
	 * @returns The cached entries or null if no entries were provided.
	 */
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

	/**
	 * Fetches the overview message from the specified channel.
	 *
	 * @param channel - The channel to fetch the message from.
	 * @param overviewMessage - The ID of the overview message to fetch.
	 * @returns A promise that resolves to the fetched message, or null if the message is not found.
	 */
	private async fetchOverviewMessage(
		channel: GuildTextBasedChannelTypes,
		overviewMessage: string
	): Promise<Message<boolean> | null> {
		return channel.messages.fetch(overviewMessage).catch(() => null);
	}

	/**
	 * Creates a message with options for the announcement channel.
	 *
	 * @param settings - The settings object containing the announcement message and birthday ping role.
	 * @param member - The guild member for whom the birthday announcement is being created.
	 * @returns The message options object with content and embeds.
	 */
	private createOptionsMessageForAnnouncementChannel(settings: Settings, member: GuildMember): MessageCreateOptions {
		const { announcementMessage, birthdayPingRole } = settings;

		const description = announcementMessage ?? DEFAULT_ANNOUNCEMENT_MESSAGE;
		const embed = new DefaultEmbedBuilder()
			.setTitle(`${Emojis.News} Birthday Announcement!`)
			.setDescription(formatBirthdayMessage(description, member))
			.setThumbnail(CdnUrls.Cake);

		if (birthdayPingRole) return { content: roleMention(birthdayPingRole), embeds: [embed.toJSON()] };

		return { embeds: [embed.toJSON()] };
	}

	/**
	 * Announces a birthday in the specified channel.
	 *
	 * @param options - The options for the message to be sent.
	 * @returns A Promise that resolves to the sent message, or null if the announcement channel is not set or invalid.
	 */
	private async announceBirthdayInChannel(options: MessageCreateOptions) {
		const { announcementChannel } = await this.settings.fetch();
		if (isNullish(announcementChannel)) return null;

		const channel = await this.guild.channels.fetch(announcementChannel);
		if (!isGuildBasedChannel(channel) || !canSendEmbeds(channel)) return null;

		return channel.send(options);
	}

	/**
	 * Adds the current birthday child role to a member.
	 * @param {Settings} guild - The guild settings.
	 * @param {GuildMember} member - The member to add the role to.
	 * @returns {Promise<string | null>} A promise that resolves to a string indicating the result of the operation.
	 */
	private async addCurrentBirthdayChildRole(guild: Settings, member: GuildMember): Promise<Role | null> {
		const { birthdayRole } = guild;

		if (isNullish(birthdayRole)) return null;
		const role = await this.guild.roles.fetch(birthdayRole);
		if (!role) return null;

		await member.roles.add(role);
		return role;
	}

	/**
	 * Updates the birthday overview by sending a new message or editing the existing one.
	 * @returns The updated or newly created message.
	 */
	private async updateBirthdayOverview(): Promise<Message<boolean> | null> {
		const settings = await this.settings.fetch();

		const { overviewChannel, overviewMessage } = settings;
		const options = { embeds: await this.generatePaginatedBirthdayList() };

		if (isNullish(overviewChannel)) return null;

		const channel = await container.client.channels.fetch(overviewChannel).catch(() => null);

		if (isNullish(channel) || !isGuildBasedChannel(channel)) return null;

		const message = overviewMessage ? await this.fetchOverviewMessage(channel, overviewMessage) : null;

		container.logger.info(`Updated Overview Message in guild: ${this.guildId}`);
		container.logger.debug(message);

		if (message) return message.edit(options);
		const newMessage = await channel.send(options);

		await container.prisma.guild.update({
			where: { id: this.guildId },
			data: {
				overviewMessage: newMessage.id
			}
		});

		return newMessage;
	}

	/**
	 * Formats a birthday item into a string representation.
	 * @param birthday - The birthday object to format.
	 * @returns The formatted string representation of the birthday item.
	 */
	private formatBirthdayItem = async (birthday: Birthday) => {
		// example: @Swiizyy#0001 - 30. november 2002 (21 years) :cake_birthdayy:
		const date = dayjs(birthday.birthday.replaceAll(/-/g, '/'));
		const age = dayjs().diff(date, 'year');
		const formattedDate = formatDateForDisplay(birthday.birthday);
		const ageText = age === 1 ? 'year' : 'years';
		const ageFormatted = `${age} ${ageText}`;
		const emoji = date.isSame(await this.getCurrentDate(), 'date') ? Emojis.Cake : '';
		const text = `${userMention(birthday.userId)} - ${formattedDate} (${ageFormatted}) ${emoji}`;
		return text;
	};

	/**
	 * Generates a paginated list of birthdays as an array of EmbedBuilders.
	 * @param pageId - The page number of the generated list (default: 0).
	 * @returns A promise that resolves to an array of EmbedBuilders representing the paginated birthday list.
	 */
	private async generatePaginatedBirthdayList(pageId: number = 0): Promise<EmbedBuilder[]> {
		const birthdaysList = await container.prisma.birthday.findMany({ where: { guildId: this.guildId } });

		if (isNullOrUndefinedOrEmpty(birthdaysList)) return [this.createEmptyPaginatedBirthdayListEmbed()];

		const sortedBirthdays = this.sortBirthdaysByMonthAndDay(birthdaysList);

		const descriptionText = sortedBirthdays
			.filter(async (birthday) => {
				const member = await this.guild.members.fetch(birthday.userId).catch(() => null);

				if (member) return true;

				if (isProduction) await this.remove(birthday.userId);
				return false;
			})
			.map((b) => this.formatBirthdayItem(b))
			.join('\n');

		const textChunks = this.splitTextIntoChunks(descriptionText, 2000);

		const paginatedEmbeds = textChunks.map((chunk) =>
			new DefaultEmbedBuilder() //
				.setTitle(`${Emojis.Cake} Paginated Birthday List`)
				.setFooter({ text: `Page ${pageId + 1} of ${textChunks.length}` })
				.setDescription(chunk)
				.setThumbnail(CdnUrls.Cake)
		);

		return paginatedEmbeds;
	}

	/**
	 * Splits the given text into chunks of the specified size.
	 *
	 * @param text - The text to be split into chunks.
	 * @param chunkSize - The size of each chunk.
	 * @returns An array of chunks, where each chunk is a string.
	 */
	private splitTextIntoChunks(text: string, chunkSize: number) {
		const chunks = chunk(text.split('\n'), chunkSize);
		return chunks.map((chunk) => chunk.join('\n'));
	}

	/**
	 * Creates an empty paginated birthday list embed.
	 *
	 * @returns The created embed.
	 */
	private createEmptyPaginatedBirthdayListEmbed() {
		const embed = new DefaultEmbedBuilder()
			.setTitle(`Birthday List - ${this.guild.name ?? 'Unknown Guild'}`)
			.setDescription(`${Emojis.ArrowRight}Set your Birthday with\n\`/birthday set <day> <month> [year]\``)
			.setThumbnail(CdnUrls.Cake);

		return embed;
	}
}
