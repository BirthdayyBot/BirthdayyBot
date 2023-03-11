import { container } from '@sapphire/framework';
import generateEmbed from '../../helpers/generate/embed';
import { APP_ENV, EXCLAMATION, HEART, SUCCESS, VOTE_CHANNEL_ID, VOTE_ROLE_ID } from '../../helpers/provide/environment';
import { sendDMMessage, sendMessage } from '../discord/message';
import { GuildIDEnum } from '../enum/GuildID.enum';
import type { VoteProvider } from '../types/VoteProvider.type';
import type { User } from 'discord.js';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const lib = require('lib')({ token: process.env.STDLIB_SECRET_TOKEN });

export default async function voteProcess(provider: VoteProvider, user_id: string): Promise<any> {
    const providerInfo = getProviderInfo(provider);
    const member = await container.client.users.fetch(user_id);
    // 1. Send DM
    await sendVoteDM(providerInfo, user_id);
    // 2. Message To Server
    await sendVoteAnnouncement(providerInfo, member);
    // 3. Update role
    await addVoteRole(user_id);
    // 4. Schedule role removal
    await scheduleRoleRemoval(VOTE_ROLE_ID, user_id, GuildIDEnum.BIRTHDAYY_HQ);
    return;
}

async function sendVoteDM(providerInfo: { name: string; url: string }, user_id: string) {
    const dmEmbed = {
        title: `${SUCCESS} You voted for Birthdayy on ${providerInfo.name}`,
        description: `Thank you so much for supporting me, you're the best ${HEART}`,
    };
    const dmEmbedObj = await generateEmbed(dmEmbed);
    const component = {
        type: 1,
        components: [
            {
                style: 3,
                label: '⏰ Remind Me in 12hrs',
                custom_id: 'remind-me-to-vote',
                disabled: false,
                type: 2,
            },
        ],
    };

    sendDMMessage(user_id, { embeds: [dmEmbedObj], components: [component] });
}

async function sendVoteAnnouncement(providerInfo: { name: string; url: string }, member: User) {
    const { username, discriminator } = member;
    const avatar_url = member.avatarURL() || member.defaultAvatarURL;
    const embed = {
        title: `${EXCLAMATION} New Vote on ${providerInfo.name}`,
        description: `\`${username}#${discriminator}\` has **voted** for Birthdayy!
      Use \`/vote\` or vote [here](${providerInfo.url}) directly.`,
        thumbnail_url: avatar_url,
    };
    const embedObj = await generateEmbed(embed);
    sendMessage(APP_ENV === 'prd' ? VOTE_CHANNEL_ID : '1077621363881300018', { embeds: [embedObj] });
}

/**
 * Adds the vote role to the user with the provided user ID
 * @param user_id - The ID of the user to add the vote role to
 * @returns A boolean indicating whether the role was added or not
 */
async function addVoteRole(user_id: string): Promise<boolean> {
    const user = await (await container.client.guilds.fetch(GuildIDEnum.BIRTHDAYY_HQ)).members.fetch(user_id);
    if (!user) return false;

    const role = await (await container.client.guilds.fetch(GuildIDEnum.BIRTHDAYY_HQ)).roles.fetch(VOTE_ROLE_ID);
    if (!role) return false;

    await user.roles.add(role);
    return true;
}

async function scheduleRoleRemoval(user_id: string, role_id: string, guild_id: string) {
    // TODO: #28 Implement a scheduler to remove the role after 12hrs
    return;
    console.time('scheduleRemoval');
    lib.chillihero['birthday-bot']['@dev'].automate.scheduleRoleRemoval({
        time: 720,
        user_id: user_id,
        role_id: role_id,
        guild_id: guild_id,
    });
    console.timeEnd('scheduleRemoval');
    return;
    try {
        const req = await lib.meiraba.utils['@3.1.0'].timer.set({
            token: `${process.env.MEIRABA_TOKEN}`,
            time: 720, // 1440 are one day
            endpoint_url: 'https://birthday-bot.chillihero.autocode.gg/automate/removeRole/',
            payload: {
                user_id: user_id,
                role_id: role_id,
                guild_id: guild_id,
            },
        });
        container.logger.info('Scheduled Vote Role removal: ', req);
    } catch (e) {
        container.logger.warn('something went wrong while trying to schedule a birtday removal!');
        container.logger.info('USERID: ', user_id);
        container.logger.info('ROLEID: ', role_id);
        container.logger.info('GUILDID: ', guild_id);
        container.logger.warn(e);
    }
    return;
}

function getProviderInfo(provider: VoteProvider) {
    switch (provider) {
    case 'topgg':
        return {
            name: 'TopGG',
            url: 'https://top.gg/bot/916434908728164372/vote',
        };

    case 'discordbotlist':
        return {
            name: 'Discord Bot List',
            url: 'https://discord-botlist.eu/vote/916434908728164372',
        };

    case 'discordlist':
        return {
            name: 'Discord List',
            url: 'https://discordlist.space/bot/916434908728164372/upvote',
        };
    }
}
