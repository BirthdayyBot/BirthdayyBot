import { formatBirthdayMessage } from '#utils/common/string';
import { Emojis } from '#utils/constants';
import { generateDefaultEmbed } from '#utils/embed';
import type { Guild as PrismaGuild } from '@prisma/client';
import { container } from '@sapphire/framework';
import { objectEntries } from '@sapphire/utilities';
import type { APIEmbed, Guild, GuildMember, Snowflake } from 'discord.js';
import { channelMention, roleMention, userMention, type APIEmbedField } from 'discord.js';

interface ConfigListOptions {
	member: GuildMember;
	guild?: Guild;
}

export default async function generateConfigList(guildId: Snowflake, options: ConfigListOptions): Promise<APIEmbed> {
	const embedFields = await generateFields(guildId, options.member);
	const guildInfo: Guild | null = options.guild ? options.guild : await container.client.guilds.fetch(guildId);
	if (!guildInfo) {
		return {
			title: `Config List - ${guildId}`,
			description: 'Guild Not Found, please report this to the developer'
		};
	}
	return generateDefaultEmbed({
		title: `Config List - ${guildInfo.name}`,
		description: 'Use /config `<setting>` `<value>` to change any setting',
		fields: embedFields
	});
}
async function generateFields(id: string, member: GuildMember): Promise<APIEmbedField[]> {
	const config = await container.prisma.guild.upsert({
		create: { id },
		where: { id },
		update: { id },
		select: {
			rolesBirthday: true,
			rolesNotified: true,
			channelsAnnouncement: true,
			messagesAnnouncement: true,
			channelsOverview: true,
			timezone: true,
			language: true,
			premium: true
		}
	});

	return objectEntries(config).map(([name, value]) => {
		const valueString = getValueString(name, value, member);
		const nameString = getNameString(name);
		return {
			name: nameString,
			value: valueString,
			inline: false
		};
	});

	function getValueString(name: keyof PrismaGuild, value: any, member: GuildMember) {
		if (value === null) {
			return `${Emojis.Arrow} not set`;
		} else if (name === 'timezone' && typeof value === 'number') {
			return value < 0 ? `${Emojis.Arrow} UTC${value}` : `${Emojis.Arrow} UTC+${value}`;
		} else if (name.includes('Channel') && typeof value === 'string') {
			return `${Emojis.Arrow} ${channelMention(value)}`;
		} else if (name.includes('Role') && typeof value === 'string') {
			return `${Emojis.Arrow} ${roleMention(value)}`;
		} else if (name.includes('User') && typeof value === 'string') {
			return `${Emojis.Arrow} ${userMention(value)}`;
		} else if (name === 'messagesAnnouncement' && typeof value === 'string') {
			return `${Emojis.Arrow} ${formatBirthdayMessage(value, member)}`;
		} else if (name === 'rolesNotified' && Array.isArray(value)) {
			return `${Emojis.Arrow} ${value.map((role) => roleMention(role)).join(', ')}`;
		}

		return `${Emojis.Arrow} ${value.toString()}`;
	}

	function getNameString(name: keyof PrismaGuild): string {
		switch (name) {
			case 'channelsAnnouncement':
				return 'Announcement Channel';
			case 'channelsOverview':
				return 'Overview Channel';
			case 'rolesBirthday':
				return 'Birthday Role';
			case 'rolesNotified':
				return 'Notified Role';
			case 'channelsLogs':
				return 'Log Channel';
			case 'timezone':
				return 'Timezone';
			case 'messagesAnnouncement':
				return `${Emojis.Plus} Birthday Message`;
			case 'premium':
				return 'Premium';
			default:
				return name;
		}
	}
}
