import type { Birthday } from '.prisma/client';
import { EmbedLimits } from '@sapphire/discord-utilities';
import { container } from '@sapphire/pieces';
import { isNullOrUndefinedOrEmpty } from '@sapphire/utilities';
import { userMention } from 'discord.js';
import { getGuildInformation, getGuildMember } from '../../lib/discord';
import { GuildIDEnum } from '../../lib/enum/GuildID.enum';
import type { CustomEmbedModel } from '../../lib/model';
import { ARROW_RIGHT, IMG_CAKE } from '../provide/environment';
import { formatDateForDisplay, numberToMonthName } from '../utils/date';
import { envParseNumber } from '@skyra/env-utilities';
import { generateDefaultEmbed } from '../../lib/utils/embed';
import dayjs from 'dayjs';

export async function generateBirthdayList(page_id: number, guild_id: string) {
	const guild = await container.prisma.guild.findUnique({
		where: { guildId: guild_id },
		include: { birthday: true },
	});

	if (!guild || !guild.birthday) return { embed: await createEmbed(guild_id, []), components: [] };

	// sort all birthdays by day and month
	const sortedBirthdays = sortByDayAndMonth(guild.birthday.filter((birthday) => !birthday.disabled));
	// split the sorted birthdays into multiple lists
	const splitBirthdayList = getBirthdaysAsLists(sortedBirthdays, envParseNumber('MAX_BIRTHDAYS_PER_SITE', 80));
	// get the birthdays for the current page
	const birthdays = splitBirthdayList.birthdays[getIndexFromPage(page_id)];
	// TODO: Should only contain the birthdays for the current page (80 birthdays)

	const finalList = prepareBirthdays(birthdays);
	const embed = await createEmbed(guild_id, finalList);

	const components = generateComponents(page_id, splitBirthdayList.listAmount);
	return { embed, components };
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
 * Create the embed with the fields etc with the given values
 * @param guildId - ID of the guild
 * @param birthdays - Array with all birthdays
 * @returns embed - Embed with the given values
 */
async function createEmbed(guildId: string, birthdaySortByMonth: { month: string; birthdays: Birthday[] }[]) {
	const guild = await getGuildInformation(guildId);
	const embed: CustomEmbedModel = {
		title: `Birthday List - ${guild?.name ?? 'Unknown Guild'}`,
		description: `${ARROW_RIGHT}Register your Birthday with\n\`/birthday register <day> <month> [year]\``,
		thumbnail_url: IMG_CAKE,
	};

	if (!birthdaySortByMonth.length) return generateDefaultEmbed(embed);

	if (isNullOrUndefinedOrEmpty(embed.fields)) embed.fields = [];

	let currentDescription = '';

	for (const birthdayOfTheMonth of birthdaySortByMonth) {
		const { birthdays, month } = birthdayOfTheMonth;
		if (isNullOrUndefinedOrEmpty(birthdays)) continue;
		// For each birthday in current month
		for (const birthday of birthdays) {
			const { userId, birthday: dateOfTheBirthday } = birthday;
			const member = await getGuildMember(guildId, userId);
			if (!member) {
				if (guildId === GuildIDEnum.CHILLI_ATTACK_V2) {
					// If the guild is Chilli Attack, skip the birthday
					continue;
				} else {
					// Delete the birthday if the member is not in the guild
					await container.prisma.birthday.delete({ where: { userId_guildId: { guildId, userId } } });
				}
			}
			const descriptionToAdd = `${userMention(userId)} ${formatDateForDisplay(dateOfTheBirthday)}\n`;
			if (currentDescription.length + descriptionToAdd.length > EmbedLimits.MaximumFieldValueLength) {
				// If the current description is too long, add it to the embed
				embed.fields.push({
					name: month,
					value: currentDescription,
				});
				currentDescription = '';
			}
			currentDescription += descriptionToAdd;
		}
		if (currentDescription.length > 0) {
			// If the current description is not empty, add it to the embed
			embed.fields.push({
				name: month,
				value: currentDescription,
			});
			currentDescription = '';
		}
	}
	return generateDefaultEmbed(embed);
}
/**
 *  Generate Components for the Birthday List according to the amount of pages
 * @param page_id - Current page id
 * @param listAmount - Amount of pages
 * @returns Array with all components
 */
function generateComponents(page_id: number, listAmount: number): any[] {
	if (listAmount === 1) return [];
	const innerComponents = [];
	/*
    max 5 buttons per row
    if listAmount is bigger then 5, create multiple rows
    */
	// TODO: #45 Create Logic that enables for more then 5 buttons
	for (let i = 1; i <= listAmount; i++) {
		if (i > 5) break;
		const label = `${i}`;
		const isActive = i === page_id ? true : false;
		const disabled = isActive ? true : false;
		const style = isActive ? 1 : 2;
		innerComponents.push({
			style,
			label,
			custom_id: `birthday_list_page_${i}`,
			disabled,
			type: 2,
		});
	}
	const components = [
		{
			type: 1,
			components: innerComponents,
		},
	];
	if (listAmount > 5) {
		components.push({
			type: 1,
			components: [
				{
					type: 2,
					style: 1,
					label: 'To many birthdays to show all.',
					disabled: true,
					custom_id: 'birthday_list_to_many',
				},
			],
		});
	}

	return components;
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
		const month = dayjs(birthday.birthday).month();
		list[month].birthdays.push(birthday);
	}
	return list;
}

function sortByDayAndMonth(birthdays: Birthday[]): Birthday[] {
	return birthdays.sort((firstBirthday, secondBirthday) =>
		dayjs(firstBirthday.birthday).diff(dayjs(secondBirthday.birthday)),
	);
}

// convert page_id into array index
function getIndexFromPage(page_id: number) {
	return page_id - 1;
}
