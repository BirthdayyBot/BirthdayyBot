import { container } from '@sapphire/framework';
import { getCurrentOffset } from '../../helpers/provide/currentOffset';
import { APP_ENV } from '../../helpers/provide/environment';
import birthdayEvent from './birthdayEvent';
const lib = require('lib')({ token: process.env.STDLIB_SECRET_TOKEN });

//https://autocode.com/mp/chillihero/birthday-bot/dev/?filename=functions%2Fbirthday%2FcheckTodaysBirthdays.js
/**
 * Check the current day's birthdays and send birthday messages
 *
 * @returns {Promise<void>}
 */
export default async function checkCurrentBirthdays(): Promise<void> {
	const o = await getCurrentOffset();
	const today = o.date;
	container.logger.info('today', today);
	const offset = o.offsetString;
	// Retrieve today's birthdays from the birthday-api
	let checkTodaysBirthdays =
		APP_ENV === 'prd'
			? await lib.chillihero['birthday-api'][`@${process.env.AUTOCODE_ENV}`].birthday.retrieve.entriesByDateAndTimezone({
					birthday: today,
					timezone: offset
			  })
			: {
					result: [
						{
							id: 1342,
							user_id: '1063411719906529323',
							birthday: '2001-05-21',
							guild_id: '766707453994729532'
						}
					]
			  };

	let todaysBirthdays = checkTodaysBirthdays.result;

	let birthdayCount = todaysBirthdays.length;
	container.logger.info('birthdayCount', birthdayCount);
	if (birthdayCount !== 0) {
		console.time('BirthdayLoop Time');
		// If there are birthdays today, loop through and send messages
		for (let index = 0; index < birthdayCount; index++) {
			let birthday = todaysBirthdays[index];
			container.logger.info('BIRTHDAYY LOOP: ', index + 1);
			await birthdayEvent(birthday.guild_id, birthday.user_id, false);
		}
	} else {
		container.logger.info(`No Birthdays Today`);
	}
	container.logger.info('end');
}
