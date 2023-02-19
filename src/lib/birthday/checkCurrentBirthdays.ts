import { NODE_ENV } from '../../helpers/provide/environment';
import { getCurrentDate } from '../../helpers/utils/date';
import birthdayEvent from './birthdayEvent';
const lib = require('lib')({ token: process.env.STDLIB_SECRET_TOKEN });

//https://autocode.com/mp/chillihero/birthday-bot/dev/?filename=functions%2Fbirthday%2FcheckTodaysBirthdays.js
/**
 * Check the current day's birthdays and send birthday messages
 *
 * @returns {Promise<void>}
 */
export default async function checkCurrentBirthdays(): Promise<void> {
	const today = getCurrentDate();

	// Retrieve today's birthdays from the birthday-api
	// ! For testing purposes only
	let checkTodaysBirthdays =
		NODE_ENV === 'development'
			? {
					result: [
						{
							id: 1342,
							user_id: '1063411719906529323',
							birthday: '2001-05-21',
							guild_id: '766707453994729532'
						}
					]
			  }
			: await lib.chillihero['birthday-api'][`@${process.env.AUTOCODE_ENV}`].birthday.retrieve.todaysBirthdays({
					birthday: today
			  });

	let todaysBirthdays = checkTodaysBirthdays.result;

	let birthdayCount = todaysBirthdays.length;
	console.log('birthdayCount', birthdayCount);
	if (birthdayCount !== 0) {
		console.time('BirthdayLoop Time');
		// If there are birthdays today, loop through and send messages
		for (let index = 0; index < birthdayCount; index++) {
			let birthday = todaysBirthdays[index];
			console.log('BIRTHDAYY LOOP: ', index + 1);
			await birthdayEvent(birthday.guild_id, birthday.user_id, false);
		}
	} else {
		console.log(`No Birthdays Today`);
	}
	console.timeEnd('BirthdayLoop Time');
	console.log('end');
}
