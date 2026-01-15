import type { Guild as PrismaGuild } from '@prisma/client';
import { container } from '@sapphire/framework';
import type { APIEmbed, APIEmbedField, Guild } from 'discord.js';
import { channelMention, roleMention, userMention } from 'discord.js';

import { objectEntries } from '@sapphire/utilities';
import { generateDefaultEmbed } from '../../lib/utils/embed';
import { ARROW_RIGHT, PLUS } from '../provide';

export default async function generateConfigList(guild: Guild): Promise<APIEmbed> {
	try {
		const embedFields = await generateFields(guild.id);

		return generateDefaultEmbed({
			title: `Config List - ${guild.name}`,
			description: 'Use /config `<setting>` `<value>` to change any setting',
			fields: embedFields,
		});
	} catch (error) {
		container.errorLogger.handle(error, {
			logSeverity: 'warn',
			guildId: String(guild),
		});

		return {
			title: `Config List - ${guild.name}`,
			description: 'An error occurred while loading guild config',
		};
	}
}
async function generateFields(guildId: string): Promise<APIEmbedField[]> {
	try {
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

		config ??= await container.utilities.guild.create({ guildId });

		return objectEntries(config).map(([name, value]) => {
			const valueString = getValueString(name, value);
			const nameString = getNameString(name);
			return {
				name: nameString,
				value: valueString,
				inline: false,
			};
		});
	} catch (error) {
		container.errorLogger.handle(error, {
			logSeverity: 'warn',
			guildId,
		});

		return [];
	}

	function getValueString(name: keyof PrismaGuild, value: string | number | boolean | null) {
		if (value === null) {
			return `${ARROW_RIGHT} not set`;
		} else if (name === 'timezone' && typeof value === 'number') {
			return value < 0 ? `${ARROW_RIGHT} UTC${value}` : `${ARROW_RIGHT} UTC+${value}`;
		} else if (name.includes('Channel') && typeof value === 'string') {
			return `${ARROW_RIGHT} ${channelMention(value)}`;
		} else if (name.includes('Role') && typeof value === 'string') {
			return `${ARROW_RIGHT} ${roleMention(value)}`;
		} else if (name.includes('User') && typeof value === 'string') {
			return `${ARROW_RIGHT} ${userMention(value)}`;
		}
		return `${ARROW_RIGHT} ${value.toString()}`;
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
				return `${PLUS} Birthday Message`;
			case 'premium':
				return 'Premium';
			default:
				return name;
		}
	}
}
