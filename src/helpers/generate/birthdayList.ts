import type { Birthday } from '.prisma/client';
import { EmbedLimits } from '@sapphire/discord-utilities';
import { container } from '@sapphire/pieces';
import { isNullOrUndefinedOrEmpty } from '@sapphire/utilities';
import { userMention } from 'discord.js';
import { getGuildInformation, getGuildMember } from '../../lib/discord/guild';
import { GuildIDEnum } from '../../lib/enum/GuildID.enum';
import type { CustomEmbedModel } from '../../lib/model';
import { ARROW_RIGHT, IMG_CAKE, MAX_BIRTHDAYS } from '../provide/environment';
import { formatDateForDisplay, numberToMonthname } from '../utils/date';

export default async function generateBirthdayList(page_id: number, guild_id: string) {
	const allBirthdaysByGuild = await container.utilities.birthday.get.BirthdaysByGuildID(guild_id);
	if (!isNullOrUndefinedOrEmpty(allBirthdaysByGuild)) {
		// sort all birthdays by day and month
		const sortedBirthdays = sortByDayAndMonth(allBirthdaysByGuild);
		// split the sorted birthdays into multiple lists
		const splitBirthdayList = getBirthdaysAsLists(sortedBirthdays, MAX_BIRTHDAYS);
		// get the birthdays for the current page
		const birthdays = splitBirthdayList.birthdays[getIndexFromPage(page_id)];
		// TODO: Should only contain the birthdays for the current page (80 birthdays)

		const finalList = prepareBirthdays(birthdays);
		const embed = await createEmbed(guild_id, finalList);

		const components = generateComponents(page_id, splitBirthdayList.listAmount);
		return { embed: embed, components: components };
	} else {
		container.logger.info('no birthdays');
		const embed = await createEmbed(guild_id, []);
		return { embed: embed, components: [] };
	}
}

/**
 * Split the Birthday List into multiple lists
 * @param allBirthdays - Array with all guild birthdays
 * @param maxBirthdaysPerList - Number of max birthdays per list
 * @returns obj - Object
 * @returns obj.splitBirthdays - Array of Arrays with birthdays
 */
function getBirthdaysAsLists(allBirthdays: Array<Birthday>, maxBirthdaysPerList: number): { birthdays: Array<Array<Birthday>>; listAmount: number } {
	const length = allBirthdays.length;
	// split birthdays into arrays with max length x entries
	const splitBirthdays = [];
	for (let i = 0; i < length; i += maxBirthdaysPerList) splitBirthdays.push(allBirthdays.slice(i, i + maxBirthdaysPerList));

	return { birthdays: splitBirthdays, listAmount: splitBirthdays.length };
}

/**
 * Create the embed with the fields etc with the given values
 * @param guild_id - ID of the guild
 * @param birthdays - Array with all birthdays
 * @returns embed - Embed with the given values
 */
async function createEmbed(guild_id: string, allBirthdays: { monthname: string; birthdays: Array<Birthday> }[]) {
	const guild = await getGuildInformation(guild_id);
	const embed: CustomEmbedModel = {
		title: `Birthday List - ${guild?.name ?? 'Unknown Guild'}`,
		description: `${ARROW_RIGHT}Register your Birthday with\n\`/birthday register <day> <month> [year]\``,
		thumbnail_url: IMG_CAKE,
	};

	if (!allBirthdays.length) return embed;

	if (isNullOrUndefinedOrEmpty(embed.fields)) embed.fields = [];

	let currentDescription = '';

	for (const month of allBirthdays) {
		const { monthname } = month;
		if (isNullOrUndefinedOrEmpty(month.birthdays)) continue;
		// For each birthday in current month
		for (const birthday of month.birthdays) {
			const { user_id, birthday: bday } = birthday;
			const guild_member = guild_id === GuildIDEnum.CHILLI_ATTACK_V2 ? true : await getGuildMember(guild_id, user_id);
			if (isNullOrUndefinedOrEmpty(guild_member)) {
				await container.utilities.birthday.delete.ByGuildAndUser(guild_id, user_id);
				continue;
			}
			const descriptionToAdd = `${userMention(user_id)} ${formatDateForDisplay(bday)}\n`;
			if (currentDescription.length + descriptionToAdd.length > EmbedLimits.MaximumFieldValueLength) {
				// If the current description is too long, add it to the embed
				embed.fields.push({
					name: monthname,
					value: currentDescription,
				});
				currentDescription = '';
			}
			currentDescription += descriptionToAdd;
		}
		if (currentDescription.length > 0) {
			// If the current description is not empty, add it to the embed
			embed.fields.push({
				name: monthname,
				value: currentDescription,
			});
			currentDescription = '';
		}
	}
	return embed;
}
/**
 *  Generate Components for the Birthday List according to the amount of pages
 * @param page_id - Current page id
 * @param listAmount - Amount of pages
 * @returns Array with all components
 */
function generateComponents(page_id: number, listAmount: number): any[] {
	if (listAmount == 1) return [];
	const innerComponents = [];
	/*
    max 5 buttons per row
    if listAmount is bigger then 5, create multiple rows
    */
	// TODO: #45 Create Logic that enables for more then 5 buttons
	for (let i = 1; i <= listAmount; i++) {
		if (i > 5) break;
		const label = `${i}`;
		const isActive = i == page_id ? true : false;
		const disabled = isActive ? true : false;
		const style = isActive ? 1 : 2;
		innerComponents.push({
			style: style,
			label: label,
			custom_id: `birthday_list_page_${i}`,
			disabled: disabled,
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

/**
 * Create a List with 12 Birthday Arrays, one for every month.
 * @returns monthArray
 */
function prepareBirthdayList() {
	const monthArray = [];
	for (let i = 1; i <= 12; i++) {
		const monthname = numberToMonthname(i);
		const emptyArray: Birthday[] = [];
		monthArray.push({ monthname, birthdays: emptyArray });
	}
	return monthArray;
}

/**
 * sort all birthdays to the corresponding month object
 */
function prepareBirthdays(birthdays: Array<Birthday>): Array<{ monthname: string; birthdays: Array<Birthday> }> {
	const list = prepareBirthdayList();

	birthdays.forEach(function(singleBirthday) {
		const d = new Date(singleBirthday.birthday);
		if (d.toString() === 'Invalid Date') {
			return;
		}

		const month = d.getMonth();
		list[month].birthdays.push(singleBirthday);
	});

	return list;
}

function sortByDayAndMonth(arr: any[]) {
	arr.sort((a: { birthday: string }, b: { birthday: string }) => {
		const now = new Date();
		const dateA: Date = new Date(a.birthday);
		const dateB: Date = new Date(b.birthday);
		dateA.setFullYear(now.getFullYear());
		dateB.setFullYear(now.getFullYear());
		const firstDate = Number(dateA);
		const secondDate = Number(dateB);
		return firstDate - secondDate;
	});
	return arr;
}

// convert page_id into array index
function getIndexFromPage(page_id: number) {
	return page_id - 1;
}
