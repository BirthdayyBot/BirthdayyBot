import { getCurrentDate } from '../../helpers/utils/date';
import birthdayEvent from './event';
const lib = require('lib')({ token: process.env.STDLIB_SECRET_TOKEN });
//https://autocode.com/mp/chillihero/birthday-bot/dev/?filename=functions%2Fbirthday%2FcheckTodaysBirthdays.js
export default async function checkCurrentBirthdays() {
	const today = getCurrentDate();

	let checkTodaysBirthdays = await lib.chillihero['birthday-api'][`@${process.env.AUTOCODE_ENV}`].birthday.retrieve.todaysBirthdays({
		birthday: today
	});

	let todaysBirthdays = checkTodaysBirthdays.result;

	let birthdayCount = todaysBirthdays.length;
	console.log('birthdayCount', birthdayCount);
	if (birthdayCount !== 0) {
		console.time('BirthdayLoop Time');
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
