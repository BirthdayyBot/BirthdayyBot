import generateBirthdayMessage from '../../helpers/generate/birthdayMessage';
import generateEmbed from '../../helpers/generate/embed';
import { getConfig, logAll } from '../../helpers/provide/config';
import { ARROW_RIGHT, GIFT, IMG_CAKE, NEWS } from '../../helpers/provide/environment';
const lib = require('lib')({ token: process.env.STDLIB_SECRET_TOKEN });

//TODO: Correct Types, cleanup code

export default async function birthdayEvent(guild_id: string, birthday_child_id: string, isTest: boolean) {
	console.log('BirthdayEvent starts');
	console.log('BIRTHDAYCHILD: ', birthday_child_id);

	let config = await getConfig(guild_id);
	const { ANNOUNCEMENT_CHANNEL, BIRTHDAY_ROLE, UPDATE_CHANNEL, LOG_CHANNEL, OVERVIEW_MESSAGE, BIRTHDAY_PING_ROLE, ANNOUNCEMENT_MESSAGE, PREMIUM } =
		config;
	await logAll(config);

	//TODO: Desctruct file
	//Set Birthday Role
	if (BIRTHDAY_ROLE !== null) {
		await addCurrentBirthdayChildRole(birthday_child_id, BIRTHDAY_ROLE, guild_id, isTest, isTest);
	} else {
		// // console.log("No birthday role set for guild for guild");
	}

	if (ANNOUNCEMENT_CHANNEL !== null) {
		let description;
		if (PREMIUM === 1) {
			let m = await generateBirthdayMessage(ANNOUNCEMENT_MESSAGE, birthday_child_id, guild_id);
			description = m.message;
		} else {
			//default message
			description = `${ARROW_RIGHT} Today is a Special Day!
            ${GIFT} Please wish <@${birthday_child_id}> a Happy Birthday!`;
		}
		let embed = {
			title: `${NEWS} Birthday Announcement!`,
			description: description,
			thumbnail_url: IMG_CAKE
		};
		let content = BIRTHDAY_PING_ROLE !== null ? `<@&${BIRTHDAY_PING_ROLE}>` : ``;
		let birthdayEmbed = await generateEmbed(embed);

		await sendBirthdayAnnouncement(content, ANNOUNCEMENT_CHANNEL, birthdayEmbed);
	}
	console.log('sends ends');
	return true;
}

//Functions
async function addCurrentBirthdayChildRole(user_id: string, role_id: any, guild_id: string, isTest: boolean) {
	try {
		let addRole = await lib.discord.guilds['@release'].members.roles.update({
			role_id: role_id,
			user_id: user_id,
			guild_id: guild_id
		});
		console.log(`BIRTHDAY ROLE ADDED TO BDAY CHILD`);
		if (isTest === true) {
			await scheduleTestRoleRemoval(user_id, role_id, guild_id);
		} else {
			await scheduleRoleRemoval(user_id, role_id, guild_id);
		}
	} catch (error) {
		console.warn(`COULND'T ADD THE BIRTHDAY ROLE TO THE BIRTHDAY CHILD`);
		console.log('USERID: ', user_id);
		console.log('GUILDID: ', guild_id);
		//Send error message to log channel
	}
	return;
}

async function scheduleRoleRemoval(user_id: string, role_id: any, guild_id: string) {
	try {
		//https://docs.cronhooks.io/#introduction
		let req = await lib.meiraba.utils['@3.1.0'].timer.set({
			token: `${process.env.MEIRABA_TOKEN}`,
			time: 1440, //1440 are one day
			endpoint_url: `https://birthday-bot.chillihero.autocodgg/automate/removeRole/`,
			payload: {
				user_id: user_id,
				role_id: role_id,
				guild_id: guild_id
			}
		});
		console.log(`Scheduled Birthday Role removal: `, req);
	} catch (error) {
		console.warn(`something went wrong while trying to schedule a birtday removal!`);
		console.log('USERID: ', user_id);
		console.log('ROLEID: ', role_id);
		console.log('GUILDID: ', guild_id);
		console.warn(error);
	}
	return;
}
async function scheduleTestRoleRemoval(user_id: string, role_id: any, guild_id: string) {
	try {
		//https://docs.cronhooks.io/#introduction
		let req = await lib.meiraba.utils['@3.1.0'].timer.set({
			token: `${process.env.MEIRABA_TOKEN}`,
			time: 1, //Minutes
			endpoint_url: `https://birthday-bot.chillihero.autocodgg/automate/removeRole/`,
			payload: {
				user_id: user_id,
				role_id: role_id,
				guild_id: guild_id
			}
		});
		console.log(`Scheduled Test Birthday Role removal: `, req);
	} catch (error) {
		console.warn(`something went wrong while trying to schedule a test birtday removal!`);
		console.log('USERID: ', user_id);
		console.log('ROLEID: ', role_id);
		console.log('GUILDID: ', guild_id);
		console.warn(error);
	}
	return;
}

async function sendBirthdayAnnouncement(content: string, channel_id: any, birthdayEmbed: object) {
	// // console.log("CONTENT: ", content);
	try {
		let message = await lib.discord.channels['@release'].messages.create({
			channel_id: channel_id,
			content: `${content}`,
			embeds: [birthdayEmbed]
		});
		console.log(`Sent Birthday Announcement`);
		return message;
	} catch (error: any) {
		console.warn(`COULND'T SEND THE BIRTHDAY ANNOUNCEMENT FOR THE BIRTHDAY CHILD\n`, e);
		//Send error message to log channel
		if (error.essage.includes('Missing Access')) {
			//send Log to user
		}
		return;
	}
}
