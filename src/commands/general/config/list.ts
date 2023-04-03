import { Command, RegisterSubCommand } from '@kaname-png/plugin-subcommands-advanced';
import type { Guild } from '@prisma/client';
import { container } from '@sapphire/framework';
import { objectEntries } from '@sapphire/utilities';
import { APIEmbedField, channelMention, roleMention, userMention } from 'discord.js';
import generateEmbed from '../../../helpers/generate/embed';
import { ARROW_RIGHT, PLUS } from '../../../helpers/provide/environment';
import replyToInteraction from '../../../helpers/send/response';
import thinking from '../../../lib/discord/thinking';

@RegisterSubCommand('config', (builder) =>
	builder.setName('list').setDescription('List all Birthdays in this Discord server'),
)
export class ListCommand extends Command {
	public override async chatInputRun(interaction: Command.ChatInputInteraction<'cached'>) {
		// TODO: Implement configList Command
		await thinking(interaction);

		const embedFields = await generateFields(interaction.guildId);

		const embed = generateEmbed({
			title: `Config List - ${interaction.guild.name}`,
			description: 'Use /config `<setting>` `<value>` to change any setting',
			fields: embedFields,
		});

		await replyToInteraction(interaction, { embeds: [embed] });
	}
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
}

function getValueString(name: keyof Guild, value: string | number | boolean | null) {
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
	return `${ARROW_RIGHT} ${value.toString()}`;
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
