import { getGuildInformation } from '../../lib/discord/guild';
import type { GuildConfigModel } from '../../lib/model';
import { getConfig } from '../provide/config';
import { ARROW_RIGHT, PLUS } from '../provide/environment';
import generateEmbed from './embed';

export default async function generateConfigListEmbed(guild_id: string): Promise<Object> {
    const guild = await getGuildInformation(guild_id);
    const embedFields = await generateFields(guild_id);
    const embed = {
        title: `Config List - ${guild!.name || 'Unknown Guild'}`,
        description: 'Use /config `<setting>` `<value>` to change any setting',
        fields: embedFields,
    };

    const finalEmbed = await generateEmbed(embed);
    return finalEmbed;
}

async function generateFields(guild_id: string): Promise<any[]> {
    const config: GuildConfigModel = await getConfig(guild_id);

    const fields: any[] = [];

    Object.entries(config).forEach(([name, value]) => {
        // TODO: #38 Implement guild logs
        if (['GUILD_ID', 'OVERVIEW_MESSAGE', 'LOG_CHANNEL'].includes(name)) return;
        const valueString = getValueString(name, value);
        const nameString = getNameString(name);
        fields.push({
            name: nameString,
            value: valueString,
            inline: false,
        });
    });
    return fields;
}

function getValueString(name: string, value: any) {
    let str: string;
    if (value === null) {
        str = `${ARROW_RIGHT} not set`;
    } else if (name === 'TIMEZONE') {
        str = value < 0 ? `${ARROW_RIGHT} UTC${value}` : `${ARROW_RIGHT} UTC+${value}`;
    } else if (name.includes('CHANNEL')) {
        str = `${ARROW_RIGHT} <#${value}>`;
    } else if (name.includes('ROLE')) {
        str = `${ARROW_RIGHT} <@&${value}>`;
    } else if (name.includes('USER')) {
        str = `${ARROW_RIGHT} <@${value}>`;
    } else {
        str = `${ARROW_RIGHT} ${value}`;
    }

    return str;
}

function getNameString(name: string): string {
    switch (name) {
    case 'ANNOUNCEMENT_CHANNEL':
        return 'Announcement Channel';
    case 'OVERVIEW_CHANNEL':
        return 'Overview Channel';
    case 'BIRTHDAY_ROLE':
        return 'Birthday Role';
    case 'BIRTHDAY_PING_ROLE':
        return 'Birthday Ping Role';
    case 'LOG_CHANNEL':
        return 'Log Channel';
    case 'TIMEZONE':
        return 'Timezone';
    case 'ANNOUNCEMENT_MESSAGE':
        return `${PLUS} Birthday Message`;
    case 'PREMIUM':
        return 'Premium';
    default:
        return name;
    }
}
