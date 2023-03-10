import { container } from '@sapphire/framework';
import generateBirthdayMessage from '../../helpers/generate/birthdayMessage';
import generateEmbed from '../../helpers/generate/embed';
import { getConfig, logAll } from '../../helpers/provide/config';
import { IMG_CAKE, NEWS } from '../../helpers/provide/environment';
import { sendMessage } from '../discord/message';
import { addRoleToUser } from '../discord/role';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const lib = require('lib')({ token: process.env.STDLIB_SECRET_TOKEN });

// TODO: Correct Types, cleanup code

export default async function birthdayEvent(guild_id: string, birthday_child_id: string, isTest: boolean) {
    container.logger.info('BirthdayEvent starts');
    container.logger.info('BIRTHDAYCHILD: ', birthday_child_id);

    const config = await getConfig(guild_id);
    const { ANNOUNCEMENT_CHANNEL, BIRTHDAY_ROLE, BIRTHDAY_PING_ROLE, ANNOUNCEMENT_MESSAGE } = config;
    await logAll(config);

    if (BIRTHDAY_ROLE) {
        await addCurrentBirthdayChildRole(birthday_child_id, BIRTHDAY_ROLE, guild_id, isTest);
    }

    if (ANNOUNCEMENT_CHANNEL) {
        // let description;
        // if (PREMIUM) {
        // 	let m = await generateBirthdayMessage(ANNOUNCEMENT_MESSAGE, birthday_child_id, guild_id);
        // 	description = m.message;
        // } else {
        // 	//default message
        // 	description = `${ARROW_RIGHT} Today is a Special Day!
        //     ${GIFT} Please wish <@${birthday_child_id}> a Happy Birthday!`;
        // }
        const announcementMessage = await generateBirthdayMessage(ANNOUNCEMENT_MESSAGE, birthday_child_id, guild_id);
        const embed = {
            title: `${NEWS} Birthday Announcement!`,
            description: announcementMessage.message,
            thumbnail_url: IMG_CAKE,
        };
        const content = BIRTHDAY_PING_ROLE !== null ? `<@&${BIRTHDAY_PING_ROLE}>` : '';
        const birthdayEmbed = await generateEmbed(embed);

        await sendBirthdayAnnouncement(content, ANNOUNCEMENT_CHANNEL, birthdayEmbed);
    }
    container.logger.info('sends ends');
    return true;
}

/**
 * Add the  specified birthday role to the user specified, in the specified guild
 * @param {string} user_id - The id of the user to add the role to
 * @param {string} role_id - The id of the role to add to the user
 * @param {string} guild_id - The id of the guild the user and role belong to
 * @param {boolean} isTest - Whether or not the role is being added for testing purposes
 * @returns {Promise<void>}
 */
async function addCurrentBirthdayChildRole(user_id: string, role_id: any, guild_id: string, isTest: boolean) {
    try {
        await addRoleToUser(user_id, role_id, guild_id);
        container.logger.info('BIRTHDAY ROLE ADDED TO BDAY CHILD');
        await scheduleRoleRemoval(user_id, role_id, guild_id, isTest); // TODO: #9 Implement own timer
    } catch (error) {
        container.logger.warn('COULND\'T ADD THE BIRTHDAY ROLE TO THE BIRTHDAY CHILD');
        container.logger.info('USERID: ', user_id);
        container.logger.info('GUILDID: ', guild_id);
    }
}

/**
 * Schedules the removal of a role for a user in a given guild.
 * @param user_id - The id of the user to remove the role from.
 * @param role_id - The id of the role to be removed.
 * @param guild_id - The id of the guild where the role removal should take place.
 * @param isTest - If true, the role will be removed after 1 minute. Otherwise, it will be removed after 1440 minutes (1 day).
 */
async function scheduleRoleRemoval(user_id: string, role_id: any, guild_id: string, isTest = false) {
    return;
    try {
        // https://docs.cronhooks.io/#introduction
        const time = isTest ? 1 : 1440; // 1 minute or 1440 minutes (1 day)
        const req = await lib.meiraba.utils['@3.1.0'].timer.set({
            token: `${process.env.MEIRABA_TOKEN}`,
            time: time,
            endpoint_url: 'https://birthday-bot.chillihero.autocode.gg/automate/removeRole/',
            payload: {
                user_id: user_id,
                role_id: role_id,
                guild_id: guild_id,
            },
        });
        container.logger.info(`Scheduled ${isTest ? 'Test ' : ''}Birthday Role removal: `, req);
    } catch (error) {
        container.logger.warn(`something went wrong while trying to schedule a ${isTest ? 'test ' : ''}birtday removal!`);
        container.logger.info('USERID: ', user_id);
        container.logger.info('ROLEID: ', role_id);
        container.logger.info('GUILDID: ', guild_id);
        container.logger.warn(error);
    }
    return;
}

/**
 * Sends birthday announcement to the specified channel with the given content and embed
 * @param {string} content - The message content for the birthday announcement
 * @param {string} channel_id - The id of the channel to send the announcement to
 * @param {Object} birthdayEmbed - The embed object to include in the message
 * @returns {Promise<Message>} Returns the sent message object, or undefined if an error occurs
 */
async function sendBirthdayAnnouncement(content: string, channel_id: string, birthdayEmbed: object) {
    try {
        const message = await sendMessage(channel_id, {
            content: content,
            embeds: [birthdayEmbed],
        });
        container.logger.info('Sent Birthday Announcement');
        return message;
    } catch (error: any) {
        container.logger.warn('COULND\'T SEND THE BIRTHDAY ANNOUNCEMENT FOR THE BIRTHDAY CHILD\n', error);
        // Send error message to log channel
        if (error.message.includes('Missing Access')) {
            // send Log to user
        }
        return;
    }
}
