const lib = require('lib')({ token: process.env.STDLIB_SECRET_TOKEN });
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import { isNullOrUndefinedOrEmpty } from '@sapphire/utilities';

export default async function generateBirthdayList(page_id: number, guild_id: string) {
	let allBirthdaysByGuild = await getBirthdaysFromDatabase(guild_id);
	if (isNullOrUndefinedOrEmpty(allBirthdaysByGuild)) {
		let finalList = prepareList([]);
		let sortedBirthdays = sortByDayAndMonth(allBirthdaysByGuild.result);
		let splitBirthdayList = await getBirthdaysAsLists(sortedBirthdays);
		let listIndex = getIndexFromPage(page_id);
		let birthdays = splitBirthdayList.birthdays[listIndex];
		finalList = prepareBirthdays(birthdays, finalList);
		let embed = await createEmbed(guild_id, finalList);
		const components = generateComponents(page_id, splitBirthdayList.listAmount);
		return { embed: embed, components: components };
	} else {
		console.log('no birthdays');
		let embed = await createEmbed(guild_id, []);
		return { embed: embed, components: [] };
	}
}

async function getBirthdaysFromDatabase(guild_id: string) {
	return [
		{
			id: 1,
			user_id: '267614892821970945',
			birthday: '2003-12-12',
			username: 'Chillihero',
			discriminator: '0001',
			guild_id: '766707453994729532'
		},
		{ id: 18, user_id: '930931922606108733', birthday: '2009-05-29', username: null, discriminator: null, guild_id: '766707453994729532' }
	];
	return lib.chillihero['birthday-api'][`@${process.env.AUTOCODE_ENV}`].birthday.retrieve.entriesByGuild({ guild_id: guild_id });
}
