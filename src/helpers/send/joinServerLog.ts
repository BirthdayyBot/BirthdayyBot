import { container } from '@sapphire/framework';
import { Guild, time } from 'discord.js';
import { sendMessage } from '../../lib/discord/message';
import { BotColorEnum } from '../../lib/enum/BotColor.enum';
import type { EmbedInformationModel } from '../../lib/model/EmbedInformation.model';
import generateEmbed from '../generate/embed';
import { BOT_NAME, BOT_SERVER_LOG, SUCCESS } from '../provide/environment';
import getGuildCount from '../provide/guildCount';

export default async function joinServerLog(guild: Guild) {
	container.logger.info('Joined Guild');
	const server_count = getGuildCount();
	const { id: guild_id, name, description, memberCount, ownerId, joinedTimestamp: rawJoinedTimestamp } = guild;
	const joinedTimestamp = time(Math.floor(rawJoinedTimestamp / 1000), 'f');
	const fields = [
		{ name: 'GuildName', value: `${name}` },
		{
			name: 'GuildID',
			value: `${guild_id}`,
		},
	];

	if (description) fields.push({ name: 'GuildDescription', value: `${description}` });
	if (memberCount) fields.push({ name: 'GuildMemberCount', value: `${memberCount}` });
	if (ownerId) fields.push({ name: 'GuildOwnerID', value: `${ownerId}` });
	if (rawJoinedTimestamp) fields.push({ name: 'GuildJoinedTimestamp', value: `${joinedTimestamp}` });

	const embedObj: EmbedInformationModel = {
		title: `${SUCCESS} ${BOT_NAME} got added to a Guild`,
		description: `I am now in \`${server_count}\` guilds`,
		fields: fields,
		color: BotColorEnum.BIRTHDAYY,
		thumbnail_url: guild.iconURL() ?? undefined,
	};
	const embed = await generateEmbed(embedObj);
	await sendMessage(BOT_SERVER_LOG, { embeds: [embed] });

	return;
}
