import { AUTOCODE_ENV } from '../provide/environment';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const lib = require('lib')({ token: process.env.STDLIB_SECRET_TOKEN });

export default async function generateBirthdayMessage(content: string, user_id: string, guild_id: string) {
    let message = content;
    const variables = [];

    if (message.match(/{USERNAME}/gi) || message.match(/{DISCRIMINATOR}/gi)) {
        // TODO: Use discordjs implementation
        const user = await lib.discord.users[AUTOCODE_ENV].retrieve({
            user_id: `${user_id}`,
        });
        if (message.match(/{USERNAME}/gi)) {
            message = replaceVariable(message, '{USERNAME}', user.username);
            variables.push('{USERNAME}');
        }
        if (message.match(/{DISCRIMINATOR}/gi)) {
            message = replaceVariable(message, '{DISCRIMINATOR}', user.discriminator);
            variables.push('{DISCRIMINATOR}');
        }
    }

    if (message.match(/{NEW_LINE}/gi)) {
        message = replaceVariable(message, '{NEW_LINE}', '\n');
        variables.push('{NEW_LINE}');
    }
    // also replace break if happened on accident //deprecated
    if (message.match(/{BREAK}/gi)) {
        message = replaceVariable(message, '{BREAK}', '\n');
        variables.push('{BREAK}');
    }

    if (message.match(/{MENTION}/gi)) {
        message = replaceVariable(message, '{MENTION}', `<@${user_id}>`);
        variables.push('{MENTION}');
    }

    if (message.match(/{SERVERNAME}/gi)) {
        const guild = await lib.discord.guilds[AUTOCODE_ENV].retrieve({
            guild_id: `${guild_id}`,
            with_counts: false,
        });
        message = replaceVariable(message, '{SERVERNAME}', guild.name);
        variables.push('{SERVERNAME}');
    }

    return {
        used_variables: variables, // TODO Statistics
        message: message,
    };
}

function replaceVariable(string: string, variable: string | RegExp, replacement: string) {
    const regex = new RegExp(variable, 'gi');
    return string.replace(regex, replacement);
}
