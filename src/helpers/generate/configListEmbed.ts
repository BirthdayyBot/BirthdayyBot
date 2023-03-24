import type { APIEmbed, APIEmbedField } from 'discord.js';
import { getGuildInformation } from '../../lib/discord/guild';
import { ARROW_RIGHT, PLUS } from '../provide/environment';
import generateEmbed from './embed';
import { container } from '@sapphire/framework';
import type { Guild } from '.prisma/client';

export default async function generateConfigListEmbed(guild_id: string): Promise<APIEmbed> {
	const guild = await getGuildInformation(guild_id);
	const embedFields = await generateFields(guild_id);
	const embed = {
		title: `Config List - ${guild!.name || 'Unknown Guild'}`,
		description: 'Use /config `<setting>` `<value>` to change any setting',
		fields: embedFields,
	};

	return generateEmbed(embed);
}


async function generateFields(guild_id: string) {
	let config = await container.utilities.guild.get.GuildConfig(guild_id);

	if (!config) config = await container.utilities.guild.create({ guild_id });

	const fields: APIEmbedField[] = [];

	Object.entries(config).forEach((_config) => {
		const [name, value] = _config as [keyof Guild, string | number | null];

		const exclude: (keyof Guild)[] = ['guild_id', 'overview_message', 'log_channel'];
		if (exclude.includes(name)) return;
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getValueString(name: keyof Guild, value: any) {
	let str: string;
	if (value === null) {
		str = `${ARROW_RIGHT} not set`;
	} else if (name === 'timezone') {
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

function getNameString(name: keyof Guild): string {
	switch (name) {
	case 'announcement_channel':
		return 'Announcement Channel';
	case 'overview_channel':
		return 'Overview Channel';
	case 'birthday_role':
		return 'Birthday Role';
	case 'birthday_ping_role':
		return 'Birthday Ping Role';
	case 'log_channel':
		return 'Log Channel';
	case 'timezone':
		return 'Timezone';
	case 'announcement_message':
		return `${PLUS} Birthday Message`;
	case 'premium':
		return 'Premium';
	default:
		return name;
	}
}