import { APIEmbed, APIEmbedField, channelMention, roleMention, userMention } from 'discord.js';
import { getGuildInformation } from '../../lib/discord/guild';
import { ARROW_RIGHT, PLUS } from '../provide/environment';
import generateEmbed from './embed';
import { container } from '@sapphire/pieces';
import type { Guild } from '.prisma/client';

export default async function generateConfigListEmbed(guildId: string): Promise<APIEmbed> {
	const guild = await getGuildInformation(guildId);
	const embedFields = await generateFields(guildId);
	const embed = {
		title: `Config List - ${guild!.name || 'Unknown Guild'}`,
		description: 'Use /config `<setting>` `<value>` to change any setting',
		fields: embedFields
	};

	return generateEmbed(embed);
}

async function generateFields(guildId: string) {
	let config = await container.utilities.guild.get.GuildConfig(guildId);

	if (!config) config = await container.utilities.guild.create({ guildId });

	const fields: APIEmbedField[] = [];

	Object.entries(config).forEach((_config) => {
		const [name, value] = _config as [keyof Guild, string | number | null];

		const exclude: (keyof Guild)[] = ['guildId', 'overviewMessage', 'logChannel'];
		if (exclude.includes(name)) return;
		const valueString = getValueString(name, value);
		const nameString = getNameString(name);
		fields.push({
			name: nameString,
			value: valueString,
			inline: false
		});
	});
	return fields;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getValueString(name: keyof Guild, value: string | number) {
	if (value === null) {
		return `${ARROW_RIGHT} not set`;
	} else if (name === 'timezone' && typeof value === 'number') {
		return value < 0 ? `${ARROW_RIGHT} UTC${value}` : `${ARROW_RIGHT} UTC+${value}`;
	} else if (name.includes('channel') && typeof value === 'string') {
		return `${ARROW_RIGHT} ${channelMention(value)}`;
	} else if (name.includes('role') && typeof value === 'string') {
		return `${ARROW_RIGHT} ${roleMention(value)}`;
	} else if (name.includes('user') && typeof value === 'string') {
		return `${ARROW_RIGHT} ${userMention(value)}`;
	}
	return `${ARROW_RIGHT} ${value}`;
}

function getNameString(name: keyof Guild): string {
	switch (name) {
		case 'announcementChannel':
			return 'Announcement Channel';
		case 'overviewChannel':
			return 'Overview Channel';
		case 'birthdayRole':
			return 'Birthday Role';
		case 'birthdayPingRole':
			return 'Birthday Ping Role';
		case 'logChannel':
			return 'Log Channel';
		case 'timezone':
			return 'Timezone';
		case 'announcementMessage':
			return `${PLUS} Birthday Message`;
		case 'premium':
			return 'Premium';
		default:
			return name;
	}
}
