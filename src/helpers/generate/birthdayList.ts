import type { Birthday } from '.prisma/client';
import { EmbedLimits, PaginatedMessage } from '@sapphire/discord.js-utilities';
import { container } from '@sapphire/pieces';
import { isNullOrUndefinedOrEmpty } from '@sapphire/utilities';
import { envParseNumber } from '@skyra/env-utilities';
import dayjs from 'dayjs';
import { EmbedBuilder, Guild, userMention, type APIEmbed } from 'discord.js';
import { GuildIDEnum } from '../../lib/enum/GuildID.enum';
import { generateDefaultEmbed } from '../../lib/utils/embed';
import { ARROW_RIGHT, IMG_CAKE } from '../provide/environment';
import { formatDateForDisplay, numberToMonthName } from '../utils/date';

/**
 * Generate a PaginatedMessage for interactive birthday list
 * Use this for slash commands where users can navigate between pages
 */
export async function generateBirthdayList(guild: Guild) {
	const birthdays = await container.prisma.birthday.findMany({ where: { guildId: guild.id } });

	const paginatedMessage = new PaginatedMessage();

	if (isNullOrUndefinedOrEmpty(birthdays)) {
		const emptyEmbed = await createEmbed(guild, []);
		paginatedMessage.addPageEmbed(new EmbedBuilder(generateDefaultEmbed(emptyEmbed)));
		return paginatedMessage;
	}

	// sort all birthdays by day and month
	const sortedBirthdays = sortByDayAndMonth(birthdays);
	// split the sorted birthdays into multiple lists
	const splitBirthdayList = getBirthdaysAsLists(sortedBirthdays, envParseNumber('MAX_BIRTHDAYS_PER_SITE', 80));

	// Create a page for each birthday list
	for (const birthdayPage of splitBirthdayList.birthdays) {
		const finalList = prepareBirthdays(birthdayPage);
		const embed = await createEmbed(guild, finalList);
		paginatedMessage.addPageEmbed(new EmbedBuilder(generateDefaultEmbed(embed)));
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
 * Split the Birthday List into multiple lists
 * @param allBirthdays - Array with all guild birthdays
 * @param maxBirthdaysPerList - Number of max birthdays per list
 * @returns obj - Object
 * @returns obj.splitBirthdays - Array of Arrays with birthdays
 */
function getBirthdaysAsLists(
	allBirthdays: Birthday[],
	maxBirthdaysPerList: number,
): { birthdays: Birthday[][]; listAmount: number } {
	const { length } = allBirthdays;
	// split birthdays into arrays with max length x entries
	const splitBirthdays = [];
	for (let i = 0; i < length; i += maxBirthdaysPerList)
		splitBirthdays.push(allBirthdays.slice(i, i + maxBirthdaysPerList));

	return { birthdays: splitBirthdays, listAmount: splitBirthdays.length };
}

/**
 * Fetch guild member and handle cleanup if member is not found
 */
async function fetchMemberAndCleanup(guild: Guild, userId: string, guildIsChilliAttackV2: boolean) {
	const member = guildIsChilliAttackV2
		? guild?.members.cache.get(userId) ?? null
		: await guild?.members.fetch(userId).catch(() => null);

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
 */
async function processMonthBirthdays(
	guild: Guild,
	month: string,
	birthdays: Birthday[],
	embed: APIEmbed,
	guildIsChilliAttackV2: boolean,
) {
	let currentDescription = '';

	for (const birthday of birthdays) {
		const { userId, birthday: dateOfTheBirthday } = birthday;
		const member = await fetchMemberAndCleanup(guild, userId, guildIsChilliAttackV2);

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
