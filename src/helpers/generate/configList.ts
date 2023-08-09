import type { Guild as PrismaGuild } from '@prisma/client';
import { container } from '@sapphire/framework';
import type { APIEmbed, Guild, Snowflake } from 'discord.js';

import { objectEntries } from '@sapphire/utilities';
import { channelMention, roleMention, userMention, type APIEmbedField } from 'discord.js';
import { getGuildInformation } from '../../lib/discord';
import { generateDefaultEmbed } from '../../lib/utils/embed';
import { BirthdayyEmojis } from '../provide/environment';

interface ConfigListOptions {
	guild?: Guild;
}

export default async function generateConfigList(guildId: Snowflake, options: ConfigListOptions): Promise<APIEmbed> {
	const embedFields = await generateFields(guildId);
	const guildInfo: Guild | null = options.guild ? options.guild : await getGuildInformation(guildId);
	if (!guildInfo) {
		return {
			title: `Config List - ${guildId}`,
			description: 'Guild Not Found, please report this to the developer',
		};
	}
	return generateDefaultEmbed({
		title: `Config List - ${guildInfo.name}`,
		description: 'Use /config `<setting>` `<value>` to change any setting',
		fields: embedFields,
	});
}
async function generateFields(guildId: string): Promise<APIEmbedField[]> {
	let config = await container.prisma.guild.findUnique({
		where: { guildId },
		select: {
			birthdayRole: true,
			birthdayPingRole: true,
			announcementChannel: true,
			announcementMessage: true,
			overviewChannel: true,
			timezone: true,
			language: true,
			premium: true,
		},
	});

	if (!config) config = await container.utilities.guild.create({ guildId });

	return objectEntries(config).map(([name, value]) => {
		const valueString = getValueString(name, value);
		const nameString = getNameString(name);
		return {
			name: nameString,
			value: valueString,
			inline: false,
		};
	});

	function getValueString(name: keyof PrismaGuild, value: string | number | boolean | null) {
		if (value === null) {
			return `${BirthdayyEmojis.ArrowRight} not set`;
		} else if (name === 'timezone' && typeof value === 'number') {
			return value < 0
				? `${BirthdayyEmojis.ArrowRight} UTC${value}`
				: `${BirthdayyEmojis.ArrowRight} UTC+${value}`;
		} else if (name.includes('Channel') && typeof value === 'string') {
			return `${BirthdayyEmojis.ArrowRight} ${channelMention(value)}`;
		} else if (name.includes('Role') && typeof value === 'string') {
			return `${BirthdayyEmojis.ArrowRight} ${roleMention(value)}`;
		} else if (name.includes('User') && typeof value === 'string') {
			return `${BirthdayyEmojis.ArrowRight} ${userMention(value)}`;
		}
		return `${BirthdayyEmojis.ArrowRight} ${value.toString()}`;
	}

	function getNameString(name: keyof PrismaGuild): string {
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
				return `${BirthdayyEmojis.Plus} Birthday Message`;
			case 'premium':
				return 'Premium';
			default:
				return name;
		}
	}
}
