import { container } from '@sapphire/pieces';
import { DurationFormatter } from '@sapphire/time-utilities';
import { Guild, time } from 'discord.js';
import { sendMessage } from '../../lib/discord/message';
import { BotColorEnum } from '../../lib/enum/BotColor.enum';
import type { EmbedInformationModel } from '../../lib/model/EmbedInformation.model';
import generateEmbed from '../generate/embed';
import { BOT_NAME, BOT_SERVER_LOG, FAIL } from '../provide/environment';
import getGuildCount from '../provide/guildCount';

export default async function leaveServerLog(guild: Guild) {
	container.logger.info('Removed from Guild');
	const server_count = getGuildCount();
	const { id: guild_id, name, description, memberCount, ownerId, joinedTimestamp: rawJoinedTimestamp } = guild;
	const joinedAgo = time(Math.floor(rawJoinedTimestamp / 1000), 'f');
	const joinedDate = time(Math.floor(rawJoinedTimestamp / 1000), 'R');
	const timeServed = new DurationFormatter().format(Date.now() - rawJoinedTimestamp);
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
	if (rawJoinedTimestamp) fields.push({ name: 'GuildJoinedTimestamp', value: `${joinedDate}\n${joinedAgo}` });
	if (timeServed) fields.push({ name: 'TimeServed', value: `${timeServed}` });
	const embedObj: EmbedInformationModel = {
		title: `${FAIL} ${BOT_NAME} got removed from a Guild`,
		description: `I am now in \`${server_count}\` guilds`,
		fields: fields,
		color: BotColorEnum.BIRTHDAYY_DEV,
	};

	const embed = generateEmbed(embedObj);
	await sendMessage(BOT_SERVER_LOG, { embeds: [embed] });

	return;
}
