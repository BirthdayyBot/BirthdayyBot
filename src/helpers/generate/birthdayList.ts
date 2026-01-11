import type { Birthday } from '.prisma/client';
import { EmbedLimits, PaginatedMessage } from '@sapphire/discord.js-utilities';
import { container } from '@sapphire/pieces';
import { isNullOrUndefinedOrEmpty } from '@sapphire/utilities';
import dayjs from 'dayjs';
import { ButtonStyle, EmbedBuilder, Guild, userMention, type APIEmbed } from 'discord.js';
import { GuildIDEnum } from '../../lib/enum/GuildID.enum';
import { generateDefaultEmbed } from '../../lib/utils/embed';
import { ARROW_LEFT, ARROW_RIGHT, BOT_COLOR, CAKE, FAIL, IMG_CAKE } from '../provide/environment';
import { formatDateForDisplay, numberToMonthName } from '../utils/date';
import { envParseNumber } from '@skyra/env-utilities';

/**
 * Generate a PaginatedMessage for interactive birthday list
 * Use this for slash commands where users can navigate between pages
 */
export async function generateBirthdayList(guild: Guild) {
	const birthdays = await container.prisma.birthday.findMany({ where: { guildId: guild.id } });

	// Initialize PaginatedMessage with enhanced configuration
	const paginatedMessage = new PaginatedMessage({
		template: new EmbedBuilder().setColor(BOT_COLOR), // Set default color for all pages
		pageIndexPrefix: 'Page ', // Custom prefix for page index in footer
		embedFooterSeparator: ' • ', // Custom separator in footer
	})
		// Configure custom navigation actions with branded emojis
		.setActions([
			{
				customId: '@sapphire/paginated-messages.firstPage',
				style: ButtonStyle.Primary,
				label: 'First',
				type: 2,
				run: ({ handler }) => (handler.index = 0),
			},
			{
				customId: '@sapphire/paginated-messages.previousPage',
				style: ButtonStyle.Primary,
				emoji: ARROW_LEFT,
				type: 2,
				run: ({ handler }) => {
					if (handler.index === 0) {
						handler.index = handler.pages.length - 1;
					} else {
						--handler.index;
					}
				},
			},
			{
				customId: '@sapphire/paginated-messages.stop',
				style: ButtonStyle.Danger,
				emoji: FAIL,
				type: 2,
				run: ({ collector }) => {
					collector.stop();
				},
			},
			{
				customId: '@sapphire/paginated-messages.nextPage',
				style: ButtonStyle.Primary,
				emoji: ARROW_RIGHT,
				type: 2,
				run: ({ handler }) => {
					if (handler.index === handler.pages.length - 1) {
						handler.index = 0;
					} else {
						++handler.index;
					}
				},
			},
			{
				customId: '@sapphire/paginated-messages.goToLastPage',
				style: ButtonStyle.Primary,
				label: 'Last',
				type: 2,
				run: ({ handler }) => (handler.index = handler.pages.length - 1),
			},
		])
		// Add select menu for quick page navigation (max 25 pages due to Discord limitations)
		.setSelectMenuOptions((pageIndex) => ({
			label: `Page ${pageIndex + 1}`,
			description: `Jump to page ${pageIndex + 1}`,
		}))
		// Custom response when unauthorized user tries to interact
		.setWrongUserInteractionReply((targetUser) => ({
			content: `${ARROW_RIGHT} This birthday list was requested by ${targetUser.toString()}. Please use \`/birthday list\` to view your own paginated list.`,
			ephemeral: true,
			allowedMentions: { users: [], roles: [] },
		}));

	if (isNullOrUndefinedOrEmpty(birthdays)) {
		const emptyEmbed = await createEmbed(guild, []);
		paginatedMessage.addPageEmbed(new EmbedBuilder(generateDefaultEmbed(emptyEmbed)));
		return paginatedMessage;
	}

	// Sort all birthdays by day and month
	const sortedBirthdays = sortByDayAndMonth(birthdays);
	// Group birthdays by month
	const birthdaysByMonth = prepareBirthdays(sortedBirthdays);

	// Get the current month (0-11 in JavaScript, matching array index)
	const currentMonth = dayjs().month();
	const maxBirthdaysPerPage = envParseNumber('MAX_BIRTHDAYS_PER_PAGE', 50);

	// Create paginated pages for all months
	const monthsWithBirthdays = await createBirthdayPages(
		guild,
		birthdaysByMonth,
		maxBirthdaysPerPage,
		paginatedMessage,
	);

	// Update select menu options to show month names with emoji for better visibility
	paginatedMessage.setSelectMenuOptions((pageIndex) => {
		const monthName = monthsWithBirthdays[pageIndex];
		return {
			label: monthName ? `${CAKE} ${monthName}` : `Page ${pageIndex + 1}`,
			description: monthName ? `View ${monthName.toLowerCase()} birthdays` : `View page ${pageIndex + 1}`,
		};
	});

	// Find and set the starting page to the current month
	const { pageIndex: currentMonthPageIndex, hasBirthdays: currentMonthHasBirthdays } = findCurrentMonthPageIndex(
		birthdaysByMonth,
		currentMonth,
		maxBirthdaysPerPage,
	);
	paginatedMessage.index = currentMonthPageIndex;

	// Add a helpful note if the current month has no birthdays
	if (!currentMonthHasBirthdays) {
		addEmptyMonthNote(paginatedMessage, currentMonth, monthsWithBirthdays);
	}

	return paginatedMessage;
}

/**
 * Generate a single embed for static display (e.g., overview channel)
 * This shows all birthdays without pagination
 */
export async function generateBirthdayEmbed(guild: Guild) {
	const birthdays = await container.prisma.birthday.findMany({ where: { guildId: guild.id } });

	if (isNullOrUndefinedOrEmpty(birthdays)) {
		return generateDefaultEmbed(await createEmbed(guild, []));
	}

	const sortedBirthdays = sortByDayAndMonth(birthdays);
	const finalList = prepareBirthdays(sortedBirthdays);
	const embed = await createEmbed(guild, finalList);

	return generateDefaultEmbed(embed);
}

/**
 * Fetch guild member and handle cleanup if member is not found
 *
 * Special handling for CHILLI_ATTACK_V2 (test server with injected fake birthdays):
 * - Uses cache only (no API fetch) to avoid rate limits during pagination testing
 * - Does not delete birthdays for missing members (preserves test data integrity)
 *
 * @param guild - The guild to fetch the member from
 * @param userId - The user ID to fetch
 * @param guildIsChilliAttackV2 - Whether this is the test server with fake data
 * @returns The guild member if found, null otherwise
 */
async function fetchMemberAndCleanup(guild: Guild, userId: string, guildIsChilliAttackV2: boolean) {
	// Test server: use cache only to avoid API rate limits with fake users
	// Production servers: fetch from API and clean up if member left the server
	const member = guildIsChilliAttackV2
		? guild?.members.cache.get(userId) ?? null
		: await guild?.members.fetch(userId).catch(() => null);

	// Only delete birthdays for users who left (except on test server)
	if (!member && !guildIsChilliAttackV2) {
		await container.prisma.birthday.delete({ where: { userId_guildId: { guildId: guild.id, userId } } });
	}

	return member;
}

/**
 * Add field to embed if current description exceeds limit
 */
function addFieldIfNeeded(embed: APIEmbed, month: string, currentDescription: string, descriptionToAdd: string) {
	if (currentDescription.length + descriptionToAdd.length > EmbedLimits.MaximumFieldValueLength) {
		embed.fields?.push({ name: month, value: currentDescription });
		return '';
	}
	return currentDescription;
}

/**
 * Process a single month's birthdays and add them to the embed
 * Optimized with parallel member fetches for better performance
 */
async function processMonthBirthdays(
	guild: Guild,
	month: string,
	birthdays: Birthday[],
	embed: APIEmbed,
	guildIsChilliAttackV2: boolean,
) {
	// Fetch all members in parallel for better performance
	const memberPromises = birthdays.map((birthday) =>
		fetchMemberAndCleanup(guild, birthday.userId, guildIsChilliAttackV2),
	);
	const members = await Promise.all(memberPromises);

	let currentDescription = '';

	for (let i = 0; i < birthdays.length; i++) {
		const birthday = birthdays[i];
		const member = members[i];
		const { userId, birthday: dateOfTheBirthday } = birthday;

		if (!member && !guildIsChilliAttackV2) continue;

		const descriptionToAdd = `${userMention(userId)} ${formatDateForDisplay(dateOfTheBirthday)}\n`;
		currentDescription = addFieldIfNeeded(embed, month, currentDescription, descriptionToAdd);
		currentDescription += descriptionToAdd;
	}

	if (currentDescription.length > 0) {
		embed.fields?.push({ name: month, value: currentDescription });
	}
}

/**
 * Create the embed with the fields etc with the given values
 * @param guild - ID of the guild
 * @param birthdays - Array with all birthdays
 * @returns embed - Embed with the given values
 */
async function createEmbed(guild: Guild, birthdaySortByMonth: { month: string; birthdays: Birthday[] }[]) {
	const embed: APIEmbed = {
		title: `Birthday List - ${guild?.name ?? 'Unknown Guild'}`,
		description: `${ARROW_RIGHT}Register your Birthday with\n\`/birthday register <day> <month> [year]\``,
		fields: [],
		thumbnail: { url: IMG_CAKE },
	};

	if (isNullOrUndefinedOrEmpty(birthdaySortByMonth)) return generateDefaultEmbed(embed);

	const guildIsChilliAttackV2 = guild.id === GuildIDEnum.CHILLI_ATTACK_V2;

	for (const birthdayOfTheMonth of birthdaySortByMonth) {
		const { birthdays, month } = birthdayOfTheMonth;
		if (isNullOrUndefinedOrEmpty(birthdays)) continue;

		await processMonthBirthdays(guild, month, birthdays, embed, guildIsChilliAttackV2);
	}

	return generateDefaultEmbed(embed);
}

interface BirthdaysListWithMonth {
	month: string;
	birthdays: Birthday[];
}

/**
 * Create a List with 12 Birthday Arrays, one for every month.
 * @returns monthArray
 */
function prepareBirthdayList(): BirthdaysListWithMonth[] {
	const monthArray = [];
	for (let i = 1; i <= 12; i++) {
		const month = numberToMonthName(i);
		monthArray.push({ month, birthdays: [] });
	}
	return monthArray;
}

/**
 * sort all birthdays to the corresponding month object
 */
function prepareBirthdays(birthdays: Birthday[]): BirthdaysListWithMonth[] {
	const list = prepareBirthdayList();

	for (const birthday of birthdays) {
		const date = dayjs(birthday.birthday);
		if (!date.isValid()) continue;
		const month = date.month();
		list[month].birthdays.push(birthday);
	}
	return list;
}

function sortByDayAndMonth(birthdays: Birthday[]): Birthday[] {
	return birthdays.sort((firstBirthday, secondBirthday) => {
		const firstBirthdayDate = dayjs(firstBirthday.birthday);
		const secondBirthdayDate = dayjs(secondBirthday.birthday);

		return firstBirthdayDate.month() === secondBirthdayDate.month()
			? firstBirthdayDate.date() - secondBirthdayDate.date()
			: firstBirthdayDate.month() - secondBirthdayDate.month();
	});
}

/**
 * Split an array into chunks of a specified size
 * @param array - The array to split
 * @param chunkSize - The size of each chunk
 * @returns Array of chunks
 */
function chunkArray<T>(array: T[], chunkSize: number): T[][] {
	const chunks: T[][] = [];
	for (let i = 0; i < array.length; i += chunkSize) {
		chunks.push(array.slice(i, i + chunkSize));
	}
	return chunks;
}

/**
 * Bulk fetch all members and populate Discord.js cache
 * This dramatically reduces API calls from N (one per birthday) to 1 bulk fetch
 *
 * @param guild - The guild to fetch members from
 * @param birthdays - All birthdays to fetch members for
 * @param guildIsChilliAttackV2 - Whether this is the test server
 */
async function bulkFetchAndCacheMembers(
	guild: Guild,
	birthdays: Birthday[],
	guildIsChilliAttackV2: boolean,
): Promise<void> {
	// Test server: skip fetch, use cache only (fake users don't exist in API)
	if (guildIsChilliAttackV2) return;

	// Extract unique user IDs
	const userIds = [...new Set(birthdays.map((b) => b.userId))];

	// Skip if no users to fetch
	if (userIds.length === 0) return;

	try {
		// Bulk fetch all members at once - Discord.js will cache them automatically
		await guild.members.fetch({ user: userIds });
	} catch (error) {
		// If bulk fetch fails (e.g., rate limit, Discord API issue), it's not critical
		// Individual fetchMemberAndCleanup calls will still work as fallback
		console.warn('Bulk member fetch failed, falling back to individual fetches:', error);
	}
}

/**
 * Create paginated pages for all months with birthdays
 * Splits months into multiple pages if they exceed the maximum birthdays per page
 * Optimized with bulk member cache population to reduce API calls
 */
async function createBirthdayPages(
	guild: Guild,
	birthdaysByMonth: BirthdaysListWithMonth[],
	maxBirthdaysPerPage: number,
	paginatedMessage: PaginatedMessage,
): Promise<string[]> {
	const monthsWithBirthdays: string[] = [];

	// Optimization: Bulk fetch all members once to populate Discord.js cache
	// This reduces API calls from potentially hundreds to just 1
	const guildIsChilliAttackV2 = guild.id === GuildIDEnum.CHILLI_ATTACK_V2;
	const allBirthdays = birthdaysByMonth.flatMap((m) => m.birthdays);
	await bulkFetchAndCacheMembers(guild, allBirthdays, guildIsChilliAttackV2);

	// Now all createEmbed calls will hit cache instead of making API requests
	for (const monthData of birthdaysByMonth) {
		if (isNullOrUndefinedOrEmpty(monthData.birthdays)) continue;

		const birthdayChunks = chunkArray(monthData.birthdays, maxBirthdaysPerPage);

		for (let chunkIndex = 0; chunkIndex < birthdayChunks.length; chunkIndex++) {
			const chunk = birthdayChunks[chunkIndex];
			const isMultiPage = birthdayChunks.length > 1;
			const pageLabel = isMultiPage
				? `${monthData.month} (${chunkIndex + 1}/${birthdayChunks.length})`
				: monthData.month;

			monthsWithBirthdays.push(pageLabel);

			const embed = await createEmbed(guild, [{ month: monthData.month, birthdays: chunk }]);
			paginatedMessage.addPageEmbed(new EmbedBuilder(generateDefaultEmbed(embed)));
		}
	}

	return monthsWithBirthdays;
}

/**
 * Find the page index for the current month
 * Returns 0 if current month has no birthdays
 */
function findCurrentMonthPageIndex(
	birthdaysByMonth: BirthdaysListWithMonth[],
	currentMonth: number,
	maxBirthdaysPerPage: number,
): { pageIndex: number; hasBirthdays: boolean } {
	let pageCounter = 0;

	if (birthdaysByMonth.length === 0) {
		return { pageIndex: 0, hasBirthdays: false };
	}

	const upperBound = Math.min(currentMonth, birthdaysByMonth.length - 1);

	for (let i = 0; i <= upperBound; i++) {
		const monthData = birthdaysByMonth[i];

		if (!monthData || isNullOrUndefinedOrEmpty(monthData.birthdays)) continue;

		const monthPageCount = Math.ceil(monthData.birthdays.length / maxBirthdaysPerPage);

		if (i === currentMonth) {
			return { pageIndex: pageCounter, hasBirthdays: true };
		}

		pageCounter += monthPageCount;
	}

	return { pageIndex: 0, hasBirthdays: false };
}

/**
 * Add a note to the first page if current month has no birthdays
 */
function addEmptyMonthNote(
	paginatedMessage: PaginatedMessage,
	currentMonth: number,
	monthsWithBirthdays: string[],
): void {
	if (paginatedMessage.pages.length === 0) return;

	const firstPage = paginatedMessage.pages[0];

	// Handle only non-function pages that contain embeds
	if (firstPage && typeof firstPage !== 'function' && 'embeds' in firstPage && firstPage.embeds?.[0]) {
		const embed = firstPage.embeds[0] as EmbedBuilder;
		const existingDescription = embed.data.description ?? '';
		const note = `_Note: No birthdays in ${numberToMonthName(currentMonth + 1)} - showing ${
			monthsWithBirthdays[0]
		}_`;

		embed.setDescription(existingDescription ? `${existingDescription}\n\n${note}` : note);
	}
}
