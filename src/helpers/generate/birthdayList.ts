// const lib = require('lib')({ token: process.env.STDLIB_SECRET_TOKEN });
import { isNullOrUndefinedOrEmpty } from '@sapphire/utilities';
import { ARROW_RIGHT, IMG_CAKE, MAX_BIRTHDAYS } from '../provide/environment';
import { getGuildInformation } from '../../lib/discord/guild';
import { getBeautifiedDate, numberToMonthname } from '../utils/date';
import { getBirthdaysByGuild } from '../provide/birthday';
import type { CustomEmbed } from '../../lib/model/CustomEmbed.model';

export default async function generateBirthdayList(page_id: number, guild_id: string) {
	const allBirthdaysByGuild = await getBirthdaysByGuild(guild_id);
	if (!isNullOrUndefinedOrEmpty(allBirthdaysByGuild)) {
		//sort all birthdays by day and month
		let sortedBirthdays = sortByDayAndMonth(allBirthdaysByGuild);
		//split the sorted birthdays into multiple lists
		let splitBirthdayList = getBirthdaysAsLists(sortedBirthdays, MAX_BIRTHDAYS);
		//get the birthdays for the current page
		let birthdays = splitBirthdayList.birthdays[getIndexFromPage(page_id)];

		const finalList = prepareBirthdays(birthdays);
		let embed = await createEmbed(guild_id, finalList);

		const components = generateComponents(page_id, splitBirthdayList.listAmount);
		return { embed: embed, components: components };
	} else {
		console.log('no birthdays');
		let embed = await createEmbed(guild_id, []);
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
function getBirthdaysAsLists(
	allBirthdays: Array<BirthdaWithUserModel>,
	maxBirthdaysPerList: number
): { birthdays: Array<Array<BirthdaWithUserModel>>; listAmount: number } {
	const length = allBirthdays.length;
	// split birthdays into arrays with max length x entries
	let splitBirthdays = [];
	for (let i = 0; i < length; i += maxBirthdaysPerList) {
		splitBirthdays.push(allBirthdays.slice(i, i + maxBirthdaysPerList));
	}
	return { birthdays: splitBirthdays, listAmount: splitBirthdays.length };
}

/**
 * Create the embed with the fields etc with the given values
 * @param {string} guild_id
 * @param {array} birthdays
 * @returns {object} embed
 */
async function createEmbed(guild_id: string, birthdays: Array<Array<BirthdaWithUserModel> | any[]>) {
	let guild = await getGuildInformation(guild_id);
	let embed: CustomEmbed = {
		title: `Birthday List - ${guild!.name || 'Unknown Guild'}`,
		description: `${ARROW_RIGHT}Register your Birthday with\n\`/birthday register <day> <month> [year]\``,
		thumbnail_url: IMG_CAKE
	};

	if (!birthdays.length) {
		return embed;
	}
	birthdays.forEach(function (element, index) {
		if (element.length) {
			let description = '';
			let monthname = numberToMonthname(index + 1);
			element.forEach(function (birthday: BirthdaWithUserModel) {
				let bd = getBeautifiedDate(birthday.birthday);
				description += `<@!${birthday.user_id}> ${bd}\n`;
			});
			description = description.slice(0, -1);
			//if description longer then 1024 characters split it into multiple fields

			//if embed.fields is undefined, create it
			if (isNullOrUndefinedOrEmpty(embed.fields)) {
				embed.fields = [];
			}

			if (description.length > 1024) {
				console.warn('More then 1024 characters in one field, splitting... Guild: ', guild_id);
				let splitDescription = description.split('\n');
				let firstHalf = splitDescription.slice(0, splitDescription.length / 2);
				let secondHalf = splitDescription.slice(splitDescription.length / 2, splitDescription.length);

				embed.fields?.push(
					{
						name: `${ARROW_RIGHT}${monthname}`,
						value: firstHalf.join('\n'),
						inline: false
					},
					{
						name: `${ARROW_RIGHT}${monthname}`,
						value: secondHalf.join('\n'),
						inline: false
					}
				);
			} else {
				embed.fields?.push({
					name: `${ARROW_RIGHT}${monthname}`,
					value: description,
					inline: false
				});
			}
		}
	});
	return embed;
}

/**
 *  Generate Components for the Birthday List according to the amount of pages
 * @param {number} page_id
 * @param {number} listAmount
 * @returns {array} components
 */
function generateComponents(page_id: number, listAmount: number): any[] {
	if (listAmount == 1) return []; //if only one page return empty
	let innerComponents = [];
	for (let i = 1; i <= listAmount; i++) {
		let label = `${i}`;
		let isActive = i == page_id ? true : false;
		let disabled = isActive ? true : false;
		let style = isActive ? 1 : 2;
		innerComponents.push({
			style: style,
			label: label,
			custom_id: `birthday_list_page_${i}`,
			disabled: disabled,
			type: 2
		});
	}

	return [
		{
			type: 1,
			components: innerComponents
		}
	];
}

/**
 * Create a List with 12 Birthday Arrays, one for every month.
 * @returns monthArray
 */
function prepareBirthdayList() {
	let monthArray = [];
	for (let i = 1; i <= 12; i++) {
		const emptyArray: BirthdaWithUserModel[] = [];
		monthArray.push(emptyArray);
	}
	return monthArray;
}

/**
 * sort all birthdays to the corresponding month object
 */
function prepareBirthdays(birthdays: Array<BirthdaWithUserModel>): Array<Array<BirthdaWithUserModel | {}>> {
	let list = prepareBirthdayList();
	birthdays.forEach(function (singleBirthday) {
		let d = new Date(singleBirthday.birthday);
		let month = d.getMonth();
		list[month].push(singleBirthday);
	});
	return list;
}

function sortByDayAndMonth(arr: any[]) {
	arr.sort((a: { birthday: string }, b: { birthday: string }) => {
		const now = new Date();
		let dateA: any = new Date(a.birthday);
		let dateB: any = new Date(b.birthday);
		dateA.setFullYear(now.getFullYear());
		dateB.setFullYear(now.getFullYear());
		return dateA - dateB;
	});
	return arr;
}

//convert page_id into array index
function getIndexFromPage(page_id: number) {
	return page_id - 1;
}
